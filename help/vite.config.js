import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 使用手冊網站（Help Center）的設定
// 這是一個獨立的網站，和 App 共用同一份 package.json 的套件，但分開啟動、分開打包
//   啟動：npm run dev:help    打包：npm run build:help（產生在 help/dist/）
export default defineConfig({
  // root：網站的根目錄是 help/（index.html 在這裡）
  root: fileURLToPath(new URL('.', import.meta.url)),
  // base：網站放在網域的哪一層。放在網域最上層用預設的 '/'；
  //   放在子路徑（例如 https://example.com/help/）時，打包前設定環境變數 HELP_BASE=/help/
  base: process.env.HELP_BASE || '/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      // '@/xxx' 代表 help/src/xxx（手冊自己的程式）
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // '@app/xxx' 代表 App 的 src/xxx，只用來拿 Logo、吉祥物圖片，不引用 App 的程式
      '@app': fileURLToPath(new URL('../src', import.meta.url)),
    },
  },
  server: {
    port: 5180, // 和 App 的 5173 錯開，兩個可以同時開
    fs: { allow: ['..'] }, // 允許讀 App 的 src/assets/
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
