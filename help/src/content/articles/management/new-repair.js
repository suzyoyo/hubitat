export default {
  id: 'new-repair',
  title: '如何代住戶新增通報',
  description: '自己發現問題，或接到住戶電話時，幫住戶登記通報。',
  category: 'case',
  applicableRoles: ['committee'],
  order: 10,
  keywords: ['新增通報', '代登記', '代住戶', '電話', '登記'],
  published: true,
  steps: [
    {
      title: '按右下角的「＋」，選「新增通報」',
      body: '步驟和住戶通報一樣。',
      screenshot: { file: 'committee-fab-menu.jpg', alt: '按右下角「＋」後跳出的新增選單，有「新增通報」' },
    },
    {
      title: '需要的話選「通報住戶」，再選地點',
      body: '幫住戶登記的話，先在最上面的「通報住戶」選棟別、樓層、戶號，那一戶就能在 App 裡看處理進度。自己發現的問題就不用選。接著選問題發生的地點。',
      screenshot: { file: 'committee-new-repair.jpg', alt: '新增通報第 1 步，最上面有「通報住戶」欄位，下面是地點' },
    },
    {
      title: '確認有沒有人通報過、選類型、寫下問題',
      body: '如果不是別人通報過的問題，按「都不是，我要登記新問題」，再照畫面選類型、寫下問題。',
    },
    {
      title: '確認後按「送出通報」',
      body: '送出後會變成一件新的案件。',
    },
  ],
  relatedArticles: ['new-report', 'case-accept'],
}
