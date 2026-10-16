import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // vue()：讓 Vite 看得懂 .vue 檔
  // tailwindcss()：掃描程式碼中用到的 class，產生對應的 CSS
  // VitePWA()：讓網頁可以「加到主畫面」、打開時像 App 一樣沒有網址列（PWA，2026-10-16）
  //   只有 npm run build 打包出來的版本才有作用；npm run dev 開發時不會啟用
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      // 有新版本時自動更新，不用跳提示問使用者
      registerType: 'autoUpdate',
      // App 的名稱、顏色、圖示（圖示在 public/icon/，從 app-icon-1024.png 縮出來的）
      manifest: {
        name: '好彼社區',
        short_name: '好彼社區',
        lang: 'zh-Hant',
        start_url: '/',
        display: 'standalone', // 打開時沒有瀏覽器的網址列
        background_color: '#f8fafc', // 開啟時的底色，和頁面背景 --background 一樣
        theme_color: '#f8fafc', // 手機上方狀態列的顏色
        icons: [
          { src: '/icon/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon/icon-512.png', sizes: '512x512', type: 'image/png' },
          // Android 會把圖示裁成圓形等形狀；logo 在中間 60% 左右，裁了也不會切到
          { src: '/icon/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
