export default {
  id: 'case-update',
  title: '如何更新處理進度',
  description: '記下處理的狀況，也讓住戶知道進度。',
  category: 'case',
  applicableRoles: ['committee', 'staff'],
  audienceNote: '主委、副主委和管理人員可以更新。',
  order: 4,
  keywords: ['更新進度', '處理紀錄', '處理內容', '給住戶看的說明', '問題分類'],
  published: true,
  before: ['案件要先受理，才能更新進度。'],
  steps: [
    {
      title: '選「問題分類」',
      body: '例如漏水、設備故障、照明，方便之後查找。',
    },
    {
      title: '寫一句「給住戶看的說明」',
      body: '用一句話告訴住戶目前的狀況，例如「廠商將於 10/5 到場處理。」',
      screenshot: { file: 'case-log-form.jpg', alt: '案件詳情裡的「給住戶看的說明」和「處理內容」欄位' },
    },
    {
      title: '寫「處理內容」',
      body: '寫給管委會和管理人員看的細節，例如零件要等調貨。住戶看不到這裡。',
    },
    {
      title: '按「更新進度」',
      body: '全部改好後，按一次畫面下方的「更新進度」。',
    },
  ],
  result: '畫面會顯示「已更新進度」，處理紀錄多一筆。有寫給住戶的說明，住戶也會看到。',
  resultScreenshot: { file: 'done-case-updated.jpg', alt: '按「更新進度」後，上方出現「已更新進度」，處理紀錄最上面多了一筆' },
  notes: ['沒寫「給住戶看的說明」的話，住戶看不到這次的更新。'],
  relatedArticles: ['case-equipment', 'case-vendor', 'case-complete'],
}
