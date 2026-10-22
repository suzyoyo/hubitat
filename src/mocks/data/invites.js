// 管委會邀請假資料：主委給住戶一組邀請碼，住戶輸入後可以接受或婉拒
// 欄位說明：
//   id           唯一編號
//   code         邀請碼，6 位數字
//   inviterId    誰邀請的（對應 users.js 的 id）
//   term         邀請加入第幾屆
//   roleLabel    加入後的職稱
//   startDate    任期開始日，這一天才生效
//   endDate      任期結束日
//   expiresAt    邀請碼的期限（建立後 72 小時）
//   result       住戶的回覆：null 還沒回覆 / 'accepted' 已接受 / 'declined' 已婉拒
//   respondedBy  誰回覆的（對應 users.js 的 id）；一組邀請碼只能用一次
//   respondedAt  回覆的時間
// 「過期了沒」會隨時間變，不存在資料裡，由假 API 用 expiresAt 算

// 邀請碼是幾位數
export const INVITE_CODE_LENGTH = 6

// 邀請碼的狀態：message 是不能用的時候，輸入頁要顯示的提示
export const INVITE_STATUSES = {
  valid: { label: '可以使用', message: '' },
  notFound: { label: '查無此碼', message: '找不到這組邀請碼，請確認有沒有輸入錯誤' },
  expired: { label: '已過期', message: '這組邀請碼已經過期，請主委重新提供' },
  used: { label: '已使用', message: '這組邀請碼已經使用過，請主委重新提供' },
}

export const invites = [
  // 可以用的：昨天建立，還在 72 小時內
  {
    id: 'inv-001',
    code: '482913',
    inviterId: 'u-c04',
    term: 13,
    roleLabel: '一般委員',
    startDate: '2027-07-28',
    endDate: '2028-07-27',
    expiresAt: '2026-10-30T10:00',
    result: null,
    respondedBy: null,
    respondedAt: null,
  },
  // 過期的：上週建立，沒有人用
  {
    id: 'inv-002',
    code: '135790',
    inviterId: 'u-c04',
    term: 13,
    roleLabel: '一般委員',
    startDate: '2027-07-28',
    endDate: '2028-07-27',
    expiresAt: '2026-10-24T09:00',
    result: null,
    respondedBy: null,
    respondedAt: null,
  },
  // 用過的：吳小姐已經接受
  {
    id: 'inv-003',
    code: '246810',
    inviterId: 'u-c04',
    term: 13,
    roleLabel: '一般委員',
    startDate: '2027-07-28',
    endDate: '2028-07-27',
    expiresAt: '2026-10-29T15:00',
    result: 'accepted',
    respondedBy: 'u-r02',
    respondedAt: '2026-10-27T20:10',
  },
]
