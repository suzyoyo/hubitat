export default {
  id: 'announcement-manage',
  title: '修改、撤回與復原公告',
  description: '公告寫錯了可以修改；不該發的可以撤回，撤回後還能復原。',
  category: 'announce',
  applicableRoles: ['committee'],
  audienceNote: '只有主委、副主委可以操作，而且只能改自己發的公告。',
  order: 2,
  keywords: ['公告', '修改', '撤回', '復原', '更正', '刪除公告'],
  published: true,
  steps: [
    {
      title: '打開公告',
      body: '在首頁「公告與動態」點那則公告。',
      screenshot: { file: 'committee-announcement-detail.jpg', alt: '公告詳情頁，底部有「修改公告」和「撤回公告」' },
    },
    {
      title: '要修改：按「修改公告」',
      body: '改好後送出就可以了。',
    },
    {
      title: '要撤回：按「撤回公告」',
      body: '撤回後住戶就看不到這則公告，已經收到通知的住戶會收到更正通知。',
      screenshot: { file: 'committee-announcement-withdraw.jpg', alt: '「撤回這則公告？」確認視窗，可以填撤回原因' },
    },
    {
      title: '撤回後想恢復：按「復原」',
      body: '住戶就又看得到了。',
    },
  ],
  notes: ['已經結束的公告不能修改。'],
  relatedArticles: ['announcement-publish', 'urgent-log'],
}
