// 第一版的假 API（通報、公告、會議），供住戶端首頁使用
// ⚠️ 暫時保留：第二批會改用「案件」取代通報，第三批會擴充會議，屆時這個檔案會移除
import { announcements } from '../data/announcements'
import { meetings } from '../data/meetings'
import { reports } from '../data/reports'
import { MOCK_TODAY, delay } from './helpers'

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
