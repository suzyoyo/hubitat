import { HOME_TOUR } from '../../home-tour.js'

export default {
  id: 'app-screen',
  title: '認識 App 首頁',
  description: '上方的鈴鐺、下方的分頁、右下角的按鈕，各是做什麼的。',
  category: 'start',
  hideDescription: true, // 文章頁不顯示 description（2026-10-19）
  applicableRoles: ['resident', 'committee', 'staff'],
  order: 1,
  keywords: ['首頁', '畫面', '分頁', '導覽', '鈴鐺', '按鈕', '待辦', '新手', '入門'],
  published: true,
  popular: true,
  sections: [
    {
      blocks: [
        // 用 tab 切身分，每個身分是一組輪播，一張只亮一個地方（2026-10-19 從「截圖＋下面一段清單」改來）
        // 輪播的資料在 content/home-tour.js，「認識○○首頁」三篇也用同一份
        { type: 'tour', slides: HOME_TOUR },
      ],
    },
  ],
  relatedArticles: ['notifications', 'resident-home', 'committee-home'],
}
