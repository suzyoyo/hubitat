export default {
  id: 'report-progress',
  title: '查看通報處理進度',
  description: '通報處理到哪一步、管理室說了什麼，都在這裡看。',
  category: 'report',
  applicableRoles: ['resident'],
  order: 7,
  keywords: ['進度', '處理', '狀態', '多久', '有沒有人處理', '結案', '通知'],
  published: true,
  popular: true,
  steps: [
    {
      title: '打開這件通報',
      body: '在首頁或「我的通報」點那張通報卡片。收到通知時，點通知也會直接打開。',
    },
    {
      title: '看最上面的通報內容',
      body: '最上面是你通報的問題、目前的狀態和地點。',
      screenshot: { file: 'resident-report-detail.jpg', alt: '通報詳情頁，上方是通報摘要，下方是處理進度' },
    },
    {
      title: '看「處理進度」',
      body: '進度會從「已收到」走到「處理中」，最後是「已完成」。下面會列出管理室寫給你的說明，例如「已安排廠商，預計 10/3 到場。」',
      screenshot: { file: 'resident-report-progress.jpg', alt: '處理進度：已收到、處理中、已完成三個階段，下面是管理室寫的說明' },
    },
  ],
  sections: [
    {
      heading: '什麼時候會收到通知',
      blocks: [
        { type: 'p', text: '有人開始處理、以及處理完成時，你都會收到通知。按過「我也遇到了」的人，處理完成時也會收到通知。' },
      ],
    },
  ],
  relatedArticles: ['report-edit', 'my-reports', 'notifications'],
}
