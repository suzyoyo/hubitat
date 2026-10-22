// 通知假資料
// 欄位說明：
//   id     唯一編號
//   userId 收到通知的人（對應 users.js）
//   role   用哪個身分收到的。李先生同時是住戶和委員，兩種身分的通知要分開
//   title  標題
//   body   內容
//   at     通知時間
//   read   是否已讀。假資料一律是已讀（2026-10-19）：展示一開始鈴鐺沒有紅點，操作後新出現的通知才是未讀
//   link   點了要去哪裡：type 是資料種類，id 是那筆資料的編號
//          type 可能是 'case' 案件 / 'announcement' 公告 / 'task' 交辦 /
//          'meeting' 會議 / 'proposal' 提案 / 'contract' 合約

export const notifications = [
  // ── 住戶：李先生 ────────────────────────────────────────
  {
    id: 'n-001',
    userId: 'u-c04',
    role: 'resident',
    title: '管委會回覆了你的留言',
    body: '你在「2026 年第 3 次管委會」的留言有新回覆',
    at: '2026-10-28T07:22',
    read: true,
    link: { type: 'meeting', id: 'm-2026-03' },
  },
  {
    id: 'n-003',
    userId: 'u-c04',
    role: 'resident',
    title: '新公告：A 棟電梯定期保養',
    body: '11/6 上午 09:00–12:00，A 棟',
    at: '2026-10-28T06:40',
    read: true,
    link: { type: 'announcement', id: 'an-002' },
  },
  {
    id: 'n-004',
    userId: 'u-c04',
    role: 'resident',
    title: '新公告：社區年度消毒與除蟲',
    body: '11/1 – 11/3 每日 09:00–17:00，全社區',
    at: '2026-10-27T09:00',
    read: true,
    link: { type: 'announcement', id: 'an-001' },
  },

  {
    id: 'n-006',
    userId: 'u-c04',
    role: 'resident',
    title: '緊急公告：B2 車道臨時封閉',
    body: '今天 14:00–18:00，請改走 B1 車道出入',
    at: '2026-10-28T07:30',
    read: true,
    link: { type: 'announcement', id: 'an-011' },
  },

  // ── 住戶：其他住戶（2026-10-16 從李先生那一區搬過來：這兩件通報的通報人換成鄰居了）──────
  {
    id: 'n-002',
    userId: 'u-r04', // 2026-10-16 跟著通報人改（原本是李先生）
    role: 'resident',
    title: '通報已受理', // 2026-10-20 改：住戶只在受理、結案時收到通知（原本是「通報有新進度」）
    body: '你通報的「頂樓花園灑水噴頭漏水」已受理，點擊查看處理進度',
    at: '2026-10-21T15:20',
    read: true,
    link: { type: 'case', id: 'CASE-20261020-001' },
  },
  {
    id: 'n-005',
    userId: 'u-r03', // 2026-10-16 跟著通報人改（原本是李先生）
    role: 'resident',
    title: '通報已受理', // 2026-10-20 改：住戶只在受理、結案時收到通知（原本是「通報有新進度」）
    body: '你通報的「A 棟 1F 大廳感應門故障」已受理，點擊查看處理進度',
    at: '2026-10-19T09:00',
    read: true,
    link: { type: 'case', id: 'CASE-20261017-001' },
  },

  // ── 住戶：陳先生（2026-10-19 加：展示用的人鈴鐺裡都要有以前的通知，不能是空的）──────
  {
    id: 'n-007',
    userId: 'u-r01',
    role: 'resident',
    title: '緊急公告：B2 車道臨時封閉',
    body: '今天 14:00–18:00，請改走 B1 車道出入',
    at: '2026-10-28T07:30',
    read: true,
    link: { type: 'announcement', id: 'an-011' },
  },
  {
    id: 'n-008',
    userId: 'u-r01',
    role: 'resident',
    title: '新公告：秋季社區烤肉聯誼',
    body: '10/31 18:00–21:00，A 棟中庭',
    at: '2026-10-27T21:00',
    read: true,
    link: { type: 'announcement', id: 'an-006' },
  },
  {
    id: 'n-009',
    userId: 'u-r01',
    role: 'resident',
    title: '新公告：社區年度消毒與除蟲',
    body: '11/1 – 11/3 每日 09:00–17:00，全社區',
    at: '2026-10-27T09:00',
    read: true,
    link: { type: 'announcement', id: 'an-001' },
  },
  {
    id: 'n-010',
    userId: 'u-r01',
    role: 'resident',
    title: '新公告：B 棟頂樓防水施工',
    body: '10/21 – 10/28 每日 08:30–17:00，B 棟',
    at: '2026-10-19T16:00',
    read: true,
    link: { type: 'announcement', id: 'an-004' },
  },
  {
    id: 'n-011',
    userId: 'u-r01',
    role: 'resident',
    title: '通報已結案',
    body: '你通報的「B 棟電梯門機異音」已結案，點擊查看處理結果',
    at: '2026-07-09T15:00',
    read: true,
    link: { type: 'case', id: 'CASE-20260707-001' },
  },

  // ── 管委會：李委員（主委）──────────────────────────────────────
  {
    id: 'n-106',
    userId: 'u-c04',
    role: 'committee',
    title: '緊急公告已發布', // 2026-10-21 改：和 notifyCommittee 發的一樣（api/announcements.js）
    body: '張管理員發布了緊急公告：B2 車道臨時封閉',
    at: '2026-10-28T07:30',
    read: true,
    link: { type: 'announcement', id: 'an-011' },
  },
  {
    id: 'n-101',
    userId: 'u-c04',
    role: 'committee',
    title: '住戶在會議紀錄留言',
    body: '2026 年第 3 次管委會：想請問地下室防水工程大概什麼時候…',
    at: '2026-10-28T07:30',
    read: true,
    link: { type: 'meeting', id: 'm-2026-03' },
  },
  {
    id: 'n-102',
    userId: 'u-c04',
    role: 'committee',
    title: '提案等你簽核',
    body: '社區公基金支出提案：中庭植栽更新',
    at: '2026-10-28T07:10',
    read: true,
    link: { type: 'proposal', id: 'P-2026-087' },
  },
  {
    id: 'n-103',
    userId: 'u-c04',
    role: 'committee',
    title: '交辦已回報完成',
    body: '#TASK-104 更換中庭照明燈具，請確認',
    at: '2026-10-26T16:20',
    read: true,
    link: { type: 'task', id: 'TASK-104' },
  },
  {
    id: 'n-104',
    userId: 'u-c04',
    role: 'committee',
    title: '合約即將到期',
    body: '大同電梯・電梯定期保養與故障維修，11/04 到期',
    at: '2026-10-27T09:00',
    read: true,
    link: { type: 'contract', id: 'ct-001' },
  },
  {
    id: 'n-105',
    userId: 'u-c04',
    role: 'committee',
    title: '案件已逾期',
    body: 'B2 車道排水孔堵塞，尚未指派廠商',
    at: '2026-10-27T08:00',
    read: true,
    link: { type: 'case', id: 'CASE-20261022-003' },
  },

  // ── 管委會：李主委（公告要由主委或副主委審核）──────────────
  {
    id: 'n-151',
    userId: 'u-c04',
    role: 'committee',
    title: '有 1 則公告待你審核',
    body: 'C 棟電梯停機檢測通知，由張管理員送出',
    at: '2026-10-28T07:22',
    read: true,
    link: { type: 'announcement', id: 'an-007' },
  },

  // ── 管理人員：張管理員 ──────────────────────────────────
  {
    id: 'n-201',
    userId: 'u-s02',
    role: 'staff',
    title: '你提交的公告已送出',
    body: 'C 棟電梯停機檢測通知，待管委會審核',
    at: '2026-10-28T07:22',
    read: true,
    link: { type: 'announcement', id: 'an-007' },
  },
  {
    id: 'n-202',
    userId: 'u-s02',
    role: 'staff',
    title: '新的住戶通報', // 2026-10-21 改：和 api/cases.js 發的一樣（原本是「新通報」）
    body: 'A 棟 2F 水管漏水，住戶剛送出通報',
    at: '2026-10-28T07:00',
    read: true,
    link: { type: 'case', id: 'CASE-20261028-001' },
  },
  {
    id: 'n-203',
    userId: 'u-s02',
    role: 'staff',
    title: '交辦今天到期',
    body: '#TASK-099 檢查滅火器效期，今天 18:00 前',
    at: '2026-10-28T06:10',
    read: true,
    link: { type: 'task', id: 'TASK-099' },
  },
  {
    id: 'n-204',
    // 2026-10-15 改：完工驗收後等負責人（張副主委）結案，通知負責人（docs/case-flow.md）
    userId: 'u-c02',
    role: 'committee',
    title: '案件待結案',
    body: 'C 棟電梯異音檢修，已完工驗收，請結案',
    at: '2026-10-22T16:30',
    read: true,
    link: { type: 'case', id: 'CASE-20261019-002' },
  },
  {
    id: 'n-205',
    userId: 'u-s02',
    role: 'staff',
    title: '合約即將到期',
    body: '大同電梯・電梯定期保養與故障維修，11/04 到期',
    at: '2026-10-27T09:00',
    read: true,
    link: { type: 'contract', id: 'ct-001' },
  },
]
