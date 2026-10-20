// 「開始使用好彼社區」區塊的資料（首頁、認識我們兩個地方共用）
// 2026-10-20 從「下載 App」改來：好彼社區是 PWA（網頁 App），沒有上架 App Store／Google Play，
//   用手機瀏覽器打開網址就能用，想要像 App 一樣有圖示，就「加到主畫面」
export const OPEN_APP = {
  title: '開始使用好彼社區',
  text: '不用下載，用手機瀏覽器打開就能用。', // 後半句「加到主畫面後，就像一般的 App 一樣」2026-10-20 拿掉
  // App 的網址：寫完整網址（手冊和 App 一起部署在 GitHub Pages，App 在 /hubitat/）
  //   和 App 的 src/config/links.js 一樣，網址換了兩邊都要改
  url: 'https://suzyoyo.github.io/hubitat/',
  buttonLabel: '打開好彼社區',
  // 「加到主畫面」教學文章（content/articles/start/add-to-home.js）
  //   和「打開好彼社區」左右並排（2026-10-20），最窄的手機一顆只有約 119px 寬，文字要短
  //   開頭加「如何」：只寫「加到主畫面」很像按了就會直接幫你加好（2026-10-20 suzy 決定）
  guideLink: { to: '/articles/add-to-home', label: '如何加到主畫面' },
}
