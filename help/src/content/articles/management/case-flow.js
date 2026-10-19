export default {
  id: 'case-flow',
  title: '案件從通報到結案',
  description: '一件案件從頭到尾怎麼處理：受理、處理、完工驗收、結案。',
  category: 'case',
  applicableRoles: ['committee', 'staff'],
  order: 2,
  keywords: ['流程', '案件', '受理', '交辦', '完工驗收', '結案', '退回', '報修'],
  published: true,
  popular: true,
  complex: true, // 比較複雜的流程：注意事項旁邊放好彼管家
  before: [
    '主委、副主委和管理人員可以受理、處理案件。',
    '交辦、退回和結案，只有主委、副主委可以做。',
  ],
  steps: [
    {
      title: '受理住戶的通報',
      body: '住戶通報後，你會收到通知，待辦也會出現紅色的「尚未受理」。打開案件，按「受理」，表示由你接手。',
      screenshot: { file: 'case-pending.jpg', alt: '待受理的案件詳情，底部有「受理」按鈕' },
    },
    {
      title: '（主委、副主委）交給管理人員處理',
      body: '要請管理人員處理的話，按「交辦」，選好管理人員和完成期限，按「確認新增」。自己處理就跳過這一步。',
      screenshot: { file: 'case-assign.jpg', alt: '新增交辦頁，關聯案件已鎖定' },
    },
    {
      title: '安排廠商、記下處理狀況',
      body: '在案件裡選廠商、約好到場時間，寫下處理的情況，也可以寫一句話讓住戶知道進度。寫好按「更新進度」。',
      screenshot: { file: 'case-processing.jpg', alt: '處理中的案件詳情，底部有「撤回交辦」和「更新進度」' },
    },
    {
      title: '修好後按「完工驗收」',
      body: '廠商修好、你在現場確認後，按「完工驗收」，可以附上照片，再按「回報」。',
      tips: ['管理人員回報後，會交給主委或副主委確認結案。', '主委、副主委自己回報的話，案件會直接結案。'],
      screenshot: { file: 'case-complete.jpg', alt: '回報完成頁，有附件和備註說明' },
    },
    {
      title: '（主委、副主委）確認結案',
      body: '待辦出現「待我結案」時，打開案件。確認修好了，按「確認結案」；還要再處理的話，按「退回」並寫下原因。',
      screenshot: { file: 'case-to-verify.jpg', alt: '待結案的案件詳情，底部有「退回」和「確認結案」' },
    },
  ],
  result: '案件結案後，通報的住戶會收到通知；這次維修也會記進設備的維修紀錄。',
  resultScreenshot: { file: 'done-case-closed.jpg', alt: '結案後，上方出現「已結案」和「已記進設備的維修紀錄」，狀態是「已結案」' },
  notes: [
    '廠商要改天再來的話，修改到場時間就好。',
    '結案後如果又壞了，請新增一件新的案件。',
  ],
  relatedArticles: ['case-accept', 'case-update', 'case-complete', 'case-close'],
}
