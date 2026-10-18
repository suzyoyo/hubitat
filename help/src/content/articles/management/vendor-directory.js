export default {
  id: 'vendor-directory',
  title: '查看廠商資訊',
  description: '用遇到的問題找廠商，看廠商的施工表現和服務紀錄。',
  category: 'vendor',
  applicableRoles: ['committee'],
  order: 2,
  keywords: ['廠商', '廠商名冊', '施工表現', '續約', '評估', '服務紀錄'],
  published: true,
  steps: [
    {
      title: '打開「廠商名冊」',
      body: '按底部的「廠商」，再按「廠商名冊」。',
    },
    {
      title: '用問題或名稱找廠商',
      body: '在搜尋框打遇到的問題，例如「漏水」，或直接打廠商名稱。',
      screenshot: { file: 'committee-vendor-list.jpg', alt: '廠商名冊，上方有搜尋框和排序' },
    },
    {
      title: '點廠商看詳細資料',
      body: '可以看到聯絡窗口、合約、負責的設備，以及過去的服務紀錄。',
      screenshot: { file: 'committee-vendor-detail.jpg', alt: '廠商詳細頁，有施工表現和聯絡窗口' },
    },
  ],
  sections: [
    {
      heading: '考慮要不要續約時',
      blocks: [{ type: 'p', text: '「施工表現」會列出平均幾天修好、處理過幾件、保養有沒有按時完成，可以和服務紀錄一起參考。' }],
    },
  ],
  relatedArticles: ['contracts', 'emergency-contacts', 'equipment'],
}
