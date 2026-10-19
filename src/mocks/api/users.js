// 成員相關的假 API
import {
  COMMITTEE_TITLES,
  CURRENT_USER_IDS,
  DEMO_RESIDENT_IDS,
  STAFF_TITLES,
  TERM,
  users,
} from '../data/users'
import { delay } from './helpers'

// 依「目前用哪個身分看」決定要顯示的名稱與職稱
// 例如李先生：住戶身分是「李先生」，管委會身分是「李主委」「主委」
// displayName 和 userLabel 同一套叫法（姓＋職稱，2026-10-16 跟著 userLabel 改）
export function describeUser(user, role) {
  if (role === 'committee' && user.committeeTitle) {
    const title = COMMITTEE_TITLES[user.committeeTitle]
    return {
      displayName: userLabel(user.id), // 李主委、王委員
      titleLabel: title.label, // 主委
      shortName: `${user.surname}${title.short}`, // 李主委
    }
  }
  if (role === 'staff' && user.staffTitle) {
    return {
      displayName: userLabel(user.id), // 王總幹事、張管理員
      titleLabel: STAFF_TITLES[user.staffTitle].label,
      shortName: userLabel(user.id),
    }
  }
  return { displayName: user.name, titleLabel: '住戶', shortName: user.name }
}

// 用 id 找成員（給其他假 API 內部使用，沒有延遲）
export function findUser(id) {
  return users.find((user) => user.id === id)
}

// 把成員 id 轉成「李主委」「王總幹事」這種顯示文字：姓＋職稱
// 2026-10-15 從「主委 李委員」「總幹事 王小姐」改短：職稱和名字都有「委員」，太重複
//   主委、副主委 → 李主委、張副主委
//   其他委員     → 王委員（財務、修繕、監察委員都一樣）
//   管理人員     → 王總幹事、張管理員、黃警衛
//   住戶         → 名字，例如陳先生
export function userLabel(id) {
  const user = findUser(id)
  if (!user) return ''
  if (['chair', 'viceChair'].includes(user.committeeTitle)) {
    return `${user.surname}${COMMITTEE_TITLES[user.committeeTitle].label}`
  }
  if (user.committeeTitle) return `${user.surname}委員`
  if (user.staffTitle) return `${user.surname}${STAFF_TITLES[user.staffTitle].label}`
  return user.name
}

// 住戶端的示範住戶：預設是李先生，可以在 /playground 切換成不是委員的陳先生
// 選了誰記在瀏覽器的 localStorage，重新整理網頁也還在；只影響這台裝置
const DEMO_RESIDENT_KEY = 'hubitat-demo-resident'

// 取得示範住戶可以選的人
export function getDemoResidents() {
  return DEMO_RESIDENT_IDS.map((id) => findUser(id))
}

// 取得現在選的示範住戶 id；沒選過（或存了不在名單裡的值）就用預設的
export function getDemoResidentId() {
  const saved = localStorage.getItem(DEMO_RESIDENT_KEY)
  return DEMO_RESIDENT_IDS.includes(saved) ? saved : CURRENT_USER_IDS.resident
}

// 切換示範住戶
export function setDemoResidentId(id) {
  localStorage.setItem(DEMO_RESIDENT_KEY, id)
}

// 取得某個角色目前登入的使用者
// 回傳的資料會多出 displayName、titleLabel、shortName 三個欄位
export async function getCurrentUser(role = 'resident') {
  await delay()
  // 住戶端看示範住戶選了誰；管委會、管理人員是固定的
  const id = role === 'resident' ? getDemoResidentId() : CURRENT_USER_IDS[role]
  const user = findUser(id)
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
