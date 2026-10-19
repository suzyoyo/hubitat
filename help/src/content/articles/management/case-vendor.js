export default {
  id: 'case-vendor',
  title: '派廠商處理',
  description: '選好廠商，約好到場的日期和時間。',
  category: 'case',
  applicableRoles: ['committee', 'staff'],
  audienceNote: '主委、副主委和管理人員可以派廠商。',
  order: 6,
  keywords: ['廠商', '派廠商', '預約', '到場', '維修'],
  published: true,
  steps: [
    {
      title: '在「廠商」選廠商',
      body: '從廠商名冊裡選；名冊裡沒有的，直接打廠商的名字也可以。',
      screenshot: { file: 'case-vendor.jpg', alt: '案件詳情的「廠商」欄位，可以從名冊選或輸入名稱' },
    },
    {
      title: '選到場的日期和時間',
      body: '填上和廠商約好的時間。',
    },
    {
      title: '寫一句話告訴住戶（建議）',
      body: '例如「已安排廠商，預計 10/3 到場。」，住戶就知道什麼時候會修。',
    },
    {
      title: '按「更新進度」',
      body: '按畫面下方的「更新進度」存起來。',
    },
  ],
  notes: ['廠商要改天再來，修改到場時間後，再按一次「更新進度」就好。'],
  relatedArticles: ['emergency-contacts', 'case-update', 'case-complete'],
}
