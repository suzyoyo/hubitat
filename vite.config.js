import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // vue()：讓 Vite 看得懂 .vue 檔
  // tailwindcss()：掃描程式碼中用到的 class，產生對應的 CSS
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      // 讓 '@/xxx' 代表 'src/xxx'（要和 jsconfig.json 的 paths 一致）
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
