export default {
  id: 'join-committee',
  title: '使用邀請碼加入管委會',
  description: '當選委員後，輸入主委給你的邀請碼，就能加入管委會。',
  category: 'account',
  applicableRoles: ['resident'],
  order: 1,
  keywords: ['邀請碼', '加入', '管委會', '委員', '當選'],
  published: true,
  before: ['邀請碼是 6 位數字，請向主委索取。'],
  steps: [
    {
      title: '到「我的」→「加入管委會」',
      body: '按底部的「我的」，再按「加入管委會」。',
      screenshot: { file: 'resident-me.jpg', alt: '一般住戶的「我的」頁，身分區塊有「加入管委會」' },
    },
    {
      title: '輸入邀請碼',
      body: '輸入 6 位數字，輸入完會自動確認。',
      screenshot: { file: 'join-code.jpg', alt: '輸入邀請碼的畫面' },
    },
    {
      title: '確認後按「接受邀請」',
      body: '畫面會顯示是誰邀請你、任期多久、可以做哪些事。確認沒問題，按「接受邀請」。',
      screenshot: { file: 'join-confirm.jpg', alt: '確認邀請的畫面，下方有「接受邀請」和「婉拒」' },
    },
  ],
  result: '畫面會顯示「已接受邀請！」。任期開始那天，你就能使用管委會的功能；在那之前，「我的」頁會顯示「待生效」。',
  notes: ['邀請碼不能用的話，輸入框下面會說明原因，請再跟主委確認一次。'],
  relatedArticles: ['switch-role'],
}
