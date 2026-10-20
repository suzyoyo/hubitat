// 2026-10-20 新增：好彼社區是 PWA（網頁 App），沒有上架 App Store／Google Play，這篇取代原本的「下載 App」
//   還沒有截圖（要在真的手機上截），先用文字說明
export default {
  id: 'add-to-home',
  title: '把好彼社區加到手機主畫面',
  description: '不用下載，加到主畫面後，點圖示就能打開，像一般的 App 一樣。',
  category: 'start',
  applicableRoles: ['resident', 'committee', 'staff'],
  order: 0, // 第一件要做的事，排在「認識 App 首頁」前面
  keywords: ['下載', '安裝', '主畫面', '桌面', '圖示', 'App', 'iPhone', 'Android', '捷徑'],
  published: true,
  sections: [
    {
      blocks: [
        { type: 'p', text: '好彼社區不用到 App Store 或 Google Play 下載，用手機的瀏覽器打開網址就能使用。加到主畫面以後，手機桌面會多一個好彼社區的圖示，點一下就能打開。' },
        { type: 'p', text: '網址：https://suzyoyo.github.io/hubitat/' },
      ],
    },
    {
      heading: 'iPhone',
      blocks: [
        { type: 'list', items: [
          '用 Safari 打開好彼社區的網址。',
          '按畫面下方的「分享」按鈕（一個方框，上面有往上的箭頭）。',
          '往下滑，按「加入主畫面」。',
          '按右上角的「新增」。',
        ] },
        { type: 'tip', title: '找不到「加入主畫面」？', text: '要用 Safari 打開才有這個選項。如果是從 LINE 或其他 App 裡點開連結，先選「用 Safari 開啟」。' },
      ],
    },
    {
      heading: 'Android 手機',
      blocks: [
        { type: 'list', items: [
          '用 Chrome 打開好彼社區的網址。',
          '按右上角的「⋮」（三個點）。',
          '按「加到主畫面」或「安裝應用程式」（不同手機的名稱可能不一樣）。',
          '依照畫面上的指示按「安裝」或「新增」。',
        ] },
      ],
    },
    {
      heading: '加好之後',
      blocks: [
        { type: 'p', text: '回到手機桌面，就會看到好彼社區的圖示。之後點這個圖示打開就可以了，不用再打網址。' },
      ],
    },
  ],
  relatedArticles: ['app-screen', 'notifications'],
}
