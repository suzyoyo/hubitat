export default {
  id: 'case-complete',
  title: '如何完工驗收、回報完成',
  description: '廠商修好、現場確認後，回報這件案件已經完成。',
  category: 'case',
  applicableRoles: ['committee', 'staff'],
  audienceNote: '主委、副主委和管理人員可以完工驗收。',
  order: 7,
  keywords: ['完工驗收', '回報完成', '驗收', '完工', '修好', '附件'],
  published: true,
  steps: [
    {
      title: '在案件裡按「完工驗收」',
      body: '打開案件，按畫面下方的「完工驗收」。',
    },
    {
      title: '附上照片、寫幾句說明（可以不填）',
      body: '可以放修好後的照片，簡單寫一下完成的情況。',
      tips: ['主委、副主委自己回報時，還可以填維修費用。'],
      screenshot: { file: 'case-complete.jpg', alt: '回報完成頁，有附件和備註說明' },
    },
    {
      title: '按「回報」，再按「確認回報」',
      body: '送出後就完成了。',
    },
  ],
  result: '管理人員回報後，案件會變成「待結案」，等主委或副主委確認。主委、副主委自己回報的話，案件會直接結案。',
  resultScreenshot: { file: 'case-to-verify.jpg', alt: '回報完成後的案件，狀態是「待結案」' },
  relatedArticles: ['case-close', 'case-return', 'case-flow'],
}
