export default {
  id: 'case-accept',
  title: '如何受理案件',
  description: '接下住戶的通報，讓住戶知道已經有人在處理。',
  category: 'case',
  applicableRoles: ['committee', 'staff'],
  audienceNote: '主委、副主委和管理人員可以受理。',
  order: 3,
  keywords: ['受理', '接案', '新通報', '尚未受理', '待受理'],
  published: true,
  steps: [
    {
      title: '找到還沒受理的案件',
      body: '收到新通報的通知時點進去；或在待辦裡找紅色的「尚未受理」。',
    },
    {
      title: '看看住戶說了什麼',
      body: '先看住戶的描述和照片，了解發生什麼事。',
    },
    {
      title: '按「受理」',
      body: '按畫面下方的「受理」。',
      screenshot: { file: 'case-pending.jpg', alt: '待受理的案件詳情，底部有「受理」按鈕' },
    },
  ],
  result: '案件變成「處理中」，負責人是你。通報的住戶也會收到通知。',
  resultScreenshot: { file: 'done-case-accepted.jpg', alt: '受理後，上方出現「已受理」，案件狀態是「處理中」、負責人是李主委' },
  notes: ['如果別人剛好先受理了，畫面會提醒你，重新整理就能看到是誰在處理。'],
  relatedArticles: ['case-update', 'case-assign', 'case-flow'],
}
