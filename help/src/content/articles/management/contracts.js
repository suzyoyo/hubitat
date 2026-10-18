export default {
  id: 'contracts',
  title: '查看廠商合約',
  description: '查合約期間、金額和合約內容，快到期的合約一眼就看得到。',
  category: 'vendor',
  applicableRoles: ['committee'],
  audienceNote: '只有管委會看得到合約。',
  order: 3,
  keywords: ['合約', '續約', '到期', '金額', '合約文件'],
  published: true,
  steps: [
    {
      title: '打開「廠商合約」',
      body: '按底部的「社區」，再按「廠商合約」。',
    },
    {
      title: '找合約',
      body: '可以搜尋廠商名稱，或只看「即將到期」的合約。',
      screenshot: { file: 'committee-contracts.jpg', alt: '廠商合約列表，有搜尋、狀態篩選和排序' },
    },
    {
      title: '點合約看內容',
      body: '可以看到合約期間、金額、合約文件，以及以前的合約。',
    },
    {
      title: '翻閱合約文件',
      body: '點合約文件的頁面就能放大，左右滑動可以換頁。',
    },
  ],
  relatedArticles: ['vendor-directory', 'equipment'],
}
