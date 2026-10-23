import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// iPhone 主畫面圖示直接寫進 index.html（2026-10-23）
//   iOS 27 有人加入主畫面只出現「好」字：圖示檔本身沒問題，但 iOS 27 加入主畫面時抓不到網路上的圖示檔；
//   圖片直接寫在網頁裡（data: 網址）就不用另外下載。其他開發者也遇到一樣的事，Apple 沒有正式說明
//   做法：把 index.html 裡 apple-touch-icon 的網址，換成 public/icon/apple-touch-icon.png 的內容（約 11KB）
const TOUCH_ICON_HREF = '/icon/apple-touch-icon.png?v=2'
function inlineTouchIcon() {
  return {
    name: 'inline-touch-icon',
    transformIndexHtml: {
      order: 'pre', // 在 Vite 幫網址加上 /hubitat/ 之前先換掉
      handler(html) {
        // 找不到就是 index.html 被改過了，直接報錯，不要默默失效
        if (!html.includes(TOUCH_ICON_HREF)) throw new Error(`index.html 裡找不到 ${TOUCH_ICON_HREF}`)
        const png = readFileSync(new URL('./public/icon/apple-touch-icon.png', import.meta.url))
        return html.replace(TOUCH_ICON_HREF, `data:image/png;base64,${png.toString('base64')}`)
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // vue()：讓 Vite 看得懂 .vue 檔
  // tailwindcss()：掃描程式碼中用到的 class，產生對應的 CSS
  // VitePWA()：讓網頁可以「加到主畫面」、打開時像 App 一樣沒有網址列（PWA，2026-10-16）
  //   只有 npm run build 打包出來的版本才有作用；npm run dev 開發時不會啟用
  plugins: [
    vue(),
    tailwindcss(),
    inlineTouchIcon(),
    VitePWA({
      // 有新版本時自動更新，不用跳提示問使用者
      registerType: 'autoUpdate',
      workbox: {
        // 離線時，App 的網址都會換成 App 首頁（navigateFallback）；但使用手冊和 App 放在同一個網站的 /hubitat/help/，
        // 不排除的話，打開手冊會跑出 App。這裡排除 /help/ 開頭的網址，交給手冊自己處理（2026-10-20）
        // 本機打包是 /help/，GitHub Pages 是 /hubitat/help/，兩種都要排除
        navigateFallbackDenylist: [/^\/(hubitat\/)?help\//],
      },
      // App 的名稱、顏色、圖示（圖示在 public/icon/，從 app-icon-1024.png 縮出來的）
      // 圖示路徑不加開頭的 /，從 manifest 所在的資料夾找，放到 /hubitat/ 底下也找得到
      manifest: {
        name: '好彼社區',
        short_name: '好彼社區',
        lang: 'zh-Hant',
        // 不寫 start_url、scope：外掛會自動用網站所在的資料夾（本機是 '/'，GitHub Pages 是 '/hubitat/'）
        display: 'standalone', // 打開時沒有瀏覽器的網址列
        background_color: '#f8fafc', // 開啟時的底色，和頁面背景 --background 一樣
        theme_color: '#f8fafc', // 手機上方狀態列的顏色
        icons: [
          { src: 'icon/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon/icon-512.png', sizes: '512x512', type: 'image/png' },
          // Android 會把圖示裁成圓形等形狀：另外一張四周多留白的，logo 縮在中間的圓裡，裁了也不會切到（2026-10-16）
          { src: 'icon/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // 讓 '@/xxx' 代表 'src/xxx'（要和 jsconfig.json 的 paths 一致）
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
