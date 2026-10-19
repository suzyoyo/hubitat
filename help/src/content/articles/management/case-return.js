export default {
  id: 'case-return',
  title: '如何退回案件',
  description: '覺得還沒處理好時，退回給管理人員再處理一次。',
  category: 'case',
  applicableRoles: ['committee'],
  audienceNote: '只有主委、副主委可以退回。',
  order: 8,
  keywords: ['退回', '重做', '再處理', '待結案', '審核'],
  published: true,
  steps: [
    {
      title: '打開待結案的案件',
      body: '在待辦裡找「待我結案」的案件。',
    },
    {
      title: '按「退回」',
      body: '按畫面下方的「退回」。',
      screenshot: { file: 'case-to-verify.jpg', alt: '待結案的案件詳情，底部有「退回」和「確認結案」' },
    },
    {
      title: '寫下原因，按「確認退回」',
      body: '告訴管理人員還有哪裡要處理。',
    },
  ],
  result: '案件回到「處理中」，管理人員會收到通知。他處理好後，會再回報一次。',
  resultScreenshot: { file: 'done-case-returned.jpg', alt: '退回後，上方出現「已退回」，案件狀態回到「處理中」' },
  relatedArticles: ['case-close', 'case-complete'],
}
