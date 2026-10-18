export default {
  id: 'todos',
  title: '查看我的待辦',
  description: '所有輪到你處理的事，都集中在這裡。',
  category: 'daily',
  applicableRoles: ['committee', 'staff'],
  order: 3,
  keywords: ['待辦', '待處理', '提醒', '篩選', '排序', '逾期'],
  published: true,
  popular: true,
  steps: [
    {
      title: '打開「我的待辦」',
      body: '在首頁「我的待辦」，按「查看 N 件待辦」。',
    },
    {
      title: '先看「未完成」',
      body: '「未完成」是還要處理的事；想找處理過的，切到「已完成」。',
      screenshot: { file: 'committee-todos.jpg', alt: '我的待辦頁，有未完成、已完成分頁和類型篩選' },
    },
    {
      title: '需要的話，篩選或排序',
      body: '可以只看某一種待辦，例如只看案件；也可以照到期日排列，先處理快到期的。',
    },
    {
      title: '點卡片去處理',
      body: '點一張卡片，就會打開要處理的那一頁。',
    },
  ],
  sections: [
    {
      heading: '看懂待辦卡片',
      blocks: [
        { type: 'p', text: '卡片第二行會告訴你是誰、什麼時候、做到哪裡，例如「吳小姐（A 棟 2 樓）・2 小時前通報」。' },
        {
          type: 'badges',
          items: [
            { tone: 'red', label: '尚未受理', meaning: '最需要注意，請優先處理，例如還沒人受理、已經逾期。' },
            { tone: 'orange', label: '待我結案', meaning: '輪到你處理，或快到期了。' },
            { tone: 'blue', label: '處理中', meaning: '正在進行，或在等別人。' },
            { tone: 'gray', label: '已完成', meaning: '已經結束。' },
          ],
        },
      ],
    },
  ],
  relatedArticles: ['case-accept', 'case-close', 'task-report'],
}
