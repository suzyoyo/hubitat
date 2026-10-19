export default {
  id: 'meetings',
  title: '閱讀與搜尋會議紀錄',
  description: '看管委會開會決定了什麼，可以只看重點，也可以搜尋關鍵字。',
  category: 'notice',
  applicableRoles: ['resident'],
  order: 2,
  keywords: ['會議', '會議紀錄', '決議', '管委會', '搜尋', '全文', '摘要'],
  published: true,
  steps: [
    {
      title: '打開會議紀錄',
      body: '在首頁的會議卡片上，按「閱讀會議紀錄完整版」。',
    },
    {
      title: '先看「重點摘要」',
      body: '最上面是這次會議最重要的決定，下面是每一個議題的結果，例如「通過」「下次續審」。',
      screenshot: { file: 'resident-meeting-summary.jpg', alt: '會議紀錄的重點摘要分頁' },
    },
    {
      title: '想看完整內容，切到「全文記錄」',
      body: '點上方的標題，就會跳到那一段。',
    },
    {
      title: '用關鍵字搜尋',
      body: '在「全文記錄」的搜尋框輸入想找的字，例如「電梯」。找到的地方會用橘色標出來，按旁邊的上、下箭頭可以一處一處看。',
      screenshot: { file: 'resident-meeting-search.jpg', alt: '全文記錄裡搜尋「電梯」，找到的字用橘色標示' },
    },
  ],
  notes: ['看完有問題，可以直接留言問管委會。'],
  relatedArticles: ['meeting-comment', 'my-comments'],
}
