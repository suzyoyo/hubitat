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
    // 名字用 userLabel 的叫法（「李主委」「王總幹事」「王委員」）
    // 職稱已經在名字裡的不再重複寫（李主委不寫「主委」）；一般委員才補上「修繕委員」這類職稱
    const user = findUser(contact.userId)
    const info = describeUser(user, user.committeeTitle ? 'committee' : 'staff')
    const note = info.displayName.endsWith(info.titleLabel) ? '' : info.titleLabel
    return { ...contact, name: info.displayName, note }
  })
}

// 取得鑰匙清單（附上保管人的顯示文字）
export async function getKeys() {
  await delay()
  return keys.map((key) => ({ ...key, keeperLabel: userLabel(key.keeperId) }))
}
