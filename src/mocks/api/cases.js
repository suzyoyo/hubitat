// 案件相關的假 API
// 同一份案件資料，管理端和住戶端要看的內容不同，所以分成兩種整理方式：
//   presentForManagement：管委會、管理人員看的（完整）
//   presentForResident：  住戶看的（簡化的狀態、只給住戶看的進度說明）
import { diffDays, formatDate, formatDateTime } from '@/lib/date'
import { CASE_SOURCES, CASE_STATUSES, CASE_VISIBILITY, cases } from '../data/cases'
import { ISSUE_CATEGORIES } from '../data/community'
import { equipment } from '../data/equipment'
import { tasks } from '../data/tasks'
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

// 逾期幾天；沒逾期回傳 0
// 有設定期限、還沒結案、而且期限已經過了，才算逾期
export function caseOverdueDays(item) {
  if (!item.deadline || !isOpen(item)) return 0
  const days = diffDays(item.deadline, MOCK_TODAY)
  return days > 0 ? days : 0
}

// 通報人的顯示文字，例如「陳先生（B 棟 8 樓）」；管理人員登記的顯示職稱
// 委員或管理人員代住戶登記的，例如「主委 李委員（代 A 棟 6樓之3）」
function reporterLabel(item) {
  const user = findUser(item.reporterId)
  if (!user) return ''
  if (item.reporterUnit) return `${userLabel(item.reporterId)}（代 ${unitLabel(item.reporterUnit)}）`
  if (item.source === 'committee' || user.roles.includes('staff')) return userLabel(item.reporterId)
  const floor = user.unit.split('樓')[0] // '8樓之2' → '8'
  return `${user.name}（${user.building} 棟 ${floor} 樓）`
}

// 管理端看的案件
function presentForManagement(item) {
  const vendor = vendors.find((entry) => entry.id === item.vendorId)
  const device = equipment.find((entry) => entry.id === item.equipmentId)
  const overdueDays = caseOverdueDays(item)
  return {
    ...item,
    areaName: areaName(item.areaId),
    categoryLabel: ISSUE_CATEGORIES[item.category].label,
    statusLabel: CASE_STATUSES[item.status].label,
    isOpen: isOpen(item),
    reporterLabel: reporterLabel(item),
    assigneeLabel: item.assigneeId ? userLabel(item.assigneeId) : '',
    vendorName: vendor ? vendor.name : '',
    equipmentName: device ? device.name : '',
    supporterCount: item.supporters.length, // 附議戶數
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
  const timeline = item.logs
    .filter((log) => log.residentText)
    .map((log) => ({ at: log.at, text: log.residentText }))
  const latest = timeline.at(-1) // 最後一筆，也就是最新的回覆

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
    updatedAt: latest ? latest.at : item.reportedAt,
    latestReply: latest,
    timeline,
    // 處理進度的三個階段各自的時間；還沒到的階段是 null
    steps: {
      receivedAt: item.reportedAt,
      processingAt: item.status === 'pending' ? null : (timeline[1]?.at ?? null),
      doneAt: item.closedAt ?? null,
    },
    supporterCount: item.supporters.length,
    // 是我（或我這一戶被代登記）通報的，還是我按了「我也遇到了」
    isMine: item.reporterId === userId || isMyHousehold(item, userId),
    // 是不是管委會、管理人員代我這一戶登記的（只能看，不能修改或撤回）
    isOnBehalf: isMyHousehold(item, userId),
    // 卡片、詳情頁顯示的文字：'管委會代為登記' / '管理人員代為登記'；不是代我這一戶登記的就是空字串
    onBehalfLabel: isMyHousehold(item, userId) ? `${item.source === 'staff' ? '管理人員' : '管委會'}代為登記` : '',
    hasSupported: item.supporters.includes(userId), // 我按過「我也遇到了」
    // 能不能修改或撤回：要是我自己通報的，而且還沒結案
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
  return item ? presentForManagement(item) : undefined
}

// ── 管理端的動作：受理 → 派廠商 → 處理紀錄 → 完工驗收 → 結案 ──────────
// 規則見 docs/case-flow.md（2026-10-15 和 013 定案）
// 下面都只改記憶體裡的資料，重新整理網頁會變回原本的假資料
// 不能做的時候（沒有權限、狀態不對）回傳 undefined，成功回傳更新後的案件（管理端的樣子）

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
//   'needs_repair' 待維修 / 'repairing' 維修中 / 'normal' 正常使用中
function setEquipmentStatus(item, status) {
  const device = equipment.find((entry) => entry.id === item.equipmentId)
  if (device) device.status = status
}

// 受理：待受理 → 已受理，受理的人就是負責人
//   options 都是選填：
//     deadline    完成日期，例如 '2026-10-08'（不依緊急給預設值）
//     category    問題分類，例如 'equipment'（住戶通報時先歸「其他」，這時改成正確的）
//     equipmentId 關聯設備，例如 'e-001'（有選的話設備變「待維修」，結案時進維修歷史）
export async function acceptCase(id, userId, options = {}) {
  await delay()
  const item = findHandleableCase(id, userId, ['pending'])
  if (!item) return undefined
  item.status = 'accepted'
  item.assigneeId = userId
  if (options.deadline) item.deadline = options.deadline
  if (options.category) item.category = options.category
  if (options.equipmentId) item.equipmentId = options.equipmentId
  setEquipmentStatus(item, 'needs_repair')
  const deadlineText = item.deadline ? `，預計 ${formatDate(item.deadline)} 前完成` : ''
  addLog(item, userId, '已受理', `${userLabel(userId)}受理${deadlineText}`, `${handlerWord(userId)}已受理。`)
  return presentForManagement(item)
}

// 派廠商：已受理、處理中 → 處理中（處理中也可以換廠商）
//   vendorId    廠商，例如 'v-001'
//   scheduledAt 預約到場時間，例如 '2026-10-03T14:00'（選填）
export async function assignVendor(id, userId, vendorId, scheduledAt = '') {
  await delay()
  const item = findHandleableCase(id, userId, ['accepted', 'in_progress'])
  const vendor = vendors.find((entry) => entry.id === vendorId)
  if (!item || !vendor) return undefined
  item.status = 'in_progress'
  item.vendorId = vendorId
  if (scheduledAt) item.scheduledAt = scheduledAt
  else delete item.scheduledAt // 換廠商又沒填時間，就不要留著上一家的預約
  setEquipmentStatus(item, 'repairing')
  // 住戶看到的不寫廠商名稱
  const text = scheduledAt
    ? `${userLabel(userId)}指派 ${vendor.name}，預約 ${formatDateTime(scheduledAt)} 到場`
    : `${userLabel(userId)}指派 ${vendor.name}`
  const residentText = scheduledAt ? `已安排廠商，預計 ${formatDate(scheduledAt)} 到場。` : '已安排廠商處理。'
  addLog(item, userId, '派廠商', text, residentText)
  return presentForManagement(item)
}

// 寫一筆處理紀錄（還沒結案的都可以寫）
//   text         管理端看的內容（可以寫廠商、報價這些細節），必填
//   residentText 給住戶看的一句，選填；沒寫就不給住戶看
//   scheduledAt  改期時填新的預約到場時間，選填
export async function addCaseLog(id, userId, { text, residentText = '', scheduledAt = '' }) {
  await delay()
  const item = findHandleableCase(id, userId, ['accepted', 'in_progress', 'to_verify'])
  if (!item || !text?.trim()) return undefined
  if (scheduledAt) item.scheduledAt = scheduledAt
  addLog(item, userId, '處理紀錄', text.trim(), residentText.trim())
  return presentForManagement(item)
}

// 結案（closeCase 和「負責人自己完工驗收」共用）：狀態改成已結案，並把後續的事一起做完
//   cost 維修費用，只有委員填得了；rating 廠商評分 { score: 1～5, comment }
function closeItem(item, userId, cost, rating) {
  item.status = 'closed'
  item.closedAt = MOCK_NOW
  if (rating) item.rating = { score: rating.score, comment: rating.comment ?? '' }
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
      vendorId: item.vendorId,
      caseId: item.id,
    }
    const isCommittee = findUser(userId)?.roles.includes('committee')
    if (isCommittee && cost > 0) record.cost = cost
    device.records.unshift(record) // 紀錄是新的在前
  }
  addLog(item, userId, '已結案', `${userLabel(userId)}結案`, '已完成維修，感謝你的通報。')
}

// 完工驗收：處理中 → 廠商當場修好、當場驗收（沒有「驗收不通過」）
//   note 完工備註、photos 照片檔名的清單
//   按的人是案件負責人（管理人員自己受理的）→ 直接結案
//   負責人是別人（主委或副主委交辦出去的）→ 待結案，並把交辦給這個人的那筆交辦一起回報完成
export async function completeCase(id, userId, { note = '', photos = [] }) {
  await delay()
  const item = findHandleableCase(id, userId, ['in_progress'])
  if (!item) return undefined
  item.completion = { at: MOCK_NOW, note, photos: [...photos] }
  addLog(item, userId, '完工驗收', note || '已完工驗收')
  if (item.assigneeId === userId) {
    closeItem(item, userId)
    return presentForManagement(item)
  }
  item.status = 'to_verify'
  item.logs.at(-1).residentText = `維修已完成，等待${handlerWord(item.assigneeId)}結案。`
  const task = tasks.find((entry) => entry.caseId === id && entry.assigneeId === userId && entry.status === 'in_progress')
  if (task) {
    task.status = 'reported'
    task.report = { at: MOCK_NOW, note: note || '已完工驗收', files: [...photos] }
    delete task.returnNote
  }
  return presentForManagement(item)
}

// 結案：待結案 → 已結案。只有案件負責人（受理的人）能結案
//   options 都是選填：cost 維修費用（只有委員填得了）、rating 廠商評分 { score: 1～5, comment }
export async function closeCase(id, userId, options = {}) {
  await delay()
  const item = findHandleableCase(id, userId, ['to_verify'])
  if (!item || item.assigneeId !== userId) return undefined
  const { cost, rating } = options
  if (rating && !(rating.score >= 1 && rating.score <= 5)) return undefined
  closeItem(item, userId, cost, rating)
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
    .filter((item) => item.status !== 'cancelled')
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

// 修改通報（住戶用）：只能改補充說明和照片，地點和主旨送出後就不能改
//   changes 可以傳 description（補充說明）、photos（照片或影片檔名的清單），沒傳的不會動
// 回傳修改後的通報；不能改的話（不是自己的、已經結案）回傳 undefined
// 修改只存在記憶體，重新整理網頁會變回原本的假資料
export async function updateReport(id, userId, changes) {
  await delay()
  const item = findEditableCase(id, userId)
  if (!item) return undefined
  if (changes.description !== undefined) item.description = changes.description
  if (changes.photos !== undefined) item.photos = [...changes.photos]
  return presentForResident(item, userId)
}

// 撤回通報（住戶用）：狀態改成「已取消」，並留下一筆紀錄
//   reason 撤回原因，選填；有寫的話管理端的紀錄會看到
// 撤回後不會再出現在「我的通報」，管理端的未結案列表也看不到
// 回傳 true 代表撤回成功；不能撤回的話（不是自己的、已經結案）回傳 false
export async function withdrawReport(id, userId, reason = '') {
  await delay()
  const item = findEditableCase(id, userId)
  if (!item) return false
  item.status = 'cancelled'
  if (reason) item.withdrawReason = reason
  item.logs.push({
    at: MOCK_NOW,
    actorId: userId,
    label: '住戶撤回',
    text: reason ? `通報人撤回通報，原因：${reason}` : '通報人撤回通報',
    residentText: '你已撤回這筆通報。',
  })
  return true
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
    title: `${areaName(input.areaId)} ${input.place}${input.subject}`,
    areaId: input.areaId,
    category: 'other',
    source: 'resident',
    isPrivate: input.isPrivate,
    isUrgent: false,
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
  return presentForResident(item, userId)
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
    title: `${areaName(input.areaId)} ${input.place}${input.subject}`,
    areaId: input.areaId,
    category: 'other',
    source: role,
    isPrivate: input.isPrivate,
    isUrgent: false,
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
