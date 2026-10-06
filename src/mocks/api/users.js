// 成員相關的假 API
import {
  COMMITTEE_TITLES,
  CURRENT_USER_IDS,
  STAFF_TITLES,
  TERM,
  users,
} from '../data/users'
import { delay } from './helpers'

// 依「目前用哪個身分看」決定要顯示的名稱與職稱
// 例如李伯伯：住戶身分是「李伯伯」，管委會身分是「李委員」「修繕委員」
export function describeUser(user, role) {
  if (role === 'committee' && user.committeeTitle) {
    const title = COMMITTEE_TITLES[user.committeeTitle]
    return {
      displayName: `${user.surname}委員`, // 李委員
      titleLabel: title.label, // 修繕委員
      shortName: `${user.surname}${title.short}`, // 李修繕
    }
  }
  if (role === 'staff' && user.staffTitle) {
    return {
      displayName: user.name,
      titleLabel: STAFF_TITLES[user.staffTitle].label,
      shortName: user.name,
    }
  }
  return { displayName: user.name, titleLabel: '住戶', shortName: user.name }
}

// 用 id 找成員（給其他假 API 內部使用，沒有延遲）
export function findUser(id) {
  return users.find((user) => user.id === id)
}

// 把成員 id 轉成「修繕委員 李委員」「總幹事 王小姐」這種顯示文字
export function userLabel(id) {
  const user = findUser(id)
  if (!user) return ''
  if (user.committeeTitle) {
    const info = describeUser(user, 'committee')
    return `${info.titleLabel} ${info.displayName}`
  }
  if (user.staffTitle) {
    const info = describeUser(user, 'staff')
    return `${info.titleLabel} ${info.displayName}`
  }
  return user.name
}

// 取得某個角色目前登入的使用者
// 回傳的資料會多出 displayName、titleLabel、shortName 三個欄位
export async function getCurrentUser(role = 'resident') {
  await delay()
  const user = findUser(CURRENT_USER_IDS[role])
  return { ...user, currentRole: role, ...describeUser(user, role) }
}

// 取得這一屆的委員名單（依職稱順序）
export async function getCommitteeMembers() {
  await delay()
  const order = Object.keys(COMMITTEE_TITLES)
  return users
    .filter((user) => user.roles.includes('committee'))
    .toSorted((a, b) => order.indexOf(a.committeeTitle) - order.indexOf(b.committeeTitle))
    .map((user) => ({ ...user, ...describeUser(user, 'committee') }))
}

// 取得管理人員名單（新增交辦時選擇交辦對象用）
export async function getStaffMembers() {
  await delay()
  return users
    .filter((user) => user.roles.includes('staff'))
    .map((user) => ({ ...user, ...describeUser(user, 'staff') }))
}

// 取得目前這一屆的屆次與任期
export async function getTerm() {
  await delay()
  return TERM
}
