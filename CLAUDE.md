# 好彼社區 Hubitat — 專案背景（給 Claude Code）

## 這是什麼
社區外包廠商進駐維修紀錄與管理的產品。住戶可實時查看社區狀態、管委會可方便查找資料並檢討廠商品質、決議是否續約。
主要競品：「智生活」APP。
完整產品簡介見 `docs/product-brief.md`，shadcn-vue 筆記見 `docs/shadcn-vue-notes.md`。
產品研究、Persona、IA 文件在 claude.ai 專案「社區平台專案」中。

## 技術選擇（已決定）
- Vue 3 + **JavaScript（不使用 TypeScript）**
- Vite
- Tailwind CSS（v4，使用 `@tailwindcss/vite`）
- shadcn-vue（元件庫，CLI 把原始碼複製進專案）
- 套件管理器：**npm**（不使用 pnpm；安裝用 `npm install`、一次性指令用 `npx`）
- 形態：**手機優先、可假裝成 APP 的網頁**（類似 PWA / WebView）
- 團隊正在學習 JavaScript，請保持程式碼簡單、易讀，必要處加簡短中文註解

## 工作方式（重要）
1. **一次只做一步**，做完說明結果與如何驗證
2. 等我確認沒問題，**才 commit**
3. 步驟依 `docs/setup-plan.md`，Step 0–6 現在可做，Step 7–9 需等 wireframe 定案
4. Commit 訊息用英文、簡短（例如 `chore: add tailwindcss`）
5. 回覆使用繁體中文

## 目前進度
- repo：`suzyoyo/hubitat`，分支 `main`
- ✅ Step 0–6 完成：Vite + Vue（JS）、Tailwind v4、`@` 路徑別名、shadcn-vue 初始化、首批 20 個元件
- 元件盤點頁：`src/views/PlaygroundView.vue`（各分類在 `src/views/playground/`），暫時由 `App.vue` 直接顯示
- wireframe 繪製中（由我負責，我會告訴你何時定案）→ 之後才做 Step 7–9
- Step 10（PWA）不依賴 wireframe，可隨時進行

## 待辦提醒
- 【Step 8】觸控區太小：shadcn 預設 Button 高 32px、Input 32px，未達長輩友善的 44px，需調整 `src/components/ui/button/index.js` 等元件的 size
- 【Step 8】字型：目前 `style.css` 從 Google Fonts 載入 Geist（僅英數），中文字型尚未指定
- 【觀察中】`npm audit` 有 7 個 moderate 弱點，來自 shadcn-vue CLI 的相依套件（不會打包進網頁）；勿用 `npm audit fix --force`（會把 shadcn-vue 降回 0.10.5）

## 注意事項
- shadcn-vue 的 JavaScript 版：在 `components.json` 設 `"typescript": false`。官方 JS 文件範例的 alias 路徑寫 `./*`，但 Vite 專案原始碼在 `src/`，請以 `./src/*` 為準並驗證
- 長輩也是使用者：字級、觸控區（至少約 44px）、對比要留意
- PWA 功能（manifest、Service Worker）另用 `vite-plugin-pwa`，不屬於 shadcn-vue，延後處理
- 中文字型需另外指定
- 吉祥物「好彼管家」用於情感化設計（報修送出、新手引導、重要通知）
