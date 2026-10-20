// 把假資料的變動暫存在 sessionStorage（2026-10-20）
//
// 為什麼要存：假資料原本只放在記憶體，網頁一重新載入就回到一開始的樣子。
//   手機把 App 加到主畫面後，從「我的」→「使用說明」打開手冊，App 會被換掉；
//   回來時 App 重新載入，剛剛新增的通報就不見了。手機在背景把 App 關掉、重新整理網頁也一樣。
//
// 怎麼存：
//   - 離開這一頁（換到手冊、重新整理）或 App 被切到背景時，把全部假資料轉成文字存一份
//   - App 打開時，有存過就讀回來，蓋掉一開始的假資料
//   - sessionStorage 只在同一個視窗裡有效，關掉 App（或分頁）就清空，所以展示完關掉，下次打開還是原本的假資料
//   - 想馬上回到原本的假資料：/playground「假資料」區的「重設假資料」
//
// 改了 data/ 裡的假資料（開發時）：存的那份是舊的，會自動丟掉，不會蓋掉你改的內容（看下面的 fingerprint）
import { community, areas, internalContacts, keys } from '../data/community'
import { announcements } from '../data/announcements'
import { contracts } from '../data/contracts'
import { cases } from '../data/cases'
import { legalDocuments, publicDocuments, bylaws, communityRules } from '../data/documents'
import { handoverNote } from '../data/handover'
import { proposals } from '../data/proposals'
import { invites } from '../data/invites'
import { equipment } from '../data/equipment'
import { quickSaves } from '../data/quickSaves'
import { users } from '../data/users'
import { vendors } from '../data/vendors'
import { notifications } from '../data/notifications'
import { nextMeeting, meetings } from '../data/meetings'
import { timeline } from '../data/timeline'
import { tasks } from '../data/tasks'

const STORAGE_KEY = 'hubitat-mock-data'

// 要存的資料：名稱 → 陣列或物件（只放會被改到的資料，對照表這類固定的不用存）
// 假 API 自己記在記憶體的東西（草稿、公告已讀）用 keepInSession 另外加進來
const stores = {
  community, areas, internalContacts, keys,
  announcements, contracts, cases,
  legalDocuments, publicDocuments, bylaws, communityRules,
  handoverNote, proposals, invites, equipment, quickSaves,
  users, vendors, notifications, nextMeeting, meetings, timeline, tasks,
}

// 一開始的假資料算出一個「指紋」（一串數字）：data/ 的內容改了，指紋就不一樣
// 存的時候一起記下來，讀回來時指紋不同，代表那份是改之前存的，直接丟掉
function makeFingerprint(text) {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0 // | 0：保持在整數範圍裡
  }
  return String(hash)
}
const fingerprint = makeFingerprint(JSON.stringify(stores))

// 讀出存過的那份；沒有、壞掉、或是舊的指紋都當作沒有
function readSaved() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    if (saved?.fingerprint === fingerprint) return saved.data
  } catch {
    // 私密瀏覽等情況可能讀不了，就用原本的假資料
  }
  return null
}
const saved = readSaved()

// 把存過的內容放回 target 裡。要「原地」換內容，不能換成新的陣列或物件，
// 因為假 API 各檔案 import 的是同一個陣列，換成新的它們就看不到了
function restoreInto(target, value) {
  if (Array.isArray(target)) {
    target.splice(0, target.length, ...value)
  } else {
    for (const key of Object.keys(target)) delete target[key]
    Object.assign(target, value)
  }
}

// 先把資料檔的內容換成存過的
if (saved) {
  for (const [name, target] of Object.entries(stores)) {
    if (name in saved) restoreInto(target, saved[name])
  }
}

// 讓假 API 把自己記在記憶體的東西也一起存（陣列或物件，裡面只能放文字、數字、陣列、物件）
//   例如 drafts.js：keepInSession('drafts', drafts)
export function keepInSession(name, target) {
  stores[name] = target
  if (saved && name in saved) restoreInto(target, saved[name])
}

// 存一份（按了「重設假資料」之後就不存，不然重新載入前又會存回去）
let resetting = false
function save() {
  if (resetting) return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ fingerprint, data: stores }))
  } catch {
    // 存不了（私密瀏覽、空間不夠）：這次就跟以前一樣，重新載入後回到原本的假資料
  }
}

// pagehide：離開這一頁（打開手冊、重新整理、關掉）
// visibilitychange：切到背景（手機回到主畫面、切到別的 App），之後可能被系統直接關掉，先存起來
window.addEventListener('pagehide', save)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') save()
})

// 回到原本的假資料：清掉存的那份，重新載入網頁
export function resetMockData() {
  resetting = true
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // 沒有存過也沒關係
  }
  window.location.reload()
}
