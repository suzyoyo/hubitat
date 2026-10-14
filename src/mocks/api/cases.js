// 案件相關的假 API
// 同一份案件資料，管理端和住戶端要看的內容不同，所以分成兩種整理方式：
//   presentForManagement：管委會、管理人員看的（完整）
//   presentForResident：  住戶看的（簡化的狀態、只給住戶看的進度說明）
import { diffDays } from '@/lib/date'
import { CASE_SOURCES, CASE_STATUSES, CASE_VISIBILITY, cases } from '../data/cases'
import { ISSUE_CATEGORIES } from '../data/community'
import { equipment } from '../data/equipment'
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

// 登記報修（管委會、管理人員用），回傳新增好的案件（管理端的樣子）
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
        text: input.unit ? `${who} 代 ${unitLabel(input.unit)} 登記報修` : `${who} 登記報修`,
        residentText: '管委會已代你登記，好彼管家已通知管理人員。',
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
