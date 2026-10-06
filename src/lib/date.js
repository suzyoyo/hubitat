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

// '2026-10-08' → '2026/10/08'（合約、設備這類需要看年份的地方用）
export function formatFullDate(value) {
  const { year, month, day } = parse(value)
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}/${mm}/${dd}`
}

// 從 from 到 to 還有幾天：diffDays('2026-10-01', '2026-10-08') 是 7
// to 比 from 早的話會是負數，例如 -11 表示已經過了 11 天
export function diffDays(from, to) {
  return countDays(from, to) - 1
}

// 往後加幾個月：addMonths('2026-09-10', 1) → '2026-10-10'
// 遇到月底會自動調整：addMonths('2026-01-31', 1) → '2026-02-28'
export function addMonths(value, months) {
  const { year, month, day } = parse(value)
  const total = month - 1 + months // 從 0 開始算的月份
  const newYear = year + Math.floor(total / 12)
  const newMonth = (total % 12) + 1
  // 這個月有幾天：下個月的第 0 天，就是這個月的最後一天
  const daysInMonth = new Date(Date.UTC(newYear, newMonth, 0)).getUTCDate()
  const newDay = Math.min(day, daysInMonth)
  const mm = String(newMonth).padStart(2, '0')
  const dd = String(newDay).padStart(2, '0')
  return `${newYear}-${mm}-${dd}`
}
