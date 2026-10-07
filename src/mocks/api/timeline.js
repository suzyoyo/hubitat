// 社區時間軸相關的假 API
import { TIMELINE_TYPES, timeline } from '../data/timeline'
import { delay } from './helpers'

// 取得時間軸，依月份分組，新的在前
// filters 可以傳：year 年份（例如 2026）、type 類型（例如 'construction'）
// 回傳的格式：[{ month: '2026-09', items: [...] }, { month: '2026-08', items: [...] }]
export async function getTimeline(filters = {}) {
  await delay()
  const { year, type } = filters
  const items = timeline
    .filter((item) => !year || item.date.startsWith(String(year)))
    .filter((item) => !type || item.type === type)
    .toSorted((a, b) => b.date.localeCompare(a.date))
    .map((item) => ({ ...item, typeLabel: TIMELINE_TYPES[item.type].label }))

  // 依月份分組：同一個月的放在一起
  const groups = []
  for (const item of items) {
    const month = item.date.slice(0, 7) // '2026-09-20' → '2026-09'
    const last = groups.at(-1)
    if (last && last.month === month) {
      last.items.push(item)
    } else {
      groups.push({ month, items: [item] })
    }
  }
  return groups
}

// 取得時間軸裡有資料的年份（篩選用），新的在前，例如 [2026, 2025, 2024]
export async function getTimelineYears() {
  await delay()
  const years = timeline.map((item) => Number(item.date.slice(0, 4)))
  return [...new Set(years)].toSorted((a, b) => b - a)
}
