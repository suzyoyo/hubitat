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

// 星期幾，回傳 0～6：0 是星期日，6 是星期六
export function weekdayIndex(value) {
  const { year, month, day } = parse(value)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

// '2026-10-05T09:00' → '10/5（一）'
export function formatDateWithWeekday(value) {
  const { month, day } = parse(value)
  const weekday = '日一二三四五六'[weekdayIndex(value)]
  return `${month}/${day}（${weekday}）`
}

// 往後加幾天（負數是往前）：addDays('2026-10-01', 3) → '2026-10-04'
// 跨月會自動進位：addDays('2026-10-01', -4) → '2026-09-27'
export function addDays(value, days) {
  const { year, month, day } = parse(value)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${date.getUTCFullYear()}-${mm}-${dd}`
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

// 把時間換算成「從某個固定起點算起的分鐘數」，方便兩個時間相減
function toMinutes(value) {
  const { year, month, day, time } = parse(value)
  const [hour = 0, minute = 0] = time ? time.split(':').map(Number) : []
  return Date.UTC(year, month - 1, day, hour, minute) / 60000
}

// '2026-09-25T14:30' → '14:30'
export function formatTime(value) {
  return parse(value).time
}

// 依現在幾點決定問候語（首頁的問候列用）：'2026-10-01T13:42' → '午安'
//   11 點前是早安，18 點前是午安，之後是晚安
export function greetingWord(now) {
  const hour = Number(formatTime(now).split(':')[0]) // '13:42' → 13
  if (hour < 11) return '早安'
  if (hour < 18) return '午安'
  return '晚安'
}

// 把時間顯示成「多久以前」，now 是現在的時間
//   10 分鐘內的事 → '10 分鐘前'
//   今天稍早     → '2 小時前'
//   昨天         → '昨天 09:00'
//   更早         → '9/25'
export function formatRelativeTime(value, now) {
  const minutes = toMinutes(now) - toMinutes(value)
  const daysAgo = diffDays(value.split('T')[0], now.split('T')[0])
  if (daysAgo === 0) {
    if (minutes < 1) return '剛剛'
    if (minutes < 60) return `${minutes} 分鐘前`
    return `${Math.floor(minutes / 60)} 小時前`
  }
  if (daysAgo === 1) return `昨天 ${formatTime(value)}`
  return formatDate(value)
}
