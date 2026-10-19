export default {
  id: 'case-equipment',
  title: '選擇相關設備',
  description: '標出是哪一台設備出問題，修好後會記進那台設備的維修紀錄。',
  category: 'case',
  applicableRoles: ['committee', 'staff'],
  audienceNote: '主委、副主委和管理人員可以選擇。',
  order: 5,
  keywords: ['設備', '關聯設備', '電梯', '維修紀錄', '設備清冊'],
  published: true,
  steps: [
    {
      title: '在「關聯設備」選設備',
      body: '點「關聯設備」，從清單裡選，或直接打字找，例如「電梯」。',
      screenshot: { file: 'case-equipment.jpg', alt: '案件詳情的「關聯設備」欄位，展開了設備清單' },
    },
    {
      title: '按「更新進度」',
      body: '選好後，按畫面下方的「更新進度」存起來。',
    },
  ],
  result: '按「更新進度」存好後，這台設備就和案件連在一起了。結案後，這次維修會自動記進它的維修紀錄；到時候案件詳情的設備旁邊會出現「查看設備」，可以點過去看。',
  resultScreenshot: { file: 'done-case-equipment.jpg', alt: '按「更新進度」後，上方出現「已更新進度」，關聯設備欄位是選好的設備' },
  notes: ['找不到這台設備的話，可以先不選。'],
  relatedArticles: ['equipment', 'case-vendor', 'case-update'],
}
