export default {
  id: 'report-edit',
  title: '如何修改或補充通報',
  description: '還沒處理完之前，可以補充說明、換照片。',
  category: 'report',
  applicableRoles: ['resident'],
  order: 8,
  keywords: ['修改', '補充', '編輯', '照片', '撤回', '取消'],
  published: true,
  before: ['只有你自己通報、還沒處理完的通報可以修改。', '可以改補充說明和照片；地點和通報問題不能改。'],
  steps: [
    {
      title: '打開要修改的通報',
      body: '在「我的通報」按卡片上的「編輯通報 / 補充」。',
    },
    {
      title: '補充說明或換照片',
      body: '在「處理進度」下面，修改「補充說明」，或加上、刪除照片。不要的照片按下面的「刪除」。',
      screenshot: { file: 'resident-report-edit.jpg', alt: '通報詳情下方的補充說明、現場照片欄位和「確認修改」按鈕' },
    },
    {
      title: '按「確認修改」',
      body: '改好後，按畫面下方的「確認修改」。',
    },
  ],
  result: '畫面會顯示「已更新通報」，管理室也會看到你補充的內容。',
  notes: ['通報送出後不能撤回。如果問題已經好了，可以在補充說明裡寫一聲，管理室會說明原因後結案。'],
  relatedArticles: ['report-progress', 'my-reports'],
}
