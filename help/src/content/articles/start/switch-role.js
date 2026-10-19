export default {
  id: 'switch-role',
  title: '在住戶與管委會之間切換',
  description: '委員通常也是住戶，可以在兩個身分之間切換。',
  category: 'start',
  applicableRoles: ['resident', 'committee'],
  audienceNote: '同時是住戶和委員的人才會看到切換按鈕。',
  order: 3,
  keywords: ['切換', '身分', '委員', '住戶', '管委會'],
  published: true,
  steps: [
    {
      title: '到「我的」頁',
      body: '按導覽列「我的」分頁。',
      screenshot: { file: 'resident-home.jpg', alt: '住戶首頁，最下面的導覽列有「我的」' },
    },
    {
      title: '按切換按鈕',
      body: '現在是住戶的話，按「切換至管委會」；現在是管委會的話，按「切換至住戶」。',
      screenshot: { file: 'resident-me-committee.jpg', alt: '住戶端「我的」頁，身分區塊有「切換至管委會」' },
    },
  ],
  result: '會直接換到另一個身分的首頁。',
  resultScreenshot: { file: 'committee-home.jpg', alt: '切換後直接到管委會的首頁' },
  relatedArticles: ['join-committee', 'committee-home'],
}
