// 管委會會議紀錄假資料（首頁「會議摘要」用）
// 欄位說明：
//   id             唯一編號
//   type           會議類型，見下方 MEETING_TYPES
//   title          會議名稱
//   heldAt         召開日期
//   keyResolutions 重點決議（一句話摘要，顯示在首頁卡片）

export const MEETING_TYPES = {
  regular: { label: '常態例會' },
  special: { label: '臨時會議' },
}

export const meetings = [
  {
    id: 'm-001',
    type: 'regular',
    title: '2026年第三次管委會常會',
    heldAt: '2026-09-20',
    keyResolutions: '核准電梯保養續約、社區監視器升級案',
  },
  {
    id: 'm-002',
    type: 'regular',
    title: '2026年第二次管委會常會',
    heldAt: '2026-06-21',
    keyResolutions: '通過年度消防安全檢查預算、頂樓防水工程招標',
  },
]
