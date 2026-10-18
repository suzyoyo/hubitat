export default {
  id: 'meeting-comment',
  title: '留言給管委會',
  description: '看會議紀錄有疑問時，可以直接留言問管委會。',
  category: 'notice',
  applicableRoles: ['resident'],
  order: 3,
  keywords: ['留言', '提問', '意見', '管委會', '會議', '問題'],
  published: true,
  steps: [
    {
      title: '在會議紀錄頁按「留言」',
      body: '打開會議紀錄，按右下角的「留言」。',
      screenshot: { file: 'resident-meeting-comment.jpg', alt: '從畫面下方滑出的留言框' },
    },
    {
      title: '寫下你的問題',
      body: '例如「續約後保養頻率會不會調整？」',
    },
    {
      title: '按「確認送出」',
      body: '留言就會送給管委會。',
    },
  ],
  result: '管委會回覆後，你會收到通知。也可以到「我的留言」看回覆。',
  notes: ['你的留言只有你自己和管委會看得到。'],
  relatedArticles: ['my-comments', 'meetings'],
}
