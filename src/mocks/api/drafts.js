// 草稿：表單填到一半，在「離開前確認」按「存成草稿，晚點再填」存下的內容（2026-10-19）
// 只存在記憶體，重新整理網頁就不見了（和其他假資料一樣）
// 一個人在同一個表單（同一個網址）只留一份，再存一次會蓋掉舊的
// 回到同一個表單時用 takeDraft 拿回來（拿了就刪掉；沒送出又要離開時可以再存一次）
// 管委會、管理人員的「我的待辦」會多一張草稿（種類「草稿」、徽章「未送出」，todos.js 用 draftsOf）
import { MOCK_NOW, delay } from './helpers'

const drafts = [] // { userId, role, path, title, data, savedAt }

// 存草稿
//   path：表單的網址，例如 '/committee/tasks/new'；回到這個網址就會帶回來，待辦卡也連到這裡
//   title：待辦卡上的名稱，例如「新增交辦」
//   data：表單的內容（每個表單自己決定要存哪些）
export async function saveDraft(userId, role, path, title, data) {
  await delay()
  const index = drafts.findIndex((item) => item.userId === userId && item.path === path)
  if (index !== -1) drafts.splice(index, 1)
  // JSON 轉一次：存一份複本，之後畫面再改表單也不會改到草稿
  drafts.push({ userId, role, path, title, data: JSON.parse(JSON.stringify(data)), savedAt: MOCK_NOW })
}

// 拿回草稿的內容並刪掉；沒有就回傳 null
export async function takeDraft(userId, path) {
  await delay()
  const index = drafts.findIndex((item) => item.userId === userId && item.path === path)
  if (index === -1) return null
  return drafts.splice(index, 1)[0].data
}

// 這個人、這個身分的草稿（我的待辦用，不用等）
export function draftsOf(userId, role) {
  return drafts.filter((item) => item.userId === userId && item.role === role)
}
