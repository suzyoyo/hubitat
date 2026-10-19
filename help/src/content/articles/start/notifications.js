export default {
  id: 'notifications',
  title: '查看通知',
  description: '通報處理好了、有新公告、管委會回覆你的留言，都會通知你。',
  category: 'start',
  applicableRoles: ['resident', 'committee', 'staff'],
  order: 2,
  keywords: ['通知', '鈴鐺', '紅點', '已讀', '全部已讀', '提醒'],
  published: true,
  steps: [
    {
      title: '按右上角的鈴鐺',
      body: '有新通知時，鈴鐺上會有紅點。',
    },
    {
      title: '看通知',
      body: '還沒看過的通知旁邊有紅點。',
      screenshot: { file: 'resident-notifications.jpg', alt: '住戶的通知頁，依今天、昨天、更早分組，右上方有「全部已讀」' },
    },
    {
      title: '點一則通知',
      body: '會直接打開相關的頁面，例如通報的處理進度。',
    },
  ],
  sections: [
    {
      heading: '想一次清掉紅點',
      blocks: [{ type: 'p', text: '在通知頁按「全部已讀」。' }],
    },
  ],
  relatedArticles: ['app-screen', 'report-progress', 'my-comments'],
}
