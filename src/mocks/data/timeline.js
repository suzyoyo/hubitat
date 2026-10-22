// 社區時間軸假資料：社區的大事記
// 欄位說明：
//   id          唯一編號
//   date        日期
//   type        類型，見下方 TIMELINE_TYPES
//   title       標題
//   description 說明

export const TIMELINE_TYPES = {
  resolution: { label: '決議' },
  construction: { label: '工程' },
  contract: { label: '合約' },
  other: { label: '其他' },
}

export const timeline = [
  {
    id: 'tl-001',
    date: '2026-10-17',
    type: 'resolution',
    title: '核准電梯保養廠商續約及防護更新',
    description: '管委會審查與大會投票表決通過',
  },
  {
    id: 'tl-002',
    date: '2026-10-05',
    type: 'construction',
    title: 'B2 車道防水抓漏及地坪止滑工程',
    description: '環氧樹脂重鋪與導溝改善完畢',
  },
  {
    id: 'tl-003',
    date: '2026-09-11',
    type: 'contract',
    title: '年度社區環保清潔暨綠化養護合約',
    description: '增設感應式照明維護與定期修剪',
  },
  {
    id: 'tl-004',
    date: '2026-07-09',
    type: 'construction',
    title: '公共區域節能 LED 燈具全面更換計畫',
    description: '動用公共修繕儲備金汰換地下室燈管',
  },
  {
    id: 'tl-005',
    date: '2025-12-01',
    type: 'construction',
    title: '社區高壓消防管線水壓測試與幫浦更換',
    description: '更換新型低噪靜音泵，檢測均達標',
  },
  {
    id: 'tl-006',
    date: '2025-08-24',
    type: 'contract',
    title: '安防監控主機系統升級暨保全門禁續約',
    description: '大門感應讀卡機升級與螢幕更新',
  },
  {
    id: 'tl-007',
    date: '2025-01-15',
    type: 'resolution',
    title: '大廳訪客登記與包裹代收作業修訂',
    description: '推動 App 自助取件與個資隱私維護',
  },
  {
    id: 'tl-008',
    date: '2024-07-05',
    type: 'construction',
    title: '頂樓水塔清洗與管線更新',
    description: '更換老舊揚水管並完成水質檢驗',
  },
]
