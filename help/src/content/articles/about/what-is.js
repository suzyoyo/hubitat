// 「認識我們」的文字版：只給搜尋用（搜尋「比比」「好彼管家」「服務」找得到）
//   畫面上不會顯示這篇：打開 /articles/what-is 會轉到介紹頁 /about（AboutView.vue）
//   內容直接從 src/content/about.js 拿，改那個檔案這裡就會跟著變
// 文章欄位說明見 help/README.md「新增一篇文章」
import { ABOUT_INTRO, ABOUT_MASCOT, ABOUT_NAME, ABOUT_SERVICES } from '../../about.js'

export default {
  id: 'what-is',
  title: '好彼社區是什麼？',
  description: ABOUT_INTRO.lead,
  category: 'about',
  applicableRoles: ['resident', 'committee', 'staff'],
  order: 1,
  keywords: ['介紹', 'Hubitat', '好彼', '產品', '功能', '服務', '認識我們', '吉祥物', '好彼管家', '管家', '比比', 'Bibby'],
  published: true,
  sections: [
    {
      heading: '名稱的由來',
      blocks: [{ type: 'p', text: ABOUT_NAME }],
    },
    {
      heading: '我們的服務',
      blocks: [{ type: 'list', items: ABOUT_SERVICES.map((s) => `${s.title}：${s.body}`) }],
    },
    {
      heading: `認識好彼管家${ABOUT_MASCOT.name}`,
      blocks: [
        { type: 'p', text: `${ABOUT_MASCOT.name}是${ABOUT_MASCOT.title}。${ABOUT_MASCOT.bio}` },
        { type: 'list', items: ABOUT_MASCOT.appearances },
      ],
    },
  ],
  relatedArticles: ['app-screen', 'notifications'],
}
