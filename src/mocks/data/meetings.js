// 會議假資料：會議紀錄、決議事項、住戶留言
// 欄位說明：
//   id          唯一編號
//   type        會議類型，見下方 MEETING_TYPES
//   title       會議名稱
//   heldAt      召開時間
//   place       地點
//   attendance  出席狀況：total 應到 / present 實到 / proxy 委託 / guests 列席者
//   status      整理進度，見下方 MEETING_STATUSES。住戶和管理人員只看得到「已發布」的
//   uploadedAt  會議紀錄上傳的日期
//   publishedAt 發布給住戶的時間（還沒發布就不寫）
//   files       檔案（只有管委會看得到）
//                 minutes 會議紀錄原始檔：name 檔名 / sizeMB 大小
//                 signIn  簽名簿與委託書的檔名；空陣列代表「缺簽名簿檔案」
//   resolutions 決議（見下方說明）
//   highlights  住戶版的「本次決議重點」，一點一句
//   summary     住戶版的重點摘要（一段話）
//   fullText    住戶版的全文記錄（已遮蔽個資），分成幾個段落
//                 heading 段落標題 / body 內容 / tag 標籤（例如「通過」，沒有就不寫）
//   maskedCount 全文裡自動遮蔽了幾處個資
//   comments    住戶留言（見下方說明）
//
// 決議 resolutions 的欄位：
//   id        唯一編號
//   title     決議標題
//   note      補充說明（住戶版議案列表的第二行）
//   result    結果，見下方 RESOLUTION_RESULTS
//   votes     表決票數：yes 同意 / no 反對（沒有表決就不寫）
//   ownerId   負責人（對應 users.js）
//   execution 執行狀態，見下方 EXECUTION_STATUSES（不需要執行的就不寫，例如報告事項）
//   taskId    已經交辦的話，對應的交辦編號（還沒交辦就不寫）
//
// 住戶留言 comments 的欄位：
//   id / userId 留言的住戶 / at 留言時間 / text 內容（最多 300 字）
//   reply 管委會的回覆：at 時間 / byId 回覆的委員 / text 內容（還沒回覆就不寫）

export const MEETING_TYPES = {
  regular: { label: '管委會例會' },
  special: { label: '臨時會議' },
  general: { label: '區分所有權人會議' },
}

export const MEETING_STATUSES = {
  organizing: { label: '待整理' }, // 紀錄已上傳，還沒整理決議、遮蔽個資
  pending: { label: '待發布' }, // 整理好了，等其他委員確認後發布
  published: { label: '已發布' },
}

export const RESOLUTION_RESULTS = {
  passed: { label: '通過' },
  rejected: { label: '未通過' },
  deferred: { label: '下次續審' },
  report: { label: '報告事項' },
}

export const EXECUTION_STATUSES = {
  not_started: { label: '未執行' },
  in_progress: { label: '進行中' },
  done: { label: '已完成' },
}

// 下一次定期會議（住戶端「管委會報告」最上面顯示）
export const nextMeeting = {
  heldAt: '2026-10-18T19:30',
  place: '一樓社區管委會會議室',
}

export const meetings = [
  {
    id: 'm-2026-t2',
    type: 'special',
    title: '2026 年第 2 次臨時會議',
    heldAt: '2026-09-28T19:30',
    place: '社區 B1 多功能會議室',
    attendance: { total: 5, present: 4, proxy: 0, guests: ['u-s01'] },
    status: 'organizing',
    uploadedAt: '2026-09-29',
    files: { minutes: { name: '臨時會議紀錄_0928.pdf', sizeMB: 1.1 }, signIn: [] },
    resolutions: [],
    comments: [],
  },
  {
    id: 'm-2026-03',
    type: 'regular',
    title: '2026 年第 3 次管委會',
    heldAt: '2026-09-20T19:30',
    place: '社區 B1 多功能會議室',
    attendance: { total: 5, present: 4, proxy: 1, guests: ['u-s01'] },
    status: 'published',
    uploadedAt: '2026-09-21',
    publishedAt: '2026-09-25T20:00',
    files: {
      minutes: { name: '會議紀錄原始檔.pdf', sizeMB: 2.4 },
      signIn: ['簽名簿.pdf', '委託書.pdf'],
    },
    resolutions: [
      {
        id: 'res-2026-03-1',
        title: '電梯保養廠商續約案',
        note: '維持原約單價，附履約保障',
        result: 'passed',
        votes: { yes: 5, no: 0 },
        ownerId: 'u-c01',
        execution: 'in_progress',
      },
      {
        id: 'res-2026-03-2',
        title: '地下室 B2–B3 防水工程',
        note: '現勘估價比稿中，需取得第三家報價',
        result: 'deferred',
        ownerId: 'u-c04',
      },
      {
        id: 'res-2026-03-3',
        title: '中庭植栽更新，預算上限 8 萬元',
        note: '更換枯損植栽並增設自動灑水',
        result: 'passed',
        votes: { yes: 4, no: 1 },
        ownerId: 'u-c03',
        execution: 'not_started',
      },
      {
        id: 'res-2026-03-4',
        title: '機車停車位不足調查',
        note: '總幹事報告各棟機車位使用狀況',
        result: 'report',
        ownerId: 'u-s01',
      },
    ],
    highlights: [
      '核准電梯保養廠商續約 1 年，並升級定期檢測項目',
      '地下室防水工程：需再取得第三家報價，下次會議續審',
      '中庭植栽更新：通過，預算上限 8 萬元',
    ],
    summary:
      '本次會議核准電梯保養廠商續約一年；地下室防水工程需再取得第三家報價，下次會議續議；通過中庭植栽更新。',
    fullText: [
      {
        heading: '壹、主席報告與宣讀法定人數',
        body: '全體委員應到 5 席，實到 4 席，委託出席 1 席。出席人數已達法定過半規定，主席於晚間 19:35 宣布開會。',
      },
      {
        heading: '案由一：電梯年度保養合約續簽案',
        tag: '通過',
        body: '【說明】原合作廠商本年度服務表現良好，維持原保養約定續簽 1 年。全案經委員討論後無異議。\n【表決結果】5 席全數贊成，通過。',
      },
      {
        heading: '案由二：地下室防水工程招標',
        tag: '下次續審',
        body: '【說明】近期大雨造成 B2 車道旁局部滲漏，二家廠商現勘後的報價差距較大。修繕委員提議邀請第三家工班參與覆勘。\n【決議】暫緩表決，由修繕委員於兩週內補齊第三方勘驗報告，再送常會審議。',
      },
      {
        heading: '案由三：中庭植栽更新',
        tag: '通過',
        body: '【說明】中庭部分植栽枯損，擬更換並增設自動灑水，預算上限 8 萬元。\n【表決結果】同意 4 席、反對 1 席，通過。',
      },
      { heading: '參、散會', body: '全體議程結束，主席宣布於晚間 21:10 散會。' },
    ],
    maskedCount: 6,
    comments: [
      {
        id: 'cm-001',
        userId: 'u-c04',
        at: '2026-09-30T14:20',
        text: '想請問電梯保養廠商續約後，保養頻率會不會調整？',
        reply: {
          at: '2026-10-01T13:32',
          byId: 'u-c01',
          text: '續約後維持每月 1 次保養，下次例會會公告保養排程。',
        },
      },
      {
        id: 'cm-002',
        userId: 'u-r03',
        at: '2026-10-01T13:40',
        text: '想請問地下室防水工程大概什麼時候會動工？B2 車道下雨天都會積水。',
      },
    ],
  },
  {
    id: 'm-2026-t1',
    type: 'special',
    title: '2026 年第 1 次臨時會議',
    heldAt: '2026-08-15T20:00',
    place: '社區 B1 多功能會議室',
    attendance: { total: 5, present: 5, proxy: 0, guests: ['u-s01'] },
    status: 'pending',
    uploadedAt: '2026-08-17',
    files: { minutes: { name: '臨時會議紀錄_0815.pdf', sizeMB: 1.3 }, signIn: ['簽名簿.pdf'] },
    resolutions: [
      {
        id: 'res-2026-t1-1',
        title: '地下室防水工程追加預算',
        note: '颱風後滲漏範圍擴大，追加勘驗與臨時止漏費用',
        result: 'passed',
        votes: { yes: 5, no: 0 },
        ownerId: 'u-c04',
        execution: 'in_progress',
        taskId: 'TASK-095',
      },
    ],
    highlights: ['通過地下室防水工程追加預算，先行處理臨時止漏'],
    summary: '因颱風後地下室滲漏範圍擴大，本次臨時會議通過追加勘驗與臨時止漏預算。',
    fullText: [
      { heading: '壹、主席報告', body: '全體委員應到 5 席，實到 5 席，主席於晚間 20:05 宣布開會。' },
      {
        heading: '案由一：地下室防水工程追加預算',
        tag: '通過',
        body: '【說明】颱風後 B2 滲漏範圍擴大，需追加勘驗與臨時止漏費用。\n【表決結果】5 席全數贊成，通過。',
      },
    ],
    maskedCount: 2,
    comments: [],
  },
  {
    id: 'm-2026-02',
    type: 'regular',
    title: '2026 年第 2 次管委會',
    heldAt: '2026-07-15T19:30',
    place: '社區 B1 多功能會議室',
    attendance: { total: 5, present: 5, proxy: 0, guests: ['u-s01'] },
    status: 'published',
    uploadedAt: '2026-07-16',
    publishedAt: '2026-07-20T18:00',
    files: { minutes: { name: '第2次管委會紀錄.pdf', sizeMB: 1.8 }, signIn: ['簽名簿.pdf'] },
    resolutions: [
      {
        id: 'res-2026-02-1',
        title: '增設中庭監視器',
        note: '中庭東西兩側各增設 1 支',
        result: 'passed',
        votes: { yes: 5, no: 0 },
        ownerId: 'u-s01',
        execution: 'done',
      },
      {
        id: 'res-2026-02-2',
        title: '年度消防安檢維護預算與排程',
        note: '排定 10 月完成年度申報',
        result: 'passed',
        votes: { yes: 5, no: 0 },
        ownerId: 'u-c01',
        execution: 'not_started',
      },
    ],
    highlights: ['通過年度消防安檢維護預算與排程', '增設中庭監視器 2 支'],
    summary: '通過年度消防安檢維護預算與排程，並決議增設中庭監視器。',
    fullText: [
      { heading: '壹、主席報告', body: '全體委員應到 5 席，實到 5 席。' },
      { heading: '案由一：增設中庭監視器', tag: '通過', body: '【表決結果】5 席全數贊成，通過。' },
      { heading: '案由二：年度消防安檢維護預算與排程', tag: '通過', body: '【表決結果】5 席全數贊成，通過。' },
    ],
    maskedCount: 3,
    comments: [],
  },
  {
    id: 'm-2026-g1',
    type: 'general',
    title: '2026 年區分所有權人會議',
    heldAt: '2026-04-10T14:00',
    place: '1F 中庭花園',
    attendance: { total: 120, present: 68, proxy: 14, guests: ['u-s01'] },
    status: 'published',
    uploadedAt: '2026-04-12',
    publishedAt: '2026-04-18T18:00',
    files: { minutes: { name: '區權會紀錄_2026.pdf', sizeMB: 3.6 }, signIn: ['簽名簿.pdf', '委託書彙整.pdf'] },
    resolutions: [
      {
        id: 'res-2026-g1-1',
        title: '改選第 12 屆管理委員',
        note: '選出委員 5 席，任期自 2026/07 起',
        result: 'passed',
        votes: { yes: 76, no: 6 },
        ownerId: 'u-c01',
        execution: 'done',
      },
      {
        id: 'res-2026-g1-2',
        title: '停車位抽籤規則修正',
        note: '修正後規則由管委會另行公告',
        result: 'passed',
        votes: { yes: 61, no: 21 },
        ownerId: 'u-c02',
        execution: 'not_started',
      },
      {
        id: 'res-2026-g1-3',
        title: '電梯汰換預算報告',
        note: '財務委員報告電梯汰換基金提撥情形',
        result: 'report',
        ownerId: 'u-c03',
      },
    ],
    highlights: ['改選第 12 屆管理委員', '通過停車位抽籤規則修正', '報告電梯汰換預算'],
    summary: '本次大會改選第 12 屆管理委員，並通過停車位抽籤規則修正。',
    fullText: [
      { heading: '壹、主席報告', body: '應出席 120 戶，實到 68 戶，委託 14 戶，已達法定出席人數。' },
      { heading: '案由一：改選第 12 屆管理委員', tag: '通過', body: '【表決結果】同意 76、反對 6，通過。' },
      { heading: '案由二：停車位抽籤規則修正', tag: '通過', body: '【表決結果】同意 61、反對 21，通過。' },
    ],
    maskedCount: 12,
    comments: [
      {
        id: 'cm-003',
        userId: 'u-c04',
        at: '2026-09-29T21:05',
        text: '停車位抽籤規則的修正，什麼時候會公告？',
      },
    ],
  },
  {
    id: 'm-2026-01',
    type: 'regular',
    title: '2026 年第 1 次管委會',
    heldAt: '2026-03-14T19:30',
    place: '社區 B1 多功能會議室',
    attendance: { total: 5, present: 5, proxy: 0, guests: [] },
    status: 'published',
    uploadedAt: '2026-03-15',
    publishedAt: '2026-03-20T18:00',
    files: { minutes: { name: '第1次管委會紀錄.pdf', sizeMB: 1.5 }, signIn: ['簽名簿.pdf'] },
    resolutions: [
      {
        id: 'res-2026-01-1',
        title: '區分所有權人會議議程確認',
        note: '排定 4/10 召開',
        result: 'passed',
        votes: { yes: 5, no: 0 },
        ownerId: 'u-c01',
        execution: 'done',
      },
    ],
    highlights: ['確認區分所有權人會議議程與日期'],
    summary: '確認 2026 年區分所有權人會議的議程與召開日期。',
    fullText: [{ heading: '案由一：區分所有權人會議議程確認', tag: '通過', body: '【表決結果】5 席全數贊成，通過。' }],
    maskedCount: 1,
    comments: [],
  },
  {
    id: 'm-2025-06',
    type: 'regular',
    title: '2025 年第 6 次管委會',
    heldAt: '2025-12-10T19:30',
    place: '社區 B1 多功能會議室',
    attendance: { total: 5, present: 4, proxy: 1, guests: ['u-s01'] },
    status: 'published',
    uploadedAt: '2025-12-11',
    publishedAt: '2025-12-15T18:00',
    files: { minutes: { name: '2025第6次管委會紀錄.pdf', sizeMB: 2.0 }, signIn: ['簽名簿.pdf'] },
    resolutions: [
      {
        id: 'res-2025-06-1',
        title: '調整公用管理費收費標準',
        note: '自 2026 年 1 月起每坪調整 5 元',
        result: 'passed',
        votes: { yes: 4, no: 1 },
        ownerId: 'u-c03',
        execution: 'done',
      },
      {
        id: 'res-2025-06-2',
        title: 'B2 車道防水抓漏工程驗收',
        note: '完工驗收合格，保固 2 年',
        result: 'passed',
        votes: { yes: 5, no: 0 },
        ownerId: 'u-c04',
        execution: 'done',
      },
      {
        id: 'res-2025-06-3',
        title: '年終社區大掃除日期',
        note: '訂於 12/27 上午',
        result: 'passed',
        votes: { yes: 5, no: 0 },
        ownerId: 'u-s01',
        execution: 'done',
      },
    ],
    highlights: ['調整公用管理費收費標準', 'B2 車道防水工程驗收合格'],
    summary: '通過調整公用管理費收費標準，並完成 B2 車道防水工程驗收。',
    fullText: [
      { heading: '案由一：調整公用管理費收費標準', tag: '通過', body: '【表決結果】同意 4、反對 1，通過。' },
      { heading: '案由二：B2 車道防水抓漏工程驗收', tag: '通過', body: '【表決結果】5 席全數贊成，通過。' },
    ],
    maskedCount: 4,
    comments: [
      {
        id: 'cm-004',
        userId: 'u-c04',
        at: '2025-12-11T09:30',
        text: '請問 B2 防水工程完工後，保固期是多久？',
        reply: { at: '2025-12-12T19:40', byId: 'u-c01', text: '保固 2 年，保固書已歸檔在社區檔案。' },
      },
    ],
  },
  {
    id: 'm-2025-05',
    type: 'regular',
    title: '2025 年第 5 次管委會',
    heldAt: '2025-10-18T19:30',
    place: '社區 B1 多功能會議室',
    attendance: { total: 5, present: 5, proxy: 0, guests: ['u-s01'] },
    status: 'published',
    uploadedAt: '2025-10-19',
    publishedAt: '2025-10-24T18:00',
    files: { minutes: { name: '2025第5次管委會紀錄.pdf', sizeMB: 1.7 }, signIn: ['簽名簿.pdf'] },
    resolutions: [
      {
        id: 'res-2025-05-1',
        title: '保全駐衛服務新合約審議',
        note: '與全安保全簽訂 2026 年度合約',
        result: 'passed',
        votes: { yes: 5, no: 0 },
        ownerId: 'u-c01',
        execution: 'done',
      },
    ],
    highlights: ['通過保全駐衛服務新合約'],
    summary: '審議並通過 2026 年度保全駐衛服務合約。',
    fullText: [{ heading: '案由一：保全駐衛服務新合約審議', tag: '通過', body: '【表決結果】5 席全數贊成，通過。' }],
    maskedCount: 2,
    comments: [],
  },
]
