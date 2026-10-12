// 公告（住戶端）的小工具：好幾個公告元件都會用到的規則放這裡
import { formatDateWithWeekday, formatTime } from '@/lib/date'

// 公告的日期時間文字
//   一天： '10/10（六）09:00–12:00'（全形括號本身就有留白，後面不用再加空格）
//   多天： '10/5（一）～10/7（三）'（每日時段另外寫在 notice.timeText）
//   notice 是 getAnnouncements() 回傳的其中一則
export function noticeDateText(notice) {
  // '2026-10-05T09:00' → '2026-10-05'
  const startDate = notice.startAt.split('T')[0]
  const endDate = notice.endAt.split('T')[0]
  const start = formatDateWithWeekday(startDate)
  if (startDate === endDate) {
    return `${start}${formatTime(notice.startAt)}–${formatTime(notice.endAt)}`
  }
  return `${start}～${formatDateWithWeekday(endDate)}`
}

// 負責單位前面的稱呼：活動是「主辦」，其他（施工、維護…）是「負責」
export function noticeOrganizerLabel(notice) {
  return notice.type === 'activity' ? '主辦' : '負責'
}
