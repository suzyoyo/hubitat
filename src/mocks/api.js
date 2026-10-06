// 假 API：模擬「向伺服器要資料」
// 每個函式都回傳 Promise，並故意延遲一下，就像真的在等網路回應。
// 之後有真的後端時，只要改這個檔案裡的函式內容（改成 fetch），畫面的程式碼不用動。
import { announcements } from './data/announcements'
import { meetings } from './data/meetings'
import { reports } from './data/reports'
import { users } from './data/users'

// 假裝「今天」是這一天，這樣不管哪天打開，畫面都和設計稿一致
// （例如 A 棟電梯保養會顯示「今天完工」）
export const MOCK_TODAY = '2026-09-29'

// 等待一段時間（毫秒）再繼續，用來模擬網路延遲
function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 取得某個角色目前登入的使用者（還沒有登入功能，先固定回傳該角色的第一位）
export async function getCurrentUser(role = 'resident') {
  await delay()
  return users.find((user) => user.role === role)
}

// 取得某位使用者的通報，新的排前面
// status 可以不傳（全部），或傳 'active'（進行中：已收到 + 處理中）、'done'（已完成）
export async function getMyReports(userId, status) {
  await delay()
  let list = reports.filter((report) => report.reporterId === userId)
  if (status === 'active') {
    list = list.filter((report) => report.status !== 'done')
  } else if (status === 'done') {
    list = list.filter((report) => report.status === 'done')
  }
  // toSorted 會回傳排好的新陣列，不會動到原本的資料
  return list.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

// 用 id 取得單一通報；找不到會回傳 undefined
export async function getReportById(id) {
  await delay()
  return reports.find((report) => report.id === id)
}

// 取得還沒結束的公告，日期近的排前面
export async function getAnnouncements() {
  await delay()
  return announcements
    .filter((item) => item.endDate >= MOCK_TODAY)
    .toSorted((a, b) => a.startDate.localeCompare(b.startDate))
}

// 取得會議紀錄，新的排前面
export async function getMeetings() {
  await delay()
  return meetings.toSorted((a, b) => b.heldAt.localeCompare(a.heldAt))
}
