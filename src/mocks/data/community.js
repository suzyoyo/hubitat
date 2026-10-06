// 社區假資料：基本資料、地點清單、問題分類、內部聯絡、鑰匙清單

// 社區基本資料
export const community = {
  name: '好彼社區 翠峰閣',
  address: '臺北市○○區○○路 100 號',
  buildingCount: 3, // 棟數
  householdCount: 120, // 戶數
  phone: '02-2345-6789',
  status: '正常營運',
  updatedBy: 'u-c01', // 最後修改的人（對應 users.js 的 id）
  updatedAt: '2026-09-01',
}

// 地點清單：分成兩層，「範圍」底下有多個「地點」
// 住戶通報、登記報修、公告的影響範圍、設備位置，都從這裡選
// 欄位說明：
//   id      唯一編號
//   name    範圍名稱
//   type    'building' 棟別 / 'facility' 公設區域
//   places  這個範圍底下的地點；active: false 表示已停用（不再讓人選，但舊資料仍看得到）
export const areas = [
  {
    id: 'area-a',
    name: 'A 棟',
    type: 'building',
    places: [
      { id: 'a-lobby', name: '1F 大廳', active: true },
      { id: 'a-elevator', name: '電梯', active: true },
      { id: 'a-hall', name: '梯廳', active: true },
      { id: 'a-corridor', name: '各樓層走廊', active: true },
      { id: 'a-stairs', name: '樓梯間', active: true },
      { id: 'a-roof', name: '頂樓', active: true },
      { id: 'a-mailbox', name: '信箱區', active: true },
      { id: 'a-machine', name: '1 樓機房', active: true },
      { id: 'a-gym-old', name: '舊健身房（B1）', active: false },
    ],
  },
  {
    id: 'area-b',
    name: 'B 棟',
    type: 'building',
    places: [
      { id: 'b-lobby', name: '1F 大廳', active: true },
      { id: 'b-elevator', name: '電梯', active: true },
      { id: 'b-hall', name: '梯廳', active: true },
      { id: 'b-corridor', name: '各樓層走廊', active: true },
      { id: 'b-stairs', name: '樓梯間', active: true },
      { id: 'b-roof', name: '頂樓', active: true },
      { id: 'b-mailbox', name: '信箱區', active: true },
      { id: 'b-machine', name: '1 樓機房', active: true },
      { id: 'b-mailbox-old', name: '舊信箱', active: false },
    ],
  },
  {
    id: 'area-c',
    name: 'C 棟',
    type: 'building',
    places: [
      { id: 'c-elevator', name: '電梯', active: true },
      { id: 'c-hall', name: '梯廳', active: true },
      { id: 'c-stairs', name: '樓梯間', active: true },
      { id: 'c-roof', name: '頂樓', active: true },
      { id: 'c-mailbox', name: '信箱區', active: true },
    ],
  },
  {
    id: 'area-parking',
    name: '地下停車場',
    type: 'facility',
    places: [
      { id: 'p-b1-lane', name: 'B1 車道', active: true },
      { id: 'p-b2-lane', name: 'B2 車道', active: true },
      { id: 'p-b2-hall', name: 'B2 梯廳', active: true },
      { id: 'p-machine', name: '地下室機房', active: true },
    ],
  },
  {
    id: 'area-pool',
    name: '游泳池',
    type: 'facility',
    places: [
      { id: 'pool-main', name: '泳池', active: true },
      { id: 'pool-locker', name: '淋浴更衣間', active: true },
      { id: 'pool-machine', name: '泳池機房', active: true },
    ],
  },
  {
    id: 'area-outdoor',
    name: '中庭與戶外',
    type: 'facility',
    places: [
      { id: 'o-garden', name: '1F 中庭花園', active: true },
      { id: 'o-roof-garden', name: '頂樓花園', active: true },
      { id: 'o-water-tower', name: '頂樓水塔區', active: true },
      { id: 'o-trash', name: '垃圾集中場', active: true },
    ],
  },
]

// 問題分類（案件用）：key 是存在資料裡的值，label 是畫面上顯示的文字
export const ISSUE_CATEGORIES = {
  leak: { label: '漏水' },
  equipment: { label: '設備故障' },
  lighting: { label: '照明' },
  plumbing: { label: '水電' },
  door: { label: '門窗鎖具' },
  noise: { label: '噪音' },
  other: { label: '其他' },
}

// 社區內部聯絡（廠商頁的「社區內部聯絡」）
// userId 有值時，姓名和職稱從 users.js 帶入
export const internalContacts = [
  { id: 'ic-1', name: '中控室', note: '24 小時', phone: '02-2345-6789' },
  { id: 'ic-2', userId: 'u-s01', phone: '0922-111-222' },
  { id: 'ic-3', userId: 'u-c01', phone: '0933-333-444' },
]

// 鑰匙清單：哪把鑰匙由誰保管（keeperId 對應 users.js 的 id）
export const keys = [
  { id: 'k-1', name: '機房與頂樓鑰匙', keeperId: 'u-s01' },
  { id: 'k-2', name: '消防受信總機室', keeperId: 'u-s01' },
  { id: 'k-3', name: '游泳池機房', keeperId: 'u-s01' },
  { id: 'k-4', name: '管委會辦公室保險櫃', keeperId: 'u-c01' },
]
