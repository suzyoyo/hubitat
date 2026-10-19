export default {
  id: 'emergency-contacts',
  title: '查看緊急聯絡資訊',
  description: '半夜水管爆裂、電梯故障時，馬上找到廠商電話和鑰匙放在哪裡。',
  category: 'vendor',
  applicableRoles: ['committee', 'staff'],
  order: 1,
  keywords: ['緊急', '聯絡', '電話', '撥號', '廠商', '鑰匙', '鑰匙清單', '內部聯絡'],
  published: true,
  steps: [
    {
      title: '按底部的「廠商」',
      body: '會看到廠商的緊急聯絡電話、社區內部的聯絡電話，以及鑰匙清單。',
      screenshot: { file: 'committee-vendors.jpg', alt: '廠商分頁，有廠商緊急聯絡和社區內部聯絡的電話' },
    },
    {
      title: '找到要聯絡的人',
      body: '可以在上方的搜尋框打廠商名稱或聯絡人。',
    },
    {
      title: '點電話號碼',
      body: '在手機上點一下就會直接撥出。',
    },
  ],
  relatedArticles: ['vendor-directory', 'case-vendor'],
}
