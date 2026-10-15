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

// 設為已讀（只改記憶體，重新整理網頁會變回原本的假資料）
// 之後接真的後端時，畫面一樣呼叫這兩個函式，只要改這裡面的內容

// 單則設為已讀：點進某一則通知時用
export async function markNotificationRead(id) {
  await delay()
  const item = notifications.find((entry) => entry.id === id)
  if (item) item.read = true
}

// 全部設為已讀：通知頁的「全部已讀」用。只改這個人、這個身分的通知
export async function markAllNotificationsRead(userId, role) {
  await delay()
  for (const item of notifications) {
    if (item.userId === userId && item.role === role) item.read = true
  }
}

// 把連到某一筆資料的通知都設為已讀：打開那筆資料的詳情頁時用
//   例如打開交辦詳情，「新的交辦」通知就算看過了，待辦也不再排到最前面
//   link 是 { type: 'task', id: 'TASK-105' } 這種格式，和通知裡的 link 一樣
export async function markNotificationsReadByLink(userId, role, link) {
  await delay()
  for (const item of notifications) {
    if (item.userId === userId && item.role === role && item.link?.type === link.type && item.link?.id === link.id) {
      item.read = true
    }
  }
}
