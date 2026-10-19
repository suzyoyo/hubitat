export default {
  id: 'urgent-log',
  title: '查看緊急標示使用紀錄',
  description: '看公告被標示為緊急的次數，以及是誰標示的。',
  category: 'announce',
  applicableRoles: ['committee'],
  audienceNote: '只有主委、副主委看得到。',
  order: 3,
  keywords: ['緊急', '緊急標示', '紀錄', '公告'],
  published: true,
  steps: [
    {
      title: '到「我的」→「緊急標示使用紀錄」',
      body: '按底部的「我的」，再按「緊急標示使用紀錄」。',
    },
    {
      title: '查看次數和每一筆紀錄',
      body: '上面是今年、這個月的次數，下面是每一則公告和標示的人。',
      screenshot: { file: 'committee-urgent-log.jpg', alt: '緊急標示使用紀錄頁' },
    },
  ],
  relatedArticles: ['announcement-publish'],
}
