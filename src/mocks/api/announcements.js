// 公告相關的假 API
import { ANNOUNCEMENT_TYPES, announcements } from '../data/announcements'
import { notifications } from '../data/notifications'
import { areaName } from './community'
import { MOCK_NOW, delay, omit } from './helpers'
import { COMMITTEE_TITLES, users } from '../data/users'
import { findUser, userLabel } from './users'

// 這個人能不能發布公告：主委、副主委、管理人員（財務、修繕、監察委員不能）
export function canPublishAnnouncement(userId) {
  const user = findUser(userId)
  if (!user) return false
  if (user.roles.includes('staff')) return true
  return COMMITTEE_TITLES[user.committeeTitle]?.canReviewAnnouncement ?? false
}

// 這則公告需不需要審核
//   主委、副主委發布的 → 不用審核
//   管理人員發布的     → 要經過主委或副主委審核
//   管理人員標示為緊急 → 不用審核
export function announcementNeedsReview(item) {
  const author = findUser(item.authorId)
  const isStaff = author.roles.includes('staff')
  return isStaff && !item.isUrgent
}

// 影響範圍的顯示文字：['all'] → '全社區'；['area-a', 'area-b'] → 'A 棟、B 棟'
function scopeLabel(areaIds) {
  if (areaIds.includes('all')) return '全社區'
  return areaIds.map(areaName).join('、')
}

// 這則公告和某位住戶有沒有關係：全社區的，或是影響到他住的那一棟
function isRelatedTo(item, user) {
  if (item.areaIds.includes('all')) return true
  const myArea = `area-${user.building.toLowerCase()}` // 'A' → 'area-a'
  return item.areaIds.includes(myArea)
}

function present(item, role) {
  const full = {
    ...item,
    typeLabel: ANNOUNCEMENT_TYPES[item.type].label,
    scopeLabel: scopeLabel(item.areaIds),
    authorLabel: userLabel(item.authorId),
    reviewerLabel: item.reviewerId ? userLabel(item.reviewerId) : '',
    needsReview: announcementNeedsReview(item),
    withdrawnByLabel: item.withdrawnBy ? userLabel(item.withdrawnBy) : '',
    isOngoing: item.startAt <= MOCK_NOW && MOCK_NOW <= item.endAt, // 正在進行中
    hasEnded: item.endAt < MOCK_NOW, // 已經結束
  }
  // 關聯的案件與設備是內部資訊，住戶看不到
  return role === 'resident' ? omit(full, ['caseId', 'equipmentId', 'push']) : full
}

// ── 住戶端 ────────────────────────────────────────────────

// 已讀紀錄：誰看過哪些公告，例如 { 'u-c04': Set { 'an-001', 'an-002' } }
// 現在沒有後端，先記在記憶體裡：換頁還會記得，重新整理網頁就會清空（全部變回未讀）
const readIdsByUser = {}

function hasRead(userId, id) {
  return readIdsByUser[userId]?.has(id) ?? false
}

// 取得住戶看得到的公告：已發布、還沒結束，依開始時間排序
// 每則會多兩個欄位：
//   relatedToMe 是否「與我有關」
//   isRead      這位住戶看過了沒
export async function getAnnouncements(userId) {
  await delay()
  const user = findUser(userId)
  return announcements
    .filter((item) => item.status === 'published' && item.endAt >= MOCK_NOW)
    .toSorted((a, b) => a.startAt.localeCompare(b.startAt))
    .map((item) => ({
      ...present(item, 'resident'),
      relatedToMe: isRelatedTo(item, user),
      isRead: hasRead(userId, item.id),
    }))
}

// 把幾則公告記成「這位住戶看過了」；ids 是公告編號的清單，例如 ['an-001', 'an-002']
export async function markAnnouncementsRead(userId, ids) {
  await delay()
  // 這位住戶還沒有紀錄的話，先建立一個空的 Set（Set 是不會重複的清單）
  readIdsByUser[userId] ??= new Set()
  for (const id of ids) {
    readIdsByUser[userId].add(id)
  }
}

// ── 管理端 ────────────────────────────────────────────────

// 取得所有公告（管委會、管理人員用），新的在前
// status 可以不傳（全部），或傳單一狀態，例如 'pending' 待審核
export async function getManagedAnnouncements(status) {
  await delay()
  return announcements
    .filter((item) => !status || item.status === status)
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((item) => present(item, 'committee'))
}

// 這個人能不能修改、撤回這則公告：發布者本人，或是主委、副主委
function canManage(item, userId) {
  const user = findUser(userId)
  if (!user) return false
  if (item.authorId === userId) return true
  return COMMITTEE_TITLES[user.committeeTitle]?.canReviewAnnouncement ?? false
}

// 取得單一公告的詳情
//   userId 可以不傳；有傳的話（管理端用）會多兩個欄位，告訴畫面要放哪些按鈕：
//     canWithdraw 能不能撤回：已發布、還沒結束
//     canEdit     能不能修改：已發布、還沒結束（已撤回的不能再改、不能重新發布，要再發就發一則新的）
//   兩個都要是發布者本人，或是主委、副主委
export async function getAnnouncementById(id, role = 'resident', userId) {
  await delay()
  const item = announcements.find((entry) => entry.id === id)
  if (!item) return undefined
  const result = present(item, role)
  if (userId) {
    const allowed = canManage(item, userId) && !result.hasEnded
    result.canWithdraw = allowed && item.status === 'published'
    result.canEdit = allowed && item.status === 'published'
  }
  return result
}

// 撤回公告（管理端用）：已發布、還沒結束的公告 → 已撤回，住戶就看不到了
//   reason 撤回原因，選填
// 回傳 true 代表撤回成功；不能撤回的話（沒有權限、不是已發布、已經結束）回傳 false
// 撤回只存在記憶體，重新整理網頁會變回原本的假資料
export async function withdrawAnnouncement(id, userId, reason = '') {
  await delay()
  const item = announcements.find((entry) => entry.id === id)
  if (!item || item.status !== 'published' || item.endAt < MOCK_NOW) return false
  if (!canManage(item, userId)) return false
  item.status = 'withdrawn'
  item.withdrawnAt = MOCK_NOW
  item.withdrawnBy = userId
  if (reason) item.withdrawReason = reason
  notifyResidents(item, '公告已撤回')
  return true
}

// 復原撤回（管理端用）：剛撤回後按 toast 上的「復原」→ 變回已發布，撤回時發給住戶的通知也收回
// 只有撤回的那個人能復原；回傳 true 代表成功
export async function restoreAnnouncement(id, userId) {
  await delay()
  const item = announcements.find((entry) => entry.id === id)
  if (!item || item.status !== 'withdrawn' || item.withdrawnBy !== userId) return false
  // 撤回時發給住戶的「公告已撤回」通知收回來，住戶就不會看到一則已經不成立的通知
  // （從後面往前刪，刪掉一筆後前面的位置不會跑掉）
  for (let index = notifications.length - 1; index >= 0; index--) {
    const notice = notifications[index]
    const isWithdrawNotice = notice.link.id === id && notice.title === '公告已撤回' && notice.at === item.withdrawnAt
    if (isWithdrawNotice) notifications.splice(index, 1)
  }
  item.status = 'published'
  delete item.withdrawnAt
  delete item.withdrawnBy
  delete item.withdrawReason
  return true
}

// 依推播設定發通知給住戶：'all' 全社區 / 'affected' 影響範圍內的住戶 / 'none' 不發
function notifyResidents(item, title) {
  if (item.push === 'none') return
  for (const user of users) {
    if (!user.roles.includes('resident')) continue
    if (item.push === 'affected' && !isRelatedTo(item, user)) continue
    notifications.push({
      id: `n-${item.id}-${notifications.length + 1}`,
      userId: user.id,
      role: 'resident',
      title,
      body: item.title,
      at: MOCK_NOW,
      read: false,
      link: { type: 'announcement', id: item.id },
    })
  }
}

// 表單可以填的欄位（新增、修改都用這些）
const FORM_FIELDS = [
  'type', 'title', 'content', 'startAt', 'endAt', 'timeText', 'areaIds', 'place',
  'organizer', 'isUrgent', 'push', 'caseId', 'equipmentId',
]

// 只留表單的欄位；沒填的（空字串、undefined）不放進去
function pickFormFields(input) {
  const result = {}
  for (const key of FORM_FIELDS) {
    if (input[key] !== undefined && input[key] !== '') result[key] = input[key]
  }
  return result
}

// 發布公告（管理端用），回傳新增好的公告；不能發布的人（見 canPublishAnnouncement）回傳 undefined
//   input 要傳：
//     type        類型，見 ANNOUNCEMENT_TYPES
//     title       標題
//     content     內容說明
//     startAt     開始時間，例如 '2026-10-10T09:00'
//     endAt       結束時間
//     areaIds     影響範圍，例如 ['area-a']、['all']
//     organizer   主辦或負責單位
//     isUrgent    是否標示為緊急
//     push        推播對象：'affected' / 'all' / 'none'
//   選填：timeText（多日的每日時段）、place（活動地點）、caseId、equipmentId
// 要審核的 → 待審核；緊急的 → 直接發布並通知住戶（審核規則見上面）
// 新公告只存在記憶體，重新整理網頁就不見了
export async function createAnnouncement(userId, input) {
  await delay()
  if (!canPublishAnnouncement(userId)) return undefined
  // 新編號：現有最大的編號 + 1，例如 an-014 → an-015
  const maxNumber = Math.max(...announcements.map((item) => Number(item.id.slice(3))))
  const item = {
    id: `an-${String(maxNumber + 1).padStart(3, '0')}`,
    ...pickFormFields(input),
    authorId: userId,
    createdAt: MOCK_NOW,
  }
  if (announcementNeedsReview(item)) {
    item.status = 'pending'
  } else {
    item.status = 'published'
    item.publishedAt = MOCK_NOW
    notifyResidents(item, `新公告：${item.title}`)
  }
  announcements.push(item)
  return present(item, 'committee')
}

// 發通知給主委和副主委（例如管理人員修改了公告），發到管委會端
function notifyChairs(item, title) {
  for (const user of users) {
    if (!COMMITTEE_TITLES[user.committeeTitle]?.canReviewAnnouncement) continue
    notifications.push({
      id: `n-${item.id}-${notifications.length + 1}`,
      userId: user.id,
      role: 'committee',
      title,
      body: item.title,
      at: MOCK_NOW,
      read: false,
      link: { type: 'announcement', id: item.id },
    })
  }
}

// 修改公告（管理端用），回傳修改後的公告；不能改的話回傳 undefined
//   changes 和 createAnnouncement 的 input 一樣，要傳完整的表單內容（沒傳的欄位會被清掉）
// 只有已發布、還沒結束的能改：改完立刻生效，不用重新審核，並通知住戶「公告已更新」
//   管理人員改的，另外通知主委和副主委「XX 修改了公告」（2026-10-14，PR #35 suzy 的建議）
// 已撤回的不能改、不能重新發布（2026-10-14 決定：撤回就結束了，要再發就發一則新的）
export async function updateAnnouncement(id, userId, changes) {
  await delay()
  const item = announcements.find((entry) => entry.id === id)
  if (!item || item.status !== 'published' || item.endAt < MOCK_NOW) return undefined
  if (!canManage(item, userId)) return undefined
  // 先清掉表單的欄位，再放進新的（例如從多日改成單日，timeText 就要拿掉）
  for (const key of FORM_FIELDS) delete item[key]
  Object.assign(item, pickFormFields(changes))
  notifyResidents(item, `公告已更新：${item.title}`)
  if (findUser(userId).roles.includes('staff')) notifyChairs(item, `${userLabel(userId)} 修改了公告`)
  return present(item, 'committee')
}

// 取得緊急標示使用紀錄：誰在什麼時候把公告標成「緊急」
export async function getUrgentLog() {
  await delay()
  const items = announcements
    .filter((item) => item.isUrgent && item.publishedAt)
    .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      at: item.publishedAt,
      authorLabel: userLabel(item.authorId),
    }))
  const thisYear = MOCK_NOW.slice(0, 4) // '2026'
  const thisMonth = MOCK_NOW.slice(0, 7) // '2026-10'
  return {
    items,
    yearCount: items.filter((item) => item.at.startsWith(thisYear)).length,
    monthCount: items.filter((item) => item.at.startsWith(thisMonth)).length,
  }
}
