// 提案假資料：委員發起提案，其他委員在期限內逐一簽核表達意見
// 提醒：逐一簽核只是委員意見紀錄，不等於開會表決。需要執行的提案仍要送管委會決議。
// 欄位說明：
//   id          案號，格式 P-年度-流水號（畫面顯示成「#2026-088」）
//   title       提案標題
//   description 提案說明
//   proposerId  發起人（對應 users.js）
//   createdAt   發起時間
//   deadline    簽核截止日
//   kind        簽核方式：
//                 'approve' 表示同意或不同意
//                 'options' 從幾個選項裡選一個（例如三家廠商的報價）
//   options     kind 是 'options' 時的選項：key 代號 / name 名稱 / quote 報價（元）/ file 附件
//   signatures  已經簽核的委員：
//                 userId 誰 / at 何時
//                 decision 'agree' 同意、'disagree' 不同意，或選項的 key（例如 'A'）
//                 comment 意見（選填）。意見會以不具名方式給所有委員看
//
// 提案狀態不存在資料裡，由假 API 依簽核情況計算：
//   所有委員都簽了 → 同意過半是「已通過」，否則「已否決」
//   還有人沒簽     → 「簽核中」

export const PROPOSAL_STATUSES = {
  signing: { label: '簽核中' },
  passed: { label: '已通過' },
  rejected: { label: '已否決' },
}

export const proposals = [
  {
    id: 'P-2026-088',
    title: '社區公基金支出提案：B 棟中庭排水設施更換',
    description:
      '擬動用公基金 15 萬元，更換 B 棟中庭排水設施。現有排水管已使用 18 年，今年颱風期間兩度積水，廠商評估需整段更換。',
    proposerId: 'u-c01',
    createdAt: '2026-09-21T10:00',
    deadline: '2026-10-10',
    kind: 'options',
    options: [
      { key: 'A', name: '安欣工程', quote: 150000, file: '安欣工程_估價單.pdf' },
      { key: 'B', name: '立信水電行', quote: 138000, file: '立信水電_估價單.pdf' },
      { key: 'C', name: '昇益工程行', quote: 162000, file: '昇益工程_估價單.pdf' },
    ],
    signatures: [
      { userId: 'u-c01', at: '2026-09-21T10:05', decision: 'A', comment: '同意更換，但希望廠商保固至少 2 年。' },
      { userId: 'u-c02', at: '2026-09-22T20:30', decision: 'B', comment: '建議再比價一家，A 廠報價偏高。' },
    ],
  },
  {
    id: 'P-2026-087',
    title: '社區公基金支出提案：中庭植栽更新',
    description: '依第 3 次管委會決議，更換中庭枯損植栽並增設自動灑水系統，預算上限 8 萬元。',
    proposerId: 'u-c03',
    createdAt: '2026-09-26T09:00',
    deadline: '2026-10-10',
    kind: 'approve',
    signatures: [
      { userId: 'u-c03', at: '2026-09-26T09:05', decision: 'agree', comment: '' },
      { userId: 'u-c01', at: '2026-09-27T21:10', decision: 'agree', comment: '請優先選用耐旱的本土植栽。' },
    ],
  },
  {
    id: 'P-2026-085',
    title: '地下室防水工程追加預算',
    description: '颱風後 B2 滲漏範圍擴大，擬追加第三方勘驗與臨時止漏費用 4.8 萬元。',
    proposerId: 'u-c04',
    createdAt: '2026-09-18T15:00',
    deadline: '2026-10-15',
    kind: 'approve',
    signatures: [
      { userId: 'u-c04', at: '2026-09-18T15:05', decision: 'agree', comment: '' },
      { userId: 'u-c01', at: '2026-09-19T08:40', decision: 'agree', comment: '同意，請盡快安排勘驗。' },
      { userId: 'u-c05', at: '2026-09-20T12:15', decision: 'agree', comment: '' },
    ],
  },
  {
    id: 'P-2026-080',
    title: '電梯保養廠商續約',
    description: '大同電梯合約將於 10/08 到期，擬以原條件續約 1 年。',
    proposerId: 'u-c02',
    createdAt: '2026-09-05T10:00',
    deadline: '2026-09-15',
    kind: 'approve',
    signatures: [
      { userId: 'u-c02', at: '2026-09-05T10:05', decision: 'agree', comment: '' },
      { userId: 'u-c01', at: '2026-09-06T09:00', decision: 'agree', comment: '' },
      { userId: 'u-c03', at: '2026-09-07T19:20', decision: 'agree', comment: '價格合理。' },
      { userId: 'u-c04', at: '2026-09-08T08:15', decision: 'agree', comment: '今年維修都很快到場。' },
      { userId: 'u-c05', at: '2026-09-10T22:00', decision: 'agree', comment: '' },
    ],
  },
  {
    id: 'P-2026-076',
    title: '增設中庭監視器（第二期）',
    description: '擬於中庭南北兩側再增設 2 支監視器，預算 3.6 萬元。',
    proposerId: 'u-c02',
    createdAt: '2026-08-20T10:00',
    deadline: '2026-08-31',
    kind: 'approve',
    signatures: [
      { userId: 'u-c02', at: '2026-08-20T10:05', decision: 'agree', comment: '' },
      { userId: 'u-c05', at: '2026-08-21T20:00', decision: 'agree', comment: '' },
      { userId: 'u-c01', at: '2026-08-22T09:30', decision: 'disagree', comment: '第一期才剛裝好，建議觀察半年再評估。' },
      { userId: 'u-c03', at: '2026-08-23T18:45', decision: 'disagree', comment: '今年度預算已吃緊。' },
      { userId: 'u-c04', at: '2026-08-25T07:50', decision: 'disagree', comment: '' },
    ],
  },
]
