// 通知相關的假 API
import { diffDays, formatRelativeTime } from '@/lib/date'
import { notifications } from '../data/notifications'
import { MOCK_NOW, MOCK_TODAY, delay } from './helpers'

// 取得某個人、某個身分的通知，新的在前
// unreadOnly 傳 true 只回傳未讀的
// 每則會多兩個欄位：
//   group    'today' 今天 / 'yesterday' 昨天 / 'earlier' 更早（畫面用來分組）
//   timeText 「10 分鐘前」「昨天 09:00」這種顯示文字
export async function getNotifications(userId, role, unreadOnly = false) {
  await delay()
  return notifications
    .filter((item) => item.userId === userId && item.role === role)
    .filter((item) => !unreadOnly || !item.read)
    .toSorted((a, b) => b.at.localeCompare(a.at))
    .map((item) => {
      const daysAgo = diffDays(item.at.split('T')[0], MOCK_TODAY)
      let group = 'earlier'
      if (daysAgo === 0) group = 'today'
      if (daysAgo === 1) group = 'yesterday'
      return { ...item, group, timeText: formatRelativeTime(item.at, MOCK_NOW) }
    })
}

// 取得未讀通知的數量（頂部鈴鐺的小紅點用）
export async function getUnreadCount(userId, role) {
  await delay()
  return notifications.filter(
    (item) => item.userId === userId && item.role === role && !item.read,
  ).length
}
