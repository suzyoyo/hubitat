export default {
  id: 'resident-home',
  title: '認識住戶首頁',
  description: '打開 App 第一眼看到的地方：你的通報、社區公告、最新的會議。',
  category: 'report',
  applicableRoles: ['resident'],
  order: 1,
  keywords: ['首頁', '住戶', '入門', '畫面'],
  published: true,
  sections: [
    {
      heading: '首頁有什麼',
      blocks: [
        {
          type: 'image',
          screenshot: { file: 'resident-home.jpg', alt: '住戶首頁，由上到下是問候語、我的通報、公告與動態、會議紀錄' },
        },
        {
          type: 'list',
          items: [
            '「我的通報」：你還在處理中的通報。想通報新問題，按「新增通報」。',
            '「公告與動態」：和你有關的公告，例如停水、施工。點一下就能看內容。',
            '會議紀錄：管委會最近一次開會的紀錄。',
          ],
        },
      ],
    },
    {
      heading: '發現問題時',
      blocks: [{ type: 'p', text: '畫面右下角紅色的「通報」按鈕隨時都在，發現社區有問題，按它就能通報。' }],
    },
  ],
  relatedArticles: ['new-report', 'my-reports', 'announcements', 'app-screen'],
}
