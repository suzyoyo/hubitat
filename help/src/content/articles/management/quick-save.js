export default {
  id: 'quick-save',
  title: '如何快速留存單據照片',
  description: '收據、單據先拍下來，之後再歸到案件。',
  category: 'case',
  applicableRoles: ['committee', 'staff'],
  order: 11,
  keywords: ['快速留存', '留存', '收據', '單據', '報價單', '照片', '拍照', '待補資料', '歸到案件'],
  published: true,
  before: ['適合在現場拿到收據、單據，還沒空整理的時候，先拍下來存著。'],
  steps: [
    {
      title: '按「＋」，選「快速留存」',
      body: '按右下角的「＋」，選「快速留存」。',
      screenshot: { file: 'committee-fab-menu.jpg', alt: '按右下角「＋」後跳出的新增選單，有「快速留存」' },
    },
    {
      title: '拍照，寫名稱或備註',
      body: '在「收據或單據照片」按「新增」拍照或選照片，再寫個名稱，例如「電梯保養單 10/01」。照片、名稱、備註都可以不填，但至少要有一樣。',
      screenshot: { file: 'quick-save-form.jpg', alt: '快速留存頁，有關聯案件、收據或單據照片、名稱、備註，底部是「留存」' },
    },
    {
      title: '知道是哪件案件，就選「關聯案件」',
      body: '最上面的「關聯案件」只會列出處理中的案件。選了，留存後會直接附在那件案件的處理紀錄；還不確定就不用選，之後再歸。',
    },
    {
      title: '按「留存」',
      body: '按畫面下方的「留存」。',
    },
  ],
  result: '沒選案件的，會出現在你的「我的待辦」，卡片上寫「待補資料」；選了案件的，會直接附在那件案件的處理紀錄。',
  resultScreenshot: { file: 'done-quick-save.jpg', alt: '留存後回到首頁，上方出現「已留存」，我的待辦多了一張「待補資料」的卡片' },
  sections: [
    {
      heading: '之後歸到案件',
      blocks: [
        { type: 'p', text: '在「我的待辦」點那張「待補資料」的卡片，在下面選一件處理中的案件，按「歸到這件案件」。照片和備註會附在那件案件的處理紀錄，接著就可以在案件裡完工驗收。' },
        { type: 'image', screenshot: { file: 'quick-save-detail.jpg', alt: '留存詳情頁，有照片和備註，底部可以選案件、按「歸到這件案件」' } },
      ],
    },
  ],
  relatedArticles: ['todos', 'case-update', 'case-complete'],
}
