// 日期顯示工具：把資料裡的 '2026-09-25T14:30' 轉成畫面上的文字

// 把 '2026-09-25' 或 '2026-09-25T14:30' 拆成數字
// 自己拆字串，不用 new Date('2026-09-25')，避免時區造成日期差一天
function parse(value) {
  const [datePart, timePart = ''] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  return { year, month, day, time: timePart }
}

// '2026-09-25T14:30' → '9/25'
export function formatDate(value) {
  const { month, day } = parse(value)
  return `${month}/${day}`
}

// '2026-09-25T14:30' → '9/25 14:30'
export function formatDateTime(value) {
  const { month, day, time } = parse(value)
  return `${month}/${day} ${time}`
}

// 兩個日期相差幾天（頭尾都算）：9/28 到 9/29 是 2 天
export function countDays(startDate, endDate) {
  const start = parse(startDate)
  const end = parse(endDate)
  // Date.UTC 回傳毫秒；一天有 86400000 毫秒
  const startMs = Date.UTC(start.year, start.month - 1, start.day)
  const endMs = Date.UTC(end.year, end.month - 1, end.day)
  return Math.round((endMs - startMs) / 86400000) + 1
}

// ('2026-09-28', '2026-09-29') → '9/28 – 9/29（共 2 天）'
// 只有一天時 → '10/11'
export function formatDateRange(startDate, endDate) {
  if (startDate === endDate) {
    return formatDate(startDate)
  }
  const days = countDays(startDate, endDate)
  return `${formatDate(startDate)} – ${formatDate(endDate)}（共 ${days} 天）`
}
