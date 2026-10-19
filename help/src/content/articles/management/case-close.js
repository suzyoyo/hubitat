export default {
  id: 'case-close',
  title: '如何確認結案',
  description: '確認問題已經修好，結束這件案件。',
  category: 'case',
  applicableRoles: ['committee'],
  audienceNote: '只有主委、副主委可以結案。',
  order: 9,
  keywords: ['結案', '確認結案', '維修費用', '待結案', '審核'],
  published: true,
  popular: true,
  steps: [
    {
      title: '打開待結案的案件',
      body: '待辦出現「待我結案」時點進去，先看管理人員附的照片和說明。',
    },
    {
      title: '按「確認結案」',
      body: '確認修好了，按畫面下方的「確認結案」。',
      screenshot: { file: 'case-close.jpg', alt: '結案頁，有維修費用和結案說明' },
    },
    {
      title: '填維修費用和結案說明（可以不填）',
      body: '維修費用會記進設備的維修紀錄，只有管委會看得到；結案說明住戶也看不到。',
    },
    {
      title: '按「結案」',
      body: '案件就完成了。',
    },
  ],
  result: '通報的住戶會收到通知，知道問題已經處理好了。',
  resultScreenshot: { file: 'done-case-closed.jpg', alt: '結案後，上方出現「已結案」，案件狀態是「已結案」' },
  notes: ['結案後如果又壞了，請新增一件新的案件。'],
  relatedArticles: ['case-return', 'equipment', 'case-flow'],
}
