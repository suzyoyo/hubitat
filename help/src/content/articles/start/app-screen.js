export default {
  id: 'app-screen',
  title: '認識 App 的畫面',
  description: '上方的鈴鐺、下方的分頁、右下角的按鈕，各是做什麼的。',
  category: 'start',
  applicableRoles: ['resident', 'committee', 'staff'],
  order: 1,
  keywords: ['畫面', '分頁', '導覽', '鈴鐺', '返回', '按鈕', '新手', '入門'],
  published: true,
  popular: true,
  sections: [
    {
      heading: '主要的畫面',
      blocks: [
        {
          type: 'image',
          screenshot: { file: 'resident-home-marked.jpg', alt: '住戶首頁，標出右上角的鈴鐺、底部的分頁和右下角的「通報」按鈕', caption: '住戶首頁' },
        },
        {
          type: 'list',
          items: [
            '右上角的鈴鐺：看通知。有新通知時，鈴鐺上會有紅點。',
            '下方的分頁：點一下就能換到不同的頁面，例如「首頁」「我的」。現在所在的頁面是藍色的。',
            '右下角的紅色按鈕：住戶按「通報」可以通報問題；管委會和管理人員按「＋」可以新增通報、公告等。',
          ],
        },
      ],
    },
    {
      heading: '想回到上一頁',
      blocks: [{ type: 'p', text: '按左上角的「←」。' }],
    },
  ],
  relatedArticles: ['notifications', 'resident-home', 'committee-home'],
}
