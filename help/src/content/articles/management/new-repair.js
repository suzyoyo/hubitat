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
    },
    {
      title: '選地點、確認有沒有人通報過、選類型',
      body: '如果不是別人通報過的問題，按「都不是，我要登記新問題」。',
    },
    {
      title: '寫下問題，需要的話選「通報住戶」',
      body: '幫住戶登記的話，在「通報住戶」選棟別、樓層、戶號，那一戶就能在 App 裡看處理進度。自己發現的問題就不用選。',
      screenshot: { file: 'committee-new-repair.jpg', alt: '代住戶登記的描述頁，有「通報住戶」欄位' },
    },
    {
      title: '確認後按「送出通報」',
      body: '送出後會變成一件新的案件。',
    },
  ],
  relatedArticles: ['new-report', 'case-accept'],
}
