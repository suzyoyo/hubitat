// 快速留存相關的假 API
import { quickSaves } from '../data/quickSaves'
import { MOCK_NOW, delay } from './helpers'

// 取得某個人的留存，新的在前
// pendingOnly 傳 true 只回傳還沒補齊的
export async function getQuickSaves(ownerId, pendingOnly = false) {
  await delay()
  return quickSaves
    .filter((item) => item.ownerId === ownerId)
    .filter((item) => !pendingOnly || !item.resolved)
    .toSorted((a, b) => b.savedAt.localeCompare(a.savedAt))
}

// 新增一筆留存（「＋」選單的「快速留存」，2026-10-19）
//   fields：{ name, note, photos }，都是選填，但至少要有一樣（畫面會先擋）
//   新的留存還沒補齊，會出現在留存者的待辦「需補資料」裡
//   只改記憶體，重新整理網頁會變回原本的假資料
export async function addQuickSave(ownerId, fields) {
  await delay()
  const item = {
    id: `qs-${String(quickSaves.length + 1).padStart(3, '0')}`,
    ownerId,
    name: fields.name ?? '',
    note: fields.note ?? '',
    photos: fields.photos ?? [],
    savedAt: MOCK_NOW,
    resolved: false,
  }
  quickSaves.push(item)
  return item
}
