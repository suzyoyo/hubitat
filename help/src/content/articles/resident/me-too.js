export default {
  id: 'me-too',
  title: '如何使用「我也遇到了」',
  description: '別人已經通報過同一個問題時，按一下就好，不用重複通報。',
  category: 'report',
  applicableRoles: ['resident'],
  order: 5,
  keywords: ['我也遇到了', '重複', '附議', '同一個問題', '已經有人通報'],
  published: true,
  steps: [
    {
      title: '新增通報時，看看有沒有人通報過',
      body: '選好地點後，如果最近有人通報過同一個地方，畫面會列出來。',
    },
    {
      title: '是同一個問題，就按「我也遇到了」',
      body: '看卡片上寫的問題，確認是同一件事，就按卡片下面的「我也遇到了」。',
      screenshot: { file: 'report-step2.jpg', alt: '相似通報的卡片，下方有「我也遇到了」按鈕' },
    },
  ],
  result: '畫面會顯示「已一起加入『我的通報』！」。你可以在「我的通報」隨時查看處理進度，這個問題處理好的時候，你也會收到通知。',
  resultScreenshot: { file: 'report-supported.jpg', alt: '按「我也遇到了」後的完成頁，寫著「已一起加入『我的通報』！」' },
  notes: ['按「我也遇到了」的通報，你可以看處理進度，但不能修改內容。'],
  relatedArticles: ['new-report', 'my-reports'],
}
