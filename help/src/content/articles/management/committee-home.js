export default {
  id: 'committee-home',
  title: '認識管委會首頁',
  description: '每天打開先看這裡：要處理的事、交辦的工作、住戶的意見和公告。',
  category: 'daily',
  applicableRoles: ['committee'],
  order: 1,
  keywords: ['首頁', '管委會', '入門', '捷徑'],
  published: true,
  sections: [
    {
      heading: '首頁有什麼',
      blocks: [
        { type: 'image', screenshot: { file: 'committee-home.jpg', alt: '管委會首頁，由上到下是問候語、我的待辦、捷徑、住戶意見、公告與動態' } },
        {
          type: 'list',
          items: [
            '「我的待辦」：最新要處理的事。按「查看 N 件待辦」看全部。',
            '「交辦進度」：你交給管理人員的工作做到哪裡。',
            '「住戶意見」：住戶在會議紀錄裡的留言。',
            '「公告與動態」：社區的公告，點一下就能看內容。',
          ],
        },
      ],
    },
    {
      heading: '右下角的「＋」',
      blocks: [
        { type: 'p', text: '按右下角的「＋」，可以快速新增通報；主委、副主委還可以新增交辦、發布公告。' },
        { type: 'image', screenshot: { file: 'committee-fab-menu.jpg', alt: '按「＋」後跳出的新增選單' } },
      ],
    },
  ],
  relatedArticles: ['todos', 'case-flow', 'tasks', 'switch-role'],
}
