// 快速留存相關的假 API
import { cases } from '../data/cases'
import { equipment } from '../data/equipment'
import { quickSaves } from '../data/quickSaves'
import { mockNow, delay } from './helpers'
import { userLabel } from './users'

// 取得某個人的留存，新的在前
// pendingOnly 傳 true 只回傳還沒補齊的
export async function getQuickSaves(ownerId, pendingOnly = false) {
  await delay()
  return quickSaves
    .filter((item) => item.ownerId === ownerId)
    .filter((item) => !pendingOnly || !item.resolved)
    .toSorted((a, b) => b.savedAt.localeCompare(a.savedAt))
}

// 新增一筆留存（「＋」選單的「快速留存」，2026-10-18）
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
    savedAt: mockNow(),
    resolved: false,
  }
  quickSaves.push(item)
  return item
}

// 取得一筆留存（留存詳情頁用，2026-10-18）；找不到回傳 undefined
//   多給畫面：ownerLabel 留存的人；linkedTitle 歸到的案件標題或設備名稱
export async function getQuickSaveById(id) {
  await delay()
  const item = quickSaves.find((entry) => entry.id === id)
  if (!item) return undefined
  const target =
    item.linked?.type === 'case'
      ? cases.find((entry) => entry.id === item.linked.id)
      : equipment.find((entry) => entry.id === item.linked?.id)
  return {
    ...item,
    ownerLabel: userLabel(item.ownerId),
    linkedTitle: target ? (target.title ?? target.name) : '',
  }
}

// 把留存歸到一件案件（補齊資料，2026-10-18）
//   留存變成已補齊（待辦「需補資料」那張就消失），案件的處理紀錄多一筆「附上留存」，照片放在那一筆下面
//   設備不在這裡選：到案件詳情的「關聯設備」選
//   只有留存的人自己能歸、還沒補齊的才能歸，案件要是處理中的；不行時回傳 undefined
export async function linkQuickSaveToCase(id, userId, caseId) {
  await delay()
  const item = quickSaves.find((entry) => entry.id === id)
  const target = cases.find((entry) => entry.id === caseId)
  if (!item || item.ownerId !== userId || item.resolved) return undefined
  if (!target || !['accepted', 'in_progress'].includes(target.status)) return undefined
  item.resolved = true
  item.linked = { type: 'case', id: caseId }
  const log = { at: mockNow(), actorId: userId, label: '附上留存', text: `${userLabel(userId)}附上留存「${item.name || '未命名的留存'}」` }
  if (item.note) log.note = item.note
  if (item.photos.length) log.files = [...item.photos]
  target.logs.push(log)
  return item
}
