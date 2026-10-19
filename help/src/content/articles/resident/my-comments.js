export default {
  id: 'my-comments',
  title: '查看我的留言',
  description: '你問過管委會的問題，以及管委會的回覆。',
  category: 'notice',
  applicableRoles: ['resident'],
  order: 4,
  keywords: ['留言', '回覆', '我的留言', '待回覆'],
  published: true,
  steps: [
    {
      title: '打開「我的留言」',
      body: '到「我的」頁，按「我的留言」。',
    },
    {
      title: '切換「全部」和「待回覆」',
      body: '「待回覆」只列出管委會還沒回覆的留言。',
      screenshot: { file: 'resident-my-comments.jpg', alt: '「我的留言」頁，有全部、待回覆兩個分頁' },
    },
  ],
  sections: [
    {
      heading: '留言的狀態',
      blocks: [
        {
          type: 'badges',
          items: [
            { tone: 'blue', label: '待回覆', meaning: '管委會還沒回覆，回覆時會通知你。' },
            { tone: 'gray', label: '已回覆', meaning: '管委會已經回覆了。' },
          ],
        },
      ],
    },
  ],
  relatedArticles: ['meeting-comment', 'notifications'],
}
