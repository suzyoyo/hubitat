// 交辦假資料：指派某個人處理一件事（通常是管委會交辦給管理人員）
// 欄位說明：
//   id         交辦編號，格式 TASK-流水號
//   title      交辦標題
//   content    交辦內容（最多 200 字）
//   assignerId 交辦人（對應 users.js）
//   assigneeId 交辦對象
//   createdAt  建立時間
//   deadline   完成期限。「已逾期」是用今天的時間算出來的
//   status     狀態，見下方 TASK_STATUSES
//   caseId     關聯的案件（沒有就不寫）
//   report     對方的完成回報：at 時間 / note 備註 / files 附件（還沒回報就不寫）
//   doneAt     交辦人確認完成的時間（還沒確認就不寫）

// 存在資料裡的狀態
export const TASK_STATUSES = {
  in_progress: { label: '進行中' },
  reported: { label: '待確認' }, // 對方已回報完成，等交辦人確認
  done: { label: '已完成' },
  withdrawn: { label: '已撤回' },
}

// 畫面上顯示的狀態：多一個用期限算出來的「已逾期」
export const TASK_DISPLAY_STATUSES = {
  ...TASK_STATUSES,
  overdue: { label: '已逾期' },
}

export const tasks = [
  {
    id: 'TASK-104',
    title: '更換中庭照明燈具',
    content: '中庭東側兩盞景觀燈不亮，請聯絡水電廠商更換並確認定時器正常。',
    assignerId: 'u-c04',
    assigneeId: 'u-s01',
    createdAt: '2026-09-24T10:00',
    deadline: '2026-09-30T18:00',
    status: 'reported',
    report: {
      at: '2026-09-29T16:20',
      note: '已請立信水電行更換兩盞燈具，定時器測試正常。',
      files: ['更換後.jpg'],
    },
  },
  {
    id: 'TASK-102',
    title: '彙整本年度消防安檢報告',
    content: '請彙整今年度消防安全設備檢修申報資料，例會前交給主委。',
    assignerId: 'u-c01',
    assigneeId: 'u-c04',
    createdAt: '2026-09-22T09:00',
    deadline: '2026-10-01T18:00',
    status: 'in_progress',
  },
  {
    id: 'TASK-101',
    title: '彙整本月維修費用明細',
    content: '請整理 9 月份所有維修支出與收據，月底前提供給財務委員。',
    assignerId: 'u-c03',
    assigneeId: 'u-s01',
    createdAt: '2026-09-20T14:00',
    deadline: '2026-09-28T18:00',
    status: 'in_progress',
  },
  {
    id: 'TASK-099',
    title: '檢查滅火器效期',
    content: '請逐層檢查各棟梯間滅火器的效期與壓力，過期的列出清單。',
    assignerId: 'u-c04',
    assigneeId: 'u-s02',
    createdAt: '2026-09-26T11:00',
    deadline: '2026-10-01T18:00',
    status: 'in_progress',
  },
  {
    id: 'TASK-095',
    title: '確認廠商保險文件',
    content: '請向昇益工程行索取施工期間的公共意外責任險保單影本。',
    assignerId: 'u-c04',
    assigneeId: 'u-s01',
    createdAt: '2026-09-25T15:30',
    deadline: '2026-10-05T18:00',
    status: 'in_progress',
    caseId: 'CASE-20260918-001',
  },
  {
    id: 'TASK-092',
    title: '聯繫廠商處理 B2 車道排水孔',
    content: '請聯繫兩家廠商，報價 B2 車道排水孔疏通與維修工程。',
    assignerId: 'u-c04',
    assigneeId: 'u-s01',
    createdAt: '2026-09-26T09:40',
    deadline: '2026-10-08T18:00',
    status: 'in_progress',
    caseId: 'CASE-20260925-003',
  },
  {
    id: 'TASK-088',
    title: '確認消防安全檢查改善報告',
    content: '年度機電與消檢申報缺失項目複查，請於期限前拍照存證並上傳原廠改善證明文件。',
    assignerId: 'u-c01',
    assigneeId: 'u-s01',
    createdAt: '2026-09-10T09:00',
    deadline: '2026-09-20T18:00',
    status: 'done',
    report: {
      at: '2026-09-18T15:00',
      note: '已依廠商建議完成改善，照片為完工後現況。',
      files: ['IMG_0421.jpg', '消防改善報告_v2.pdf'],
    },
    doneAt: '2026-09-19T10:00',
  },
  {
    id: 'TASK-085',
    title: '張貼中秋活動海報',
    content: '請於各棟大廳與電梯內張貼中秋活動海報。',
    assignerId: 'u-c02',
    assigneeId: 'u-s02',
    createdAt: '2026-09-12T10:00',
    deadline: '2026-09-15T18:00',
    status: 'done',
    report: { at: '2026-09-14T11:00', note: '三棟大廳與電梯皆已張貼。', files: ['海報.jpg'] },
    doneAt: '2026-09-14T14:00',
  },
]
