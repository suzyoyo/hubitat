// 快速留存相關的假 API
import { quickSaves } from '../data/quickSaves'
import { delay } from './helpers'

// 取得某個人的留存，新的在前
// pendingOnly 傳 true 只回傳還沒補齊的
export async function getQuickSaves(ownerId, pendingOnly = false) {
  await delay()
  return quickSaves
    .filter((item) => item.ownerId === ownerId)
    .filter((item) => !pendingOnly || !item.resolved)
    .toSorted((a, b) => b.savedAt.localeCompare(a.savedAt))
}
