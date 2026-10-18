export default {
  id: 'my-reports',
  title: '查看我的通報',
  description: '你通報過的、按過「我也遇到了」的問題，都在這裡。',
  category: 'report',
  applicableRoles: ['resident'],
  order: 6,
  keywords: ['我的通報', '列表', '進行中', '已完成', '紀錄'],
  published: true,
  steps: [
    {
      title: '打開「我的通報」',
      body: '在首頁「我的通報」右邊，按「看全部」。',
    },
    {
      title: '切換「進行中」和「已完成」',
      body: '「進行中」是還在處理的通報，「已完成」是已經處理好的通報。',
      screenshot: { file: 'resident-reports.jpg', alt: '「我的通報」頁，上方有進行中、已完成兩個分頁，下面是通報卡片' },
    },
    {
      title: '點卡片看詳細內容',
      body: '點任何一張卡片，就能看這件通報處理到哪裡。',
    },
  ],
  sections: [
    {
      heading: '卡片上的狀態',
      blocks: [
        {
          type: 'badges',
          items: [
            { tone: 'blue', label: '已收到', meaning: '管理室已經收到你的通報。' },
            { tone: 'blue', label: '處理中', meaning: '已經有人在處理。' },
            { tone: 'gray', label: '已完成', meaning: '已經處理好了。' },
          ],
        },
      ],
    },
  ],
  relatedArticles: ['report-progress', 'report-edit', 'new-report'],
}
