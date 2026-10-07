// 通知假資料
// 欄位說明：
//   id     唯一編號
//   userId 收到通知的人（對應 users.js）
//   role   用哪個身分收到的。李伯伯同時是住戶和委員，兩種身分的通知要分開
//   title  標題
//   body   內容
//   at     通知時間
//   read   是否已讀
//   link   點了要去哪裡：type 是資料種類，id 是那筆資料的編號
//          type 可能是 'case' 案件 / 'announcement' 公告 / 'task' 交辦 /
//          'meeting' 會議 / 'proposal' 提案 / 'contract' 合約

export const notifications = [
  // ── 住戶：李伯伯 ────────────────────────────────────────
  {
    id: 'n-001',
    userId: 'u-c04',
    role: 'resident',
    title: '管委會回覆了你的留言',
    body: '你在「2026 年第 3 次管委會」的留言有新回覆',
    at: '2026-10-01T13:32',
    read: false,
    link: { type: 'meeting', id: 'm-2026-03' },
  },
  {
    id: 'n-002',
    userId: 'u-c04',
    role: 'resident',
    title: '通報有新進度',
    body: '頂樓花園｜灑水噴頭漏水・廠商已初步查勘',
    at: '2026-10-01T12:40',
    read: false,
    link: { type: 'case', id: 'CASE-20260923-001' },
  },
  {
    id: 'n-003',
    userId: 'u-c04',
    role: 'resident',
    title: '新公告：A 棟電梯定期保養',
    body: '10/10 上午 09:00–12:00，A 棟',
    at: '2026-10-01T10:40',
    read: true,
    link: { type: 'announcement', id: 'an-002' },
  },
  {
    id: 'n-004',
    userId: 'u-c04',
    role: 'resident',
    title: '新公告：社區年度消毒與除蟲',
    body: '10/5 – 10/7 每日 09:00–17:00，全社區',
    at: '2026-09-30T09:00',
    read: true,
    link: { type: 'announcement', id: 'an-001' },
  },
  {
    id: 'n-005',
    userId: 'u-c04',
    role: 'resident',
    title: '通報有新進度',
    body: '1F 大廳｜感應門故障・已通報原廠工程師排查線路',
    at: '2026-09-25T14:30',
    read: true,
    link: { type: 'case', id: 'CASE-20260920-001' },
  },

  {
    id: 'n-006',
    userId: 'u-c04',
    role: 'resident',
    title: '緊急公告：B2 車道臨時封閉',
    body: '今天 14:00–18:00，請改走 B1 車道出入',
    at: '2026-10-01T13:40',
    read: false,
    link: { type: 'announcement', id: 'an-011' },
  },

  // ── 管委會：李委員 ──────────────────────────────────────
  {
    id: 'n-106',
    userId: 'u-c04',
    role: 'committee',
    title: '管理人員發布了緊急公告',
    body: 'B2 車道臨時封閉，由 張管理員 標示緊急並直接發布',
    at: '2026-10-01T13:40',
    read: false,
    link: { type: 'announcement', id: 'an-011' },
  },
  {
    id: 'n-101',
    userId: 'u-c04',
    role: 'committee',
    title: '住戶在會議紀錄留言',
    body: '2026 年第 3 次管委會：想請問地下室防水工程大概什麼時候…',
    at: '2026-10-01T13:40',
    read: false,
    link: { type: 'meeting', id: 'm-2026-03' },
  },
  {
    id: 'n-102',
    userId: 'u-c04',
    role: 'committee',
    title: '提案等你簽核',
    body: '社區公基金支出提案：中庭植栽更新',
    at: '2026-10-01T12:42',
    read: false,
    link: { type: 'proposal', id: 'P-2026-087' },
  },
  {
    id: 'n-103',
    userId: 'u-c04',
    role: 'committee',
    title: '交辦已回報完成',
    body: '#TASK-104 更換中庭照明燈具，請確認',
    at: '2026-09-29T16:20',
    read: false,
    link: { type: 'task', id: 'TASK-104' },
  },
  {
    id: 'n-104',
    userId: 'u-c04',
    role: 'committee',
    title: '合約即將到期',
    body: '大同電梯・電梯定期保養與故障維修，10/08 到期',
    at: '2026-09-30T09:00',
    read: true,
    link: { type: 'contract', id: 'ct-001' },
  },
  {
    id: 'n-105',
    userId: 'u-c04',
    role: 'committee',
    title: '案件已逾期',
    body: 'B2 車道排水孔堵塞，尚未指派廠商',
    at: '2026-09-30T08:00',
    read: true,
    link: { type: 'case', id: 'CASE-20260925-003' },
  },

  // ── 管委會：王主委（公告要由主委或副主委審核）──────────────
  {
    id: 'n-151',
    userId: 'u-c01',
    role: 'committee',
    title: '有 1 則公告待你審核',
    body: 'C 棟電梯停機檢測通知，由 張管理員 送出',
    at: '2026-10-01T13:32',
    read: false,
    link: { type: 'announcement', id: 'an-007' },
  },

  // ── 管理人員：張管理員 ──────────────────────────────────
  {
    id: 'n-201',
    userId: 'u-s02',
    role: 'staff',
    title: '你提交的公告已送出',
    body: 'C 棟電梯停機檢測通知，待管委會審核',
    at: '2026-10-01T13:32',
    read: false,
    link: { type: 'announcement', id: 'an-007' },
  },
  {
    id: 'n-202',
    userId: 'u-s02',
    role: 'staff',
    title: '新報修待處理',
    body: 'A 棟 2F 水管漏水，住戶剛送出報修',
    at: '2026-10-01T11:42',
    read: false,
    link: { type: 'case', id: 'CASE-20261001-001' },
  },
  {
    id: 'n-203',
    userId: 'u-s02',
    role: 'staff',
    title: '交辦今天到期',
    body: '#TASK-099 檢查滅火器效期，今天 18:00 前',
    at: '2026-10-01T09:00',
    read: false,
    link: { type: 'task', id: 'TASK-099' },
  },
  {
    id: 'n-204',
    userId: 'u-s02',
    role: 'staff',
    title: '案件待標記完成',
    body: 'C 棟電梯異音檢修，廠商已完工',
    at: '2026-09-25T16:30',
    read: true,
    link: { type: 'case', id: 'CASE-20260922-002' },
  },
  {
    id: 'n-205',
    userId: 'u-s02',
    role: 'staff',
    title: '合約即將到期',
    body: '大同電梯・電梯定期保養與故障維修，10/08 到期',
    at: '2026-09-30T09:00',
    read: true,
    link: { type: 'contract', id: 'ct-001' },
  },
]
