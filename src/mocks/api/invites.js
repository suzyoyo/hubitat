// 管委會邀請相關的假 API（住戶端「加入管委會」流程用）
import { INVITE_STATUSES, invites } from '../data/invites'
import { mockNow, delay } from './helpers'
import { describeUser, findUser } from './users'

// 算出邀請碼現在的狀態：'valid' 可以用 / 'used' 用過了 / 'expired' 過期了
function inviteStatus(invite) {
  if (invite.result) return 'used' // 已經有人接受或婉拒
  if (invite.expiresAt < mockNow()) return 'expired'
  return 'valid'
}

// 把一筆邀請整理成畫面要用的樣子：多了 status、inviterName
function present(invite) {
  const inviter = findUser(invite.inviterId)
  return {
    ...invite,
    status: inviteStatus(invite),
    inviterName: describeUser(inviter, 'committee').shortName, // 李主委
  }
}

// 用邀請碼查邀請
// 回傳的 status 是 'valid' 才能用；其他狀態（查無此碼、過期、用過）只會有 status 和 message，
// message 是要顯示給住戶看的提示
export async function getInviteByCode(code) {
  await delay()
  const invite = invites.find((item) => item.code === code)
  if (!invite) return { status: 'notFound', message: INVITE_STATUSES.notFound.message }
  const status = inviteStatus(invite)
  if (status !== 'valid') return { status, message: INVITE_STATUSES[status].message }
  return present(invite)
}

// 回覆邀請（接受和婉拒共用）：記下誰、什麼時候、回覆了什麼
// 邀請碼不能用的話回傳 undefined
function respond(code, userId, result) {
  const invite = invites.find((item) => item.code === code)
  if (!invite || inviteStatus(invite) !== 'valid') return undefined
  invite.result = result
  invite.respondedBy = userId
  invite.respondedAt = mockNow()
  return present(invite)
}

// 接受邀請：任期開始日（startDate）才會生效，在那之前身分還是住戶
// 回傳更新後的邀請；邀請碼不能用的話回傳 undefined
// 只改記憶體，重新整理網頁會變回原本的假資料
export async function acceptInvite(code, userId) {
  await delay()
  return respond(code, userId, 'accepted')
}

// 婉拒邀請：這組邀請碼就不能再用了
// 回傳 true 代表成功；邀請碼不能用的話回傳 false
export async function declineInvite(code, userId) {
  await delay()
  return Boolean(respond(code, userId, 'declined'))
}

// 取得我已經接受、還沒生效的邀請（「我的」頁的身分區塊用）；沒有就回傳 undefined
export async function getMyAcceptedInvite(userId) {
  await delay()
  const invite = invites.find((item) => item.respondedBy === userId && item.result === 'accepted')
  return invite ? present(invite) : undefined
}
