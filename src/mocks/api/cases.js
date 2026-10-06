// 案件相關的假 API
// 同一份案件資料，管理端和住戶端要看的內容不同，所以分成兩種整理方式：
//   presentForManagement：管委會、管理人員看的（完整）
//   presentForResident：  住戶看的（簡化的狀態、只給住戶看的進度說明）
import { diffDays } from '@/lib/date'
import { CASE_STATUSES, cases } from '../data/cases'
import { ISSUE_CATEGORIES } from '../data/community'
import { equipment } from '../data/equipment'
import { vendors } from '../data/vendors'
import { areaName } from './community'
import { MOCK_TODAY, delay } from './helpers'
import { findUser, userLabel } from './users'

// 是否未結案
function isOpen(item) {
  return CASE_STATUSES[item.status].isOpen
}

// 逾期幾天；沒逾期回傳 0
// 有設定期限、還沒結案、而且期限已經過了，才算逾期
export function caseOverdueDays(item) {
  if (!item.deadline || !isOpen(item)) return 0
  const days = diffDays(item.deadline, MOCK_TODAY)
  return days > 0 ? days : 0
}

// 通報人的顯示文字，例如「陳先生（B 棟 8 樓）」；管理人員登記的顯示職稱
function reporterLabel(userId) {
  const user = findUser(userId)
  if (!user) return ''
  if (user.roles.includes('staff')) return userLabel(userId)
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
    reporterLabel: reporterLabel(item.reporterId),
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
    isMine: item.reporterId === userId, // 是我通報的，還是我按了「我也遇到了」
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

// 取得「我的通報」：我通報的，加上我按過「我也遇到了」的
// status 可以不傳（全部），或傳 'active'（進行中）、'done'（已完成）
export async function getMyReports(userId, status) {
  await delay()
  return cases
    .filter((item) => item.reporterId === userId || item.supporters.includes(userId))
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
  if (item.isPrivate && item.reporterId !== userId) return undefined
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
