// 社區相關的假 API
import { areas, community, internalContacts, keys } from '../data/community'
import { delay } from './helpers'
import { describeUser, findUser, userLabel } from './users'

// 取得社區基本資料
export async function getCommunity() {
  await delay()
  return { ...community, updatedByLabel: userLabel(community.updatedBy) }
}

// 取得地點清單
// includeInactive 傳 true 會連已停用的地點一起回傳（社區設定頁用）；
// 不傳的話只回傳使用中的地點（通報、登記報修時讓人選）
export async function getAreas(includeInactive = false) {
  await delay()
  if (includeInactive) return areas
  return areas.map((area) => ({
    ...area,
    places: area.places.filter((place) => place.active),
  }))
}

// 用 id 找範圍名稱，例如 'area-a' → 'A 棟'（給其他假 API 內部使用）
export function areaName(areaId) {
  const area = areas.find((item) => item.id === areaId)
  return area ? area.name : ''
}

// 取得社區內部聯絡清單
export async function getInternalContacts() {
  await delay()
  return internalContacts.map((contact) => {
    // 沒有 userId 的是固定單位（例如中控室），直接回傳
    if (!contact.userId) return contact
    // 委員顯示成「王委員・主委」，管理人員顯示成「王小姐・總幹事」
    const user = findUser(contact.userId)
    const info = describeUser(user, user.committeeTitle ? 'committee' : 'staff')
    return { ...contact, name: info.displayName, note: info.titleLabel }
  })
}

// 取得鑰匙清單（附上保管人的顯示文字）
export async function getKeys() {
  await delay()
  return keys.map((key) => ({ ...key, keeperLabel: userLabel(key.keeperId) }))
}
