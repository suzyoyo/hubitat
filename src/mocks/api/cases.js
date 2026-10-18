// 案件相關的假 API
// 同一份案件資料，管理端和住戶端要看的內容不同，所以分成兩種整理方式：
//   presentForManagement：管委會、管理人員看的（完整）
//   presentForResident：  住戶看的（簡化的狀態、只給住戶看的進度說明）
import { diffDays, formatDate, formatDateTime, formatRelativeTime } from '@/lib/date'
import { CASE_SOURCES, CASE_STATUSES, CASE_VISIBILITY, cases } from '../data/cases'
import { ISSUE_CATEGORIES } from '../data/community'
import { equipment } from '../data/equipment'
import { notifications } from '../data/notifications'
import { tasks } from '../data/tasks'
import { users } from '../data/users'
import { vendors } from '../data/vendors'
import { areaName } from './community'
import { MOCK_NOW, MOCK_TODAY, delay } from './helpers'
import { findUser, userLabel } from './users'

// 是否未結案
function isOpen(item) {
  return CASE_STATUSES[item.status].isOpen
}

// 戶的顯示文字：{ building: 'A', unit: '6樓之3' } → 'A 棟 6樓之3'
export function unitLabel(unit) {
  return `${unit.building} 棟 ${unit.unit}`
}

// 這筆案件是不是代這位住戶的那一戶登記的（比對棟別＋戶號，同一戶的人都算）
function isMyHousehold(item, userId) {
  if (!item.reporterUnit) return false
  const user = findUser(userId)
  return user?.building === item.reporterUnit.building && user?.unit === item.reporterUnit.unit
}

// 案件的處理期限：案件自己不填期限，用交辦的完成期限（2026-10-18 和 013 定，PR #122）
//   有還沒完成的交辦（進行中或待確認）→ 那筆交辦的期限
//   沒有的話，用最後一筆已完成的交辦（已結案的案件也看得到當初的期限）
//   沒有交辦、交辦被撤回、交辦沒填期限 → 空字串（畫面寫「尚未設定」，也不會逾期）
//   回傳的是交辦的格式，例如 '2026-10-08T18:00'
export function caseDeadlineOf(item) {
  const caseTasks = tasks.filter((task) => task.caseId === item.id)
  const task =
    caseTasks.find((entry) => ['in_progress', 'reported'].includes(entry.status)) ??
    caseTasks.findLast((entry) => entry.status === 'done')
  return task?.deadline ?? ''
}

// 逾期幾天；沒逾期回傳 0
// 有處理期限、還沒結案、而且期限那天已經過了，才算逾期
export function caseOverdueDays(item) {
  const deadline = caseDeadlineOf(item)
  if (!deadline || !isOpen(item)) return 0
  const days = diffDays(deadline.split('T')[0], MOCK_TODAY)
  return days > 0 ? days : 0
}

// 通報人的顯示文字，例如「陳先生（B 棟 8 樓）」；管理人員登記的顯示職稱
// 委員或管理人員代住戶登記的，例如「李主委（代 A 棟 6樓之3）」
// 我的待辦（todos.js）的說明也會用到，所以 export
export function reporterLabel(item) {
  const user = findUser(item.reporterId)
  if (!user) return ''
  if (item.reporterUnit) return `${userLabel(item.reporterId)}（代 ${unitLabel(item.reporterUnit)}）`
  if (item.source === 'committee' || user.roles.includes('staff')) return userLabel(item.reporterId)
  const floor = user.unit.split('樓')[0] // '8樓之2' → '8'
  return `${user.name}（${user.building} 棟 ${floor} 樓）`
}

// 畫面上的「負責人」：實際處理這件事的人（docs/case-flow.md 第 3 節，2026-10-15）
//   資料上的負責人（assigneeId）是受理的人，不會換；這裡另外算出來給畫面顯示
//   待結案、結案了 → 按「完工驗收」的那個人（2026-10-16：待結案也是，負責人就是標示完工的人）
//   有交辦出去、還沒完成的（進行中或待確認）→ 交辦對象
//     被退回的還是進行中（請對方再做一次），所以還是交辦對象；交辦被撤回 → 換回受理的人
//   其他 → 受理的人
function handlerIdOf(item) {
  if (['to_verify', 'closed'].includes(item.status)) {
    return item.logs.findLast((log) => log.label === '完工驗收')?.actorId ?? item.assigneeId
  }
  const task = tasks.find(
    (entry) =>
      entry.caseId === item.id &&
      ['in_progress', 'reported'].includes(entry.status),
  )
  return task ? task.assigneeId : item.assigneeId
}

// 案件卡、待辦卡第二行的一句說明（2026-10-15 定，2026-10-16 案件列表的卡片也用）
//   放卡片上其他地方看不到的「誰、什麼時候、做到哪裡」，不重複徽章（狀態）和標題；畫面上只顯示一行
//   待受理         → 誰通報、多久以前：「陳先生（B 棟 8 樓）・2 小時前通報」
//   已派廠商       → 廠商＋預約到場時間：「大同電梯・10/3 14:00 到場」
//   受理了、沒廠商 → 誰受理：「張管理員受理・尚未派廠商」
//                    有交辦出去的寫交辦對象：「交辦給張管理員・尚未派廠商」（2026-10-18，PR #121 013 的意見）
// 待結案、已結案的寫法只有案件卡用，在 caseCardHint
export function caseHint(item) {
  if (item.status === 'pending') {
    const when = formatRelativeTime(item.reportedAt, MOCK_NOW) // 「2 小時前」「昨天 09:00」「9/25」
    // 「2 小時前」「剛剛」後面直接接「通報」；日期、時間後面空一格比較好讀
    const gap = when.endsWith('前') || when === '剛剛' ? '' : ' '
    return `${reporterLabel(item)}・${when}${gap}通報`
  }
  const name = vendorNameOf(item)
  if (name) return item.scheduledAt ? `${name}・${formatDateTime(item.scheduledAt)} 到場` : `${name}・尚未約到場時間`
  const handlerId = handlerIdOf(item)
  if (handlerId !== item.assigneeId) return `交辦給${userLabel(handlerId)}・尚未派廠商`
  return `${userLabel(item.assigneeId)}受理・尚未派廠商`
}

// 案件卡第三行的說明：除了 caseHint 的三種，再加上
//   待結案 → 誰、哪天完工驗收：「張管理員・9/25 完工驗收」（「待結案」徽章已經有了，不重複寫）
//   已結案 → 廠商（沒有廠商就寫負責人）＋結案日期：「大同電梯・9/12 結案」
function caseCardHint(item) {
  if (item.status === 'to_verify') {
    const who = userLabel(handlerIdOf(item))
    return item.completion?.at ? `${who}・${formatDate(item.completion.at)} 完工驗收` : `${who}已完工驗收`
  }
  if (item.status === 'closed') {
    const who = vendorNameOf(item) || userLabel(handlerIdOf(item))
    return item.closedAt ? `${who}・${formatDate(item.closedAt)} 結案` : `${who}・已結案`
  }
  return caseHint(item)
}

// 廠商名稱：名冊裡的用名冊的名字；自己打的（名冊裡沒有）存在案件的 vendorName
function vendorNameOf(item) {
  const vendor = vendors.find((entry) => entry.id === item.vendorId)
  return vendor ? vendor.name : (item.vendorName ?? '')
}

// 管理端看的案件
function presentForManagement(item) {
  const vendor = vendors.find((entry) => entry.id === item.vendorId)
  const device = equipment.find((entry) => entry.id === item.equipmentId)
  const overdueDays = caseOverdueDays(item)
  const handlerId = handlerIdOf(item)
  return {
    ...item,
    areaName: areaName(item.areaId),
    categoryLabel: ISSUE_CATEGORIES[item.category].label,
    statusLabel: CASE_STATUSES[item.status].label,
    isOpen: isOpen(item),
    reporterLabel: reporterLabel(item),
    assigneeLabel: item.assigneeId ? userLabel(item.assigneeId) : '', // 資料上的負責人（受理的人）
    // 畫面上的「負責人」：實際處理的人（見 handlerIdOf）；案件詳情、案件卡片都顯示這個
    handlerId: handlerId ?? '',
    handlerLabel: handlerId ? userLabel(handlerId) : '',
    hint: caseCardHint(item), // 案件卡第三行的一句說明
    // 名冊裡的廠商用名冊的名字；自己打的（名冊裡沒有）存在案件的 vendorName
    vendorName: vendor ? vendor.name : (item.vendorName ?? ''),
    equipmentName: device ? device.name : '',
    equipmentPlace: device ? device.place : '', // 設備的安裝位置，例如「A 棟 1 樓機房」
    supporterCount: item.supporters.length, // 附議戶數
    // 還沒完成的交辦（進行中或待確認）的編號；沒有就是空字串。有的話不能再交辦
    openTaskId: tasks.find((task) => task.caseId === item.id && ['in_progress', 'reported'].includes(task.status))?.id ?? '',
    deadline: caseDeadlineOf(item), // 處理期限（交辦的完成期限，見 caseDeadlineOf）；沒有是空字串
    isOverdue: overdueDays > 0,
    overdueDays,
    // 每筆紀錄補上「是誰做的」；沒有 actorId 的是系統自動產生的
    logs: item.logs.map((log) => ({
      ...log,
      actorLabel: log.actorId ? userLabel(log.actorId) : '好彼管家',
    })),
  }
}

// 住戶看的案件（通報）
// 只挑住戶需要的欄位，不會把負責人、廠商、內部紀錄給住戶
function presentForResident(item, userId) {
  // 只留有 residentText 的紀錄，並改用給住戶看的說明
  //   isEdit：是住戶自己修改的紀錄（「你修改了補充說明。」），不算管委會的回覆
  const timeline = item.logs
    .filter((log) => log.residentText)
    .map((log) => ({
      at: log.at,
      text: log.residentText,
      note: log.note ?? '', // 小字的補充，例如住戶改成了什麼內容；沒有就是空字串
      isEdit: log.label === RESIDENT_EDIT_LABEL,
    }))
  const replies = timeline.filter((record) => !record.isEdit) // 管委會、管理人員的回覆
  const latest = replies.at(-1) // 最新的回覆

  return {
    id: item.id,
    place: item.place,
    subject: item.subject,
    displayTitle: `${item.place}｜${item.subject}`,
    visibility: item.isPrivate ? 'private' : 'public', // 對應 CASE_VISIBILITY
    // 公開狀態的顯示文字，例如「公共區域・公開顯示」
    visibilityLabel: CASE_VISIBILITY[item.isPrivate ? 'private' : 'public'].note,
    status: item.status,
    statusLabel: CASE_STATUSES[item.status].residentLabel,
    isOpen: isOpen(item),
    description: item.description,
    photos: item.photos,
    submittedAt: item.reportedAt,
    // 更新時間：最後一筆紀錄（包含自己修改的）
    updatedAt: timeline.at(-1)?.at ?? item.reportedAt,
    latestReply: latest,
    timeline,
    // 處理進度的三個階段各自的時間；還沒到的階段是 null
    steps: {
      receivedAt: item.reportedAt,
      // 第一筆是「已收到」，第二筆回覆是受理；自己修改的不算
      processingAt: item.status === 'pending' ? null : (replies[1]?.at ?? null),
      doneAt: item.closedAt ?? null,
    },
    supporterCount: item.supporters.length,
    // 是我（或我這一戶被代登記）通報的，還是我按了「我也遇到了」
    isMine: item.reporterId === userId || isMyHousehold(item, userId),
    // 是不是管委會、管理人員代我這一戶登記的（只能看，不能修改）
    isOnBehalf: isMyHousehold(item, userId),
    // 卡片、詳情頁顯示的文字：'管委會代為登記' / '管理人員代為登記'；不是代我這一戶登記的就是空字串
    onBehalfLabel: isMyHousehold(item, userId) ? `${item.source === 'staff' ? '管理人員' : '管委會'}代為登記` : '',
    hasSupported: item.supporters.includes(userId), // 我按過「我也遇到了」
    // 能不能修改：要是我自己通報的，而且還沒結案
    canEdit: item.reporterId === userId && isOpen(item),
  }
}

// ── 管理端 ────────────────────────────────────────────────

// 取得案件列表（管委會、管理人員用）
// filters 可以傳：
//   status   'open' 未結案（預設）/ 'all' 全部 / 或單一狀態，例如 'pending'
//   areaId   只看某個範圍
//   category 只看某個分類
// 排序：逾期的排最前面，其餘依通報時間，新的在前
export async function getCases(filters = {}) {
  await delay()
  const { status = 'open', areaId, category } = filters
  return cases
    .filter((item) => {
      if (status === 'open' && !isOpen(item)) return false
      if (status !== 'open' && status !== 'all' && item.status !== status) return false
      if (areaId && item.areaId !== areaId) return false
      if (category && item.category !== category) return false
      return true
    })
    .map(presentForManagement)
    .toSorted((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1
      return b.reportedAt.localeCompare(a.reportedAt)
    })
}

// 取得單一案件的詳情（管委會、管理人員用）
export async function getCaseById(id) {
  await delay()
  const item = cases.find((entry) => entry.id === id)
  if (!item) return undefined
  return presentForManagement(item)
}

// ── 管理端的動作：受理 → 派廠商 → 處理紀錄 → 完工驗收 → 結案 ──────────
// 規則見 docs/case-flow.md（2026-10-15 和 013 定案）
// 下面都只改記憶體裡的資料，重新整理網頁會變回原本的假資料
// 不能做的時候（沒有權限、狀態不對）回傳 undefined，成功回傳更新後的案件（管理端的樣子）

// 這個人能不能結案：只有主委、副主委（2026-10-15 改，原本是案件負責人；管理人員完工驗收後一律交給他們結案）
export function canCloseCases(userId) {
  return ['chair', 'viceChair'].includes(findUser(userId)?.committeeTitle)
}

// 這個人能不能處理案件（受理、派廠商、寫處理紀錄、完工驗收）：主委、副主委、管理人員
export function canHandleCases(userId) {
  const user = findUser(userId)
  if (!user) return false
  if (user.roles.includes('staff')) return true
  return ['chair', 'viceChair'].includes(user.committeeTitle)
}

// 住戶看到的「誰」：管理人員做的寫「管理人員」，委員做的寫「管委會」
function handlerWord(userId) {
  return findUser(userId)?.roles.includes('staff') ? '管理人員' : '管委會'
}

// 找出「這個人可以處理、而且現在是這個狀態」的案件；找不到回傳 undefined
// statuses 是允許的狀態，例如 ['pending']
function findHandleableCase(id, userId, statuses) {
  const item = cases.find((entry) => entry.id === id)
  if (!item || !canHandleCases(userId) || !statuses.includes(item.status)) return undefined
  return item
}

// 在案件上加一筆處理紀錄；residentText 沒傳就不給住戶看
function addLog(item, userId, label, text, residentText = '') {
  const log = { at: MOCK_NOW, actorId: userId, label, text }
  if (residentText) log.residentText = residentText
  item.logs.push(log)
}

// 關聯設備的狀態跟著案件變（沒有關聯設備就不做）
//   'needs_repair' 待維修（受理時）/ 'normal' 正常使用中（結案時）
//   「維修中」不存在資料裡：廠商到場那天才算，由設備的假 API 用日期算（equipmentDisplayStatus）
function setEquipmentStatus(item, status) {
  const device = equipment.find((entry) => entry.id === item.equipmentId)
  if (device) device.status = status
}

// 受理：待受理 → 已受理，受理的人就是負責人
//   options 都是選填（處理期限不在這裡填，用交辦的完成期限，見 caseDeadlineOf）：
//     category    問題分類，例如 'equipment'（住戶通報時先歸「其他」，這時改成正確的）
//     equipmentId 關聯設備，例如 'e-001'（有選的話設備變「待維修」，結案時進維修歷史）
export async function acceptCase(id, userId, options = {}) {
  await delay()
  const item = findHandleableCase(id, userId, ['pending'])
  if (!item) return undefined
  item.status = 'accepted'
  item.assigneeId = userId
  if (options.category) item.category = options.category
  if (options.equipmentId) item.equipmentId = options.equipmentId
  setEquipmentStatus(item, 'needs_repair')
  addLog(item, userId, '已受理', `${userLabel(userId)}受理`, `${handlerWord(userId)}已受理。`)
  notifyResidents(item, 'accepted')
  return presentForManagement(item)
}

// 記下廠商「第一次到場」的時間，設備從這天起算「維修中」
// 廠商已經來過（第一次到場的時間已經過了）就不改：例如 10/3 來過、改約 10/5，10/4 還是維修中
// 還沒來過就跟著新的預約改（換廠商、改期都算）；沒有預約時間就拿掉
function setFirstVisit(item, scheduledAt) {
  if (item.firstVisitAt && item.firstVisitAt <= MOCK_NOW) return
  if (scheduledAt) item.firstVisitAt = scheduledAt
  else delete item.firstVisitAt
}

// ── 問題分類、關聯設備、派廠商、處理紀錄 ─────────────────────────────
// 下面四個 apply… 只改案件、不寫紀錄，回傳這次做了什麼（寫紀錄用）；不能做回傳 undefined
//   text  單獨寫一筆紀錄時用的一句話，例如「指派 大同電梯，預約 10/3 14:00 到場」
//   lines 「更新進度」合成一筆時用的精簡寫法，一項一行，例如 ['廠商：大同電梯', '到場：10/3 14:00']
// 單獨用的 setCaseEquipment、assignVendor、addCaseLog 各寫一筆紀錄；
// 案件詳情的「更新進度」用 updateCase，一次做完只寫一筆（2026-10-15）

// 關聯設備：設備一律先設成待維修；「維修中」不存在資料裡，從廠商第一次到場那天起由設備的假 API 用日期算
//   換掉的那台變回正常使用中。結案時，這台設備的維修紀錄會多一筆（見 closeItem）
function applyEquipment(item, equipmentId) {
  const device = equipment.find((entry) => entry.id === equipmentId)
  if (!device) return undefined
  if (item.equipmentId && item.equipmentId !== equipmentId) setEquipmentStatus(item, 'normal')
  item.equipmentId = equipmentId
  setEquipmentStatus(item, 'needs_repair')
  return { text: `關聯設備「${device.name}」`, lines: [`關聯設備：${device.name}`] }
}

// 派廠商：狀態 → 處理中；住戶看到的不寫廠商名稱
function applyVendor(item, { vendorId = '', vendorName = '', scheduledAt = '' }) {
  const listed = vendors.find((entry) => entry.id === vendorId)
  const name = listed ? listed.name : vendorName.trim()
  if (!name) return undefined
  // 同一家廠商、原本有約、只改時間＝改期（2026-10-18 suzy 在 #132 提的：住戶不會只在通知看到，要寫進處理進度）
  const sameVendor = listed ? item.vendorId === listed.id : !item.vendorId && item.vendorName === name
  const isReschedule = sameVendor && Boolean(item.scheduledAt) && Boolean(scheduledAt) && scheduledAt !== item.scheduledAt
  item.status = 'in_progress'
  if (listed) {
    item.vendorId = listed.id
    delete item.vendorName
  } else {
    delete item.vendorId
    item.vendorName = name
  }
  if (scheduledAt) item.scheduledAt = scheduledAt
  else delete item.scheduledAt // 換廠商又沒填時間，就不要留著上一家的預約
  setFirstVisit(item, scheduledAt)
  if (isReschedule) {
    return {
      text: `${name} 改期，預約 ${formatDateTime(scheduledAt)} 到場`,
      lines: [`廠商改期：${formatDateTime(scheduledAt)} 到場`],
      residentText: rescheduleText(scheduledAt),
    }
  }
  return {
    text: scheduledAt ? `指派 ${name}，預約 ${formatDateTime(scheduledAt)} 到場` : `指派 ${name}`,
    lines: scheduledAt ? [`廠商：${name}`, `到場：${formatDateTime(scheduledAt)}`] : [`廠商：${name}`],
    residentText: scheduledAt ? `已安排廠商，預計 ${formatDate(scheduledAt)} 到場。` : '已安排廠商處理。',
  }
}

// 改期時給住戶看的一句（住戶不會收到通知，靠處理進度看到新的日期，case-flow 第 5 節）
function rescheduleText(scheduledAt) {
  return `廠商改期，預計 ${formatDate(scheduledAt)} 到場。`
}

// 處理紀錄：改期時同時更新預約到場時間
//   改期了、但沒寫給住戶看的說明 → 自動補「廠商改期，預計 10/5 到場。」，住戶的處理進度才看得到新日期
function applyLog(item, { text, residentText = '', scheduledAt = '' }) {
  if (!text?.trim()) return undefined
  if (scheduledAt) {
    const changed = scheduledAt !== item.scheduledAt
    item.scheduledAt = scheduledAt
    setFirstVisit(item, scheduledAt)
    if (changed && !residentText.trim()) residentText = rescheduleText(scheduledAt)
  }
  // 「更新進度」的紀錄多一行「給住戶：…」，管理端才看得到這次給住戶看了什麼（有寫才有）
  const lines = residentText.trim() ? [text.trim(), `給住戶：${residentText.trim()}`] : [text.trim()]
  return { text: text.trim(), lines, residentText: residentText.trim() }
}

// 問題分類（2026-10-17 加）：住戶通報時先歸「其他」，受理後在案件詳情改成正確的
//   category 例如 'leak'（ISSUE_CATEGORIES 的 key）；給管理端看的，住戶看到的處理進度不寫（沒有 residentText）
function applyCategory(item, category) {
  if (!ISSUE_CATEGORIES[category] || category === item.category) return undefined
  item.category = category
  return { lines: [`問題分類：${ISSUE_CATEGORIES[category].label}`] }
}

// 關聯設備：已受理、處理中的案件可以選（或換）是哪一台設備壞了
export async function setCaseEquipment(id, userId, equipmentId) {
  await delay()
  const item = findHandleableCase(id, userId, ['accepted', 'in_progress'])
  const done = item && applyEquipment(item, equipmentId)
  if (!done) return undefined
  addLog(item, userId, '關聯設備', `${userLabel(userId)}${done.text}`)
  return presentForManagement(item)
}

// 派廠商：已受理、處理中 → 處理中（處理中也可以換廠商）
//   vendorId    名冊裡的廠商，例如 'v-001'
//   vendorName  名冊裡沒有的廠商，自己打的名字，例如 '順達環保'（vendorId 和 vendorName 傳一個就好）
//               先只記在案件上；之後要自動加進廠商名冊、出現「需補資料」待辦（CLAUDE.md 待辦提醒）
//   scheduledAt 預約到場時間，例如 '2026-10-03T14:00'（選填）
export async function assignVendor(id, userId, vendor) {
  await delay()
  const item = findHandleableCase(id, userId, ['accepted', 'in_progress'])
  const done = item && applyVendor(item, vendor)
  if (!done) return undefined
  addLog(item, userId, '派廠商', `${userLabel(userId)}${done.text}`, done.residentText)
  return presentForManagement(item)
}

// 寫一筆處理紀錄（還沒結案的都可以寫）
//   text         管理端看的內容（可以寫廠商、報價這些細節），必填
//   residentText 給住戶看的一句，選填；沒寫就不給住戶看
//   scheduledAt  改期時填新的預約到場時間，選填
export async function addCaseLog(id, userId, log) {
  await delay()
  const item = findHandleableCase(id, userId, ['accepted', 'in_progress', 'to_verify'])
  const done = item && applyLog(item, log)
  if (!done) return undefined
  addLog(item, userId, '處理紀錄', done.text, done.residentText)
  return presentForManagement(item)
}

// 更新進度（案件詳情底部的按鈕）：問題分類、關聯設備、派廠商、處理紀錄有填的一次做完，**只寫一筆紀錄**
//   changes 四個都選填，至少要有一個：
//     category    問題分類，例如 'leak'（2026-10-17 加）
//     equipmentId 關聯設備（和 setCaseEquipment 一樣）
//     vendor      { vendorId, vendorName, scheduledAt }（和 assignVendor 一樣）
//     log         { text, residentText, scheduledAt }（和 addCaseLog 一樣）
//   紀錄：「更新進度」，內容一項一行、不寫是誰按的（受理、交辦之後就知道是誰在處理；紀錄的 actorId 還是有記），例如
//     關聯設備：揚水馬達
//     廠商：欣欣機電
//     到場：10/21 09:10
//     我改了時間和地點
//     給住戶：廠商將於 10/21 到場處理。（處理紀錄有寫給住戶看的說明才有這行）
//   住戶看到：派廠商、處理紀錄給住戶看的那幾句接在一起（都沒有就不給住戶看）
// 待結案的案件只能寫處理紀錄（設備、廠商不能改了）；有一樣做不了就全部不做，回傳 undefined
export async function updateCase(id, userId, { category = '', equipmentId = '', vendor = null, log = null } = {}) {
  await delay()
  const statuses = category || equipmentId || vendor ? ['accepted', 'in_progress'] : ['accepted', 'in_progress', 'to_verify']
  const item = findHandleableCase(id, userId, statuses)
  if (!item || !(category || equipmentId || vendor || log)) return undefined
  // 先檢查做得到，再改資料，才不會改到一半
  if (category && !ISSUE_CATEGORIES[category]) return undefined
  if (equipmentId && !equipment.some((entry) => entry.id === equipmentId)) return undefined
  if (vendor && !vendors.some((entry) => entry.id === vendor.vendorId) && !vendor.vendorName?.trim()) return undefined
  if (log && !log.text?.trim()) return undefined
  const steps = [
    category && applyCategory(item, category),
    equipmentId && applyEquipment(item, equipmentId),
    vendor && applyVendor(item, vendor),
    log && applyLog(item, log),
  ].filter(Boolean)
  if (!steps.length) return undefined // 什麼都沒變（例如選回原本的分類），不寫紀錄
  const text = steps.flatMap((step) => step.lines).join('\n')
  const residentText = steps.map((step) => step.residentText).filter(Boolean).join(' ')
  addLog(item, userId, '更新進度', text, residentText)
  return presentForManagement(item)
}

// 結案（closeCase 和「負責人自己完工驗收」共用）：狀態改成已結案，並把後續的事一起做完
//   cost 維修費用，只有委員填得了；note 結案說明，寫在「已結案」那筆紀錄裡（管理端看得到，住戶看不到）
function closeItem(item, userId, cost, note = '') {
  item.status = 'closed'
  item.closedAt = MOCK_NOW
  // 連到這件案件、等確認的交辦，一起確認完成
  for (const task of tasks) {
    if (task.caseId === item.id && task.status === 'reported') {
      task.status = 'done'
      task.doneAt = MOCK_NOW
    }
  }
  // 有關聯設備：設備變回正常，維修紀錄多一筆（費用只有委員填得了，管理人員看不到費用）
  const device = equipment.find((entry) => entry.id === item.equipmentId)
  if (device) {
    device.status = 'normal'
    const allRecords = equipment.flatMap((entry) => entry.records)
    const maxNumber = Math.max(0, ...allRecords.map((record) => Number(record.id.slice(3))))
    const record = {
      id: `er-${String(maxNumber + 1).padStart(3, '0')}`,
      date: MOCK_TODAY,
      type: 'repair',
      title: item.title,
      caseId: item.id,
    }
    // 名冊裡的廠商記編號，自己打的記名字
    if (item.vendorId) record.vendorId = item.vendorId
    else if (item.vendorName) record.vendorName = item.vendorName
    const isCommittee = findUser(userId)?.roles.includes('committee')
    if (isCommittee && cost > 0) record.cost = cost
    device.records.unshift(record) // 紀錄是新的在前
  }
  // 有結案說明的話多一行，例如「李主委結案」下面一行「費用已付清」
  const text = note ? `${userLabel(userId)}結案\n${note}` : `${userLabel(userId)}結案`
  addLog(item, userId, '已結案', text, '已完成維修，感謝你的通報。')
  notifyResidents(item, 'closed')
}

// 受理、結案時通知住戶（結案 2026-10-16、受理 2026-10-18，case-flow 第 5 節）
//   通報的人：「你通報的『電梯／電梯口運轉有異音』已受理，點擊查看處理進度」
//   按過「我也遇到了」的人：「你也遇到的『…』已受理，…」
//   管委會、管理人員登記的通報（不是住戶通報的）不通知通報人
//   type：'accepted' 受理 / 'closed' 結案
const RESIDENT_NOTICES = {
  accepted: { title: '通報已受理', body: '已受理，點擊查看處理進度' },
  closed: { title: '通報已結案', body: '已結案，點擊查看處理結果' },
}

function notifyResidents(item, type) {
  const notice = RESIDENT_NOTICES[type]
  const targets = item.source === 'resident' ? [{ id: item.reporterId, lead: '你通報的' }] : []
  for (const id of item.supporters) targets.push({ id, lead: '你也遇到的' })
  for (const { id, lead } of targets) {
    if (!findUser(id)?.roles.includes('resident')) continue
    notifications.push({
      id: `n-${item.id}-${type}-${id}`,
      userId: id,
      role: 'resident',
      title: notice.title,
      body: `${lead}「${item.title}」${notice.body}`,
      at: MOCK_NOW,
      read: false,
      link: { type: 'case', id: item.id },
    })
  }
}

// 完工驗收：已受理、處理中 → 當場修好、當場驗收（沒有「驗收不通過」）
//   已受理也可以：管理人員自己就修好的（例如換燈管），不一定要派廠商
//   note 完工備註、photos 照片檔名的清單
//   管理人員按的 → 待結案，回到主委、副主委審核，並把交辦給這個人的那筆交辦一起回報完成
//   主委、副主委按的（自己處理的）→ 直接結案
//   cost 維修費用：主委、副主委直接結案時才用得到（和 closeCase 一樣）；管理人員按的會忽略
//     直接結案不另外寫結案說明，完工備註就是說明（2026-10-16 suzy 決定，兩個文字框合成一個）
export async function completeCase(id, userId, { note = '', photos = [], cost }) {
  await delay()
  const item = findHandleableCase(id, userId, ['accepted', 'in_progress'])
  if (!item) return undefined
  item.completion = { at: MOCK_NOW, note, photos: [...photos] }
  addLog(item, userId, '完工驗收', note || '已完工驗收')
  // 主委、副主委自己處理、自己按的：他本身就是審核的人，直接結案
  if (canCloseCases(userId)) {
    closeItem(item, userId, cost)
    return presentForManagement(item)
  }
  // 管理人員按的：一律待結案，回到主委、副主委審核（管理人員自己受理的也一樣，2026-10-15 改）
  item.status = 'to_verify'
  item.logs.at(-1).residentText = '維修已完成，等待管委會結案。'
  const task = tasks.find((entry) => entry.caseId === id && entry.assigneeId === userId && entry.status === 'in_progress')
  if (task) {
    task.status = 'reported'
    task.report = { at: MOCK_NOW, note: note || '已完工驗收', files: [...photos] }
    delete task.returnNote
  }
  notifyToClose(item, userId)
  return presentForManagement(item)
}

// 「案件待結案」通知的標題：todos.js 用它判斷哪件待結案還沒看過、要排在待辦最前面，要改字只改這裡
export const TO_CLOSE_TITLE = '案件待結案'

// 管理人員完工驗收後：通知主委、副主委來結案（2026-10-16）
function notifyToClose(item, userId) {
  for (const user of users) {
    if (!canCloseCases(user.id)) continue
    notifications.push({
      id: `n-${item.id}-close-${user.id}-${notifications.length + 1}`,
      userId: user.id,
      role: 'committee',
      title: TO_CLOSE_TITLE,
      body: `${item.title}：${userLabel(userId)}已完工驗收，請結案`,
      at: MOCK_NOW,
      read: false,
      link: { type: 'case', id: item.id },
    })
  }
}

// 主委、副主委打開待結案的案件時用：只把這件案件的「案件待結案」通知設為已讀
//   待辦就不再把它排到最前面；其他通知不動
export async function markToCloseNotificationRead(userId, caseId) {
  await delay()
  for (const item of notifications) {
    if (item.userId === userId && item.title === TO_CLOSE_TITLE && item.link?.id === caseId) item.read = true
  }
}

// 結案：待結案 → 已結案。主委、副主委都能結案，不管是誰受理的（2026-10-15 改，原本只有負責人）
//   options 都是選填：cost 維修費用（只有委員填得了）、note 結案說明
//   廠商評分 2026-10-16 從結案拿掉了（舊的假資料還留著 rating，廠商詳情的平均評分照樣算）
export async function closeCase(id, userId, options = {}) {
  await delay()
  const item = findHandleableCase(id, userId, ['to_verify'])
  if (!item || !canCloseCases(userId)) return undefined
  const { cost, note } = options
  closeItem(item, userId, cost, note?.trim() ?? '')
  return presentForManagement(item)
}

// 退回：待結案 → 處理中，請完工驗收的人再處理一次（2026-10-16）
//   誰：主委、副主委（和結案同一批人）；reason 退回原因，必填
//   有連到這件案件、待確認的交辦 → 一起退回（交辦回到進行中，記下退回原因），通知交辦對象
//   沒有交辦的（管理人員自己受理的）→ 通知按完工驗收的人
export async function returnCase(id, userId, reason) {
  await delay()
  const item = findHandleableCase(id, userId, ['to_verify'])
  if (!item || !canCloseCases(userId) || !reason?.trim()) return undefined
  const note = reason.trim()
  item.status = 'in_progress'
  // 完工紀錄清掉：退回就是還沒完工，案件詳情才不會在「處理中」的案件上還顯示完工區塊（suzy 在 #97 提的）
  //   處理紀錄裡「完工驗收」那一筆還留著，看得到之前回報過
  delete item.completion
  addLog(item, userId, '退回', `${userLabel(userId)}退回：${note}`, '管委會確認後還需要再處理，處理中。')

  const task = tasks.find((entry) => entry.caseId === id && entry.status === 'reported')
  if (task) {
    task.status = 'in_progress'
    task.returnNote = { at: MOCK_NOW, note }
  }
  // 通知要再處理的人：有交辦就是交辦對象，沒有就是按完工驗收的人
  const targetId = task ? task.assigneeId : item.logs.findLast((log) => log.label === '完工驗收')?.actorId
  const target = findUser(targetId)
  if (target) {
    notifications.push({
      id: `n-${item.id}-return-${notifications.length + 1}`,
      userId: target.id,
      role: target.roles.includes('staff') ? 'staff' : 'committee',
      title: task ? '交辦被退回' : '案件被退回',
      body: `${item.title}：${note}`,
      at: MOCK_NOW,
      read: false,
      link: task ? { type: 'task', id: task.id } : { type: 'case', id: item.id },
    })
  }
  return presentForManagement(item)
}

// 某家廠商處理過的報修統計（廠商詳情頁用）
// 回傳：結案件數、從通報到結案的平均天數、平均評分
export function caseStatsOfVendor(vendorId) {
  const closed = cases.filter((item) => item.vendorId === vendorId && item.status === 'closed')
  if (closed.length === 0) return { count: 0, averageDays: null, averageScore: null }

  // reduce：把陣列裡的數字一個一個加起來
  const totalDays = closed.reduce(
    (sum, item) => sum + diffDays(item.reportedAt.split('T')[0], item.closedAt.split('T')[0]),
    0,
  )
  const rated = closed.filter((item) => item.rating)
  const totalScore = rated.reduce((sum, item) => sum + item.rating.score, 0)
  return {
    count: closed.length,
    averageDays: Math.round((totalDays / closed.length) * 10) / 10, // 四捨五入到小數一位
    averageScore: rated.length ? Math.round((totalScore / rated.length) * 10) / 10 : null,
  }
}

// ── 住戶端 ────────────────────────────────────────────────

// 取得「我的通報」：我通報的、管委會或管理人員代我這一戶登記的，加上我按過「我也遇到了」的
// status 可以不傳（全部），或傳 'active'（進行中）、'done'（已完成）
export async function getMyReports(userId, status) {
  await delay()
  return cases
    .filter((item) => item.reporterId === userId || isMyHousehold(item, userId) || item.supporters.includes(userId))
    .filter((item) => {
      if (status === 'active') return isOpen(item)
      if (status === 'done') return !isOpen(item)
      return true
    })
    .map((item) => presentForResident(item, userId))
    .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

// 取得單一通報的詳情（住戶用）
// 保密的案件只有通報人自己看得到，其他人會拿到 undefined
export async function getReportById(id, userId) {
  await delay()
  const item = cases.find((entry) => entry.id === id)
  if (!item) return undefined
  if (item.isPrivate && item.reporterId !== userId && !isMyHousehold(item, userId)) return undefined
  return presentForResident(item, userId)
}

// 找出「這位住戶可以修改」的案件：要是他自己通報的，而且還沒結案
// 找不到或不能改的話回傳 undefined
function findEditableCase(id, userId) {
  const item = cases.find((entry) => entry.id === id)
  if (!item || item.reporterId !== userId || !isOpen(item)) return undefined
  return item
}

// 住戶修改通報的紀錄名稱；住戶端看到這個名稱的紀錄，就知道是自己改的
const RESIDENT_EDIT_LABEL = '住戶補充'

// 修改通報（住戶用）：只能改補充說明和照片，地點和主旨送出後就不能改
//   changes 可以傳 description（補充說明）、photos（照片或影片檔名的清單），沒傳的不會動
// 有改到東西的話，處理紀錄多一筆「住戶補充」，留下修改的紀錄：
//   管理端看到「陳先生（B 棟 8 樓）修改了補充說明」，住戶自己的處理進度看到「你修改了補充說明。」
//   紀錄的 note 存改完之後的內容（補充說明的全文、照片的檔名），住戶的處理進度用小字顯示在下面
// 回傳修改後的通報；不能改的話（不是自己的、已經結案）回傳 undefined
// 修改只存在記憶體，重新整理網頁會變回原本的假資料
export async function updateReport(id, userId, changes) {
  await delay()
  const item = findEditableCase(id, userId)
  if (!item) return undefined
  const changed = [] // 改了哪些，例如 ['補充說明', '照片／影片']
  const notes = [] // 改完之後的內容，和 changed 一一對應
  if (changes.description !== undefined && changes.description !== item.description) {
    item.description = changes.description
    changed.push('補充說明')
    notes.push(item.description ? `「${item.description}」` : '已清空')
  }
  if (changes.photos !== undefined && changes.photos.join('|') !== item.photos.join('|')) {
    item.photos = [...changes.photos]
    changed.push('照片／影片')
    notes.push(item.photos.length ? item.photos.join('、') : '已全部刪除')
  }
  if (changed.length) {
    const what = changed.join('、')
    addLog(item, userId, RESIDENT_EDIT_LABEL, `${reporterLabel(item)}修改了${what}`, `你修改了${what}。`)
    // 剛加的那一筆，多記改完的內容。只改一項時，上一行已經說了改哪一項，不用再寫一次；兩項都改才在前面標名稱
    item.logs.at(-1).note =
      changed.length === 1 ? notes[0] : changed.map((name, i) => `${name}：${notes[i]}`).join('\n')
  }
  return presentForResident(item, userId)
}

// 新案件的編號：CASE-今天的日期-流水號。流水號是今天已經有幾件再加 1，補成三位數
function nextCaseId() {
  const datePart = MOCK_TODAY.replaceAll('-', '') // '2026-10-01' → '20261001'
  const todayCount = cases.filter((item) => item.id.startsWith(`CASE-${datePart}`)).length
  return `CASE-${datePart}-${String(todayCount + 1).padStart(3, '0')}`
}

// 新增通報（住戶用），回傳新增好的通報
//   input 要傳：
//     areaId      範圍，例如 'area-a'
//     place       地點名稱，例如 '1F 大廳'
//     isPrivate   是否保密：false 公共設施問題（公開）/ true 涉及住戶行為（保密）
//     subject     主旨（簡短），例如 '感應門故障'
//     description 問題描述
//     photos      照片或影片檔名的清單，沒有就傳 []
// 分類先一律歸「其他」，之後由管理人員調整；新通報只存在記憶體，重新整理網頁就不見了
export async function createReport(userId, input) {
  await delay()
  const item = {
    id: nextCaseId(),
    place: input.place,
    subject: input.subject,
    // 標題是地點＋通報問題，例如「1F 大廳門鎖壞了」；範圍（A 棟）在卡片的標籤上，不放進標題
    title: `${input.place}${input.subject}`,
    areaId: input.areaId,
    category: 'other',
    source: 'resident',
    isPrivate: input.isPrivate,
    reporterId: userId,
    reportedAt: MOCK_NOW,
    description: input.description,
    photos: [...input.photos],
    status: 'pending',
    supporters: [],
    logs: [
      {
        at: MOCK_NOW,
        label: '住戶通報',
        text: `${reporterLabel({ reporterId: userId, source: 'resident' })}通報${input.photos.length ? `，附 ${input.photos.length} 個照片或影片` : ''}`,
        residentText: '已收到，好彼管家已通知管理人員。',
      },
    ],
  }
  cases.push(item)
  notifyNewReport(item)
  return presentForResident(item, userId)
}

// 有新的住戶通報：通知能受理的人（主委、副主委用管委會身分收、管理人員用管理人員身分收）
// 通報的人自己也收（例如李伯伯用住戶身分通報，切到主委身分一樣會收到，2026-10-15 決定）
function notifyNewReport(item) {
  for (const user of users) {
    let role = ''
    if (['chair', 'viceChair'].includes(user.committeeTitle)) role = 'committee'
    if (user.roles.includes('staff')) role = 'staff'
    if (!role) continue
    notifications.push({
      id: `n-${item.id}-${user.id}`,
      userId: user.id,
      role,
      title: '新的住戶通報',
      body: `${areaName(item.areaId)}・${item.place}：${item.subject}`,
      at: MOCK_NOW,
      read: false,
      link: { type: 'case', id: item.id },
    })
  }
}

// 登記通報（管委會、管理人員代為登記用），回傳新增好的案件（管理端的樣子）
//   input 和 createReport 一樣，另外可以傳：
//     unit  代哪一戶登記，例如 { building: 'A', unit: '6樓之3' }；不是代住戶登記就不傳
//           有傳的話，同一戶的住戶在「我的通報」看得到這一筆（只能看，不能修改或撤回）
//   role  'committee' 委員登記 / 'staff' 管理人員登記
// 新案件只存在記憶體，重新整理網頁就不見了
export async function createRepair(userId, input, role = 'committee') {
  await delay()
  const who = userLabel(userId)
  const item = {
    id: nextCaseId(),
    place: input.place,
    subject: input.subject,
    // 標題是地點＋通報問題，例如「1F 大廳門鎖壞了」；範圍（A 棟）在卡片的標籤上，不放進標題
    title: `${input.place}${input.subject}`,
    areaId: input.areaId,
    category: 'other',
    source: role,
    isPrivate: input.isPrivate,
    reporterId: userId,
    reportedAt: MOCK_NOW,
    description: input.description,
    photos: [...input.photos],
    status: 'pending',
    supporters: [],
    logs: [
      {
        at: MOCK_NOW,
        actorId: userId,
        label: CASE_SOURCES[role].label,
        text: input.unit ? `${who} 代 ${unitLabel(input.unit)} 登記通報` : `${who} 登記通報`,
        // 住戶看到的說法統一，不寫代誰登記（看到的人不一定是那一戶，例如「確認是否重複」）
        residentText: `${role === 'staff' ? '管理人員' : '管委會'}已登記，正在安排處理。`,
      },
    ],
  }
  if (input.unit) item.reporterUnit = { ...input.unit }
  cases.push(item)
  return presentForManagement(item)
}

// 對別人的通報按「我也遇到了」（附議），回傳更新後的通報
// 只能對公開、還沒結案、不是自己通報的按；按過了再按一次不會重複計算
// 不能按的話回傳 undefined
export async function supportReport(id, userId) {
  await delay()
  const item = cases.find((entry) => entry.id === id)
  if (!item || item.isPrivate || !isOpen(item) || item.reporterId === userId) return undefined
  if (!item.supporters.includes(userId)) item.supporters.push(userId)
  return presentForResident(item, userId)
}

// 新增通報時「確認是否重複」：找出同一個地點、公開、還沒結案的通報
export async function getSimilarReports(areaId, place, userId) {
  await delay()
  return cases
    .filter((item) => item.areaId === areaId && item.place === place)
    .filter((item) => !item.isPrivate && isOpen(item))
    .map((item) => presentForResident(item, userId))
    .toSorted((a, b) => a.submittedAt.localeCompare(b.submittedAt))
}
