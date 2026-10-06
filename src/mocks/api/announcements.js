// 公告相關的假 API
import { announcements } from '../data/announcements'
import { areaName } from './community'
import { MOCK_NOW, delay, omit } from './helpers'
import { findUser, userLabel } from './users'

// 這則公告需不需要審核
//   委員發布的         → 不用審核
//   管理人員發布的     → 要經過主委或副主委審核
//   管理人員標示為緊急 → 不用審核
export function announcementNeedsReview(item) {
  const author = findUser(item.authorId)
  const isStaff = author.roles.includes('staff')
  return isStaff && !item.isUrgent
}

// 影響範圍的顯示文字：['all'] → '全社區'；['area-a', 'area-b'] → 'A 棟、B 棟'
function scopeLabel(areaIds) {
  if (areaIds.includes('all')) return '全社區'
  return areaIds.map(areaName).join('、')
}

// 這則公告和某位住戶有沒有關係：全社區的，或是影響到他住的那一棟
function isRelatedTo(item, user) {
  if (item.areaIds.includes('all')) return true
  const myArea = `area-${user.building.toLowerCase()}` // 'A' → 'area-a'
  return item.areaIds.includes(myArea)
}

function present(item, role) {
  const full = {
    ...item,
    scopeLabel: scopeLabel(item.areaIds),
    authorLabel: userLabel(item.authorId),
    reviewerLabel: item.reviewerId ? userLabel(item.reviewerId) : '',
    needsReview: announcementNeedsReview(item),
    withdrawnByLabel: item.withdrawnBy ? userLabel(item.withdrawnBy) : '',
    isOngoing: item.startAt <= MOCK_NOW && MOCK_NOW <= item.endAt, // 正在進行中
    hasEnded: item.endAt < MOCK_NOW, // 已經結束
  }
  // 關聯的案件與設備是內部資訊，住戶看不到
  return role === 'resident' ? omit(full, ['caseId', 'equipmentId', 'push']) : full
}

// ── 住戶端 ────────────────────────────────────────────────

// 取得住戶看得到的公告：已發布、還沒結束，依開始時間排序
// 每則會多一個 relatedToMe：是否「與我有關」
export async function getAnnouncements(userId) {
  await delay()
  const user = findUser(userId)
  return announcements
    .filter((item) => item.status === 'published' && item.endAt >= MOCK_NOW)
    .toSorted((a, b) => a.startAt.localeCompare(b.startAt))
    .map((item) => ({ ...present(item, 'resident'), relatedToMe: isRelatedTo(item, user) }))
}

// ── 管理端 ────────────────────────────────────────────────

// 取得所有公告（管委會、管理人員用），新的在前
// status 可以不傳（全部），或傳單一狀態，例如 'pending' 待審核
export async function getManagedAnnouncements(status) {
  await delay()
  return announcements
    .filter((item) => !status || item.status === status)
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((item) => present(item, 'committee'))
}

// 取得單一公告的詳情
export async function getAnnouncementById(id, role = 'resident') {
  await delay()
  const item = announcements.find((entry) => entry.id === id)
  return item ? present(item, role) : undefined
}

// 取得緊急標示使用紀錄：誰在什麼時候把公告標成「緊急」
export async function getUrgentLog() {
  await delay()
  const items = announcements
    .filter((item) => item.isUrgent && item.publishedAt)
    .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      at: item.publishedAt,
      authorLabel: userLabel(item.authorId),
    }))
  const thisYear = MOCK_NOW.slice(0, 4) // '2026'
  const thisMonth = MOCK_NOW.slice(0, 7) // '2026-10'
  return {
    items,
    yearCount: items.filter((item) => item.at.startsWith(thisYear)).length,
    monthCount: items.filter((item) => item.at.startsWith(thisMonth)).length,
  }
}
