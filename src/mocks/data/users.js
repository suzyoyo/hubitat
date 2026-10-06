// 成員假資料：住戶、委員、管理人員
// 欄位說明：
//   id             唯一編號（u-c 開頭是委員、u-s 是管理人員、u-r 是一般住戶）
//   name           住戶身分顯示的名稱
//   surname        姓。委員身分會顯示成「姓 + 委員」，例如「李委員」
//   roles          這個人有哪些身分，可以不只一個：
//                  'resident' 住戶 / 'committee' 管委會 / 'staff' 管理人員
//   building       棟別（住戶才有）
//   unit           戶號（住戶才有）
//   committeeTitle 委員職稱（委員才有），見下方 COMMITTEE_TITLES
//   staffTitle     管理人員職稱（管理人員才有），見下方 STAFF_TITLES

// 目前這一屆管委會
export const TERM = {
  number: 12, // 第 12 屆
  startDate: '2026-07-01',
  endDate: '2027-06-30',
}

// 委員職稱：short 是簡稱，用在簽核名單這種空間小的地方（例如「王主委」）
// canReviewAnnouncement：能不能審核公告（只有主委、副主委可以）
export const COMMITTEE_TITLES = {
  chair: { label: '主委', short: '主委', canReviewAnnouncement: true },
  viceChair: { label: '副主委', short: '副主委', canReviewAnnouncement: true },
  finance: { label: '財務委員', short: '財務', canReviewAnnouncement: false },
  repair: { label: '修繕委員', short: '修繕', canReviewAnnouncement: false },
  audit: { label: '監察委員', short: '監察', canReviewAnnouncement: false },
}

// 管理人員職稱
export const STAFF_TITLES = {
  manager: { label: '總幹事' },
  clerk: { label: '管理員' },
  guard: { label: '警衛' },
}

export const users = [
  // 示範用的主角：李伯伯是住戶，同時也是修繕委員（管委會端顯示「李委員」）
  {
    id: 'u-c04',
    name: '李伯伯',
    surname: '李',
    roles: ['resident', 'committee'],
    building: 'A',
    unit: '8樓之1',
    committeeTitle: 'repair',
  },

  // 其他委員（委員本身也都是住戶）
  {
    id: 'u-c01',
    name: '王先生',
    surname: '王',
    roles: ['resident', 'committee'],
    building: 'A',
    unit: '5樓之1',
    committeeTitle: 'chair',
  },
  {
    id: 'u-c02',
    name: '張太太',
    surname: '張',
    roles: ['resident', 'committee'],
    building: 'B',
    unit: '3樓之2',
    committeeTitle: 'viceChair',
  },
  {
    id: 'u-c03',
    name: '陳小姐',
    surname: '陳',
    roles: ['resident', 'committee'],
    building: 'C',
    unit: '6樓之1',
    committeeTitle: 'finance',
  },
  {
    id: 'u-c05',
    name: '林先生',
    surname: '林',
    roles: ['resident', 'committee'],
    building: 'B',
    unit: '10樓之1',
    committeeTitle: 'audit',
  },

  // 管理人員
  { id: 'u-s01', name: '王小姐', surname: '王', roles: ['staff'], staffTitle: 'manager' },
  { id: 'u-s02', name: '張管理員', surname: '張', roles: ['staff'], staffTitle: 'clerk' },
  { id: 'u-s03', name: '黃組長', surname: '黃', roles: ['staff'], staffTitle: 'guard' },

  // 一般住戶（通報人、留言人會用到）
  { id: 'u-r01', name: '陳先生', surname: '陳', roles: ['resident'], building: 'B', unit: '8樓之2' },
  { id: 'u-r02', name: '吳小姐', surname: '吳', roles: ['resident'], building: 'A', unit: '2樓之1' },
  { id: 'u-r03', name: '周太太', surname: '周', roles: ['resident'], building: 'A', unit: '5樓之2' },
  { id: 'u-r04', name: '許先生', surname: '許', roles: ['resident'], building: 'C', unit: '4樓之1' },
]

// 還沒有登入功能：先固定每個角色「目前登入」的是誰
export const CURRENT_USER_IDS = {
  resident: 'u-c04', // 李伯伯
  committee: 'u-c04', // 李委員（同一個人，切換到管委會身分）
  staff: 'u-s02', // 張管理員
}
