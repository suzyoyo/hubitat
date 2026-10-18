export default {
  id: 'staff-home',
  title: '認識管理人員首頁',
  description: '打開先看「我的待辦」：新的通報、交給你的工作都在這裡。',
  category: 'daily',
  applicableRoles: ['staff'],
  order: 2,
  keywords: ['首頁', '管理人員', '管理員', '總幹事', '入門'],
  published: true,
  sections: [
    {
      heading: '首頁有什麼',
      blocks: [
        { type: 'image', screenshot: { file: 'staff-home.jpg', alt: '管理人員首頁，有問候語、我的待辦、公告與動態' } },
        {
          type: 'list',
          items: [
            '「我的待辦」：最新要處理的事，例如住戶剛通報的問題、交給你的工作。按「查看 N 件待辦」看全部。',
            '「公告與動態」：社區最新的公告。',
          ],
        },
      ],
    },
    {
      heading: '底部的分頁',
      blocks: [
        {
          type: 'list',
          items: [
            '「案件」：住戶通報的所有問題。',
            '「廠商」：廠商的緊急聯絡電話、鑰匙放在哪裡。',
            '「社區」：社區的設備清冊。',
          ],
        },
      ],
    },
  ],
  relatedArticles: ['todos', 'case-accept', 'task-report', 'emergency-contacts'],
}
