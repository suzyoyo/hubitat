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
- 形態：**只做手機版、可假裝成 APP 的網頁**（類似 PWA / WebView）；桌機版不做
- 團隊正在學習 JavaScript，請保持程式碼簡單、易讀，必要處加簡短中文註解

## 工作方式（重要）
1. **一次只做一步**，做完說明結果與如何驗證
2. 等我確認沒問題，**才 commit**
3. 步驟依 `docs/setup-plan.md`
4. Commit 訊息用英文、簡短（例如 `chore: add tailwindcss`）
5. 回覆使用繁體中文

## 目前進度
- repo：`suzyoyo/hubitat`，分支 `main`
- ✅ Step 0–6 完成：Vite + Vue（JS）、Tailwind v4、`@` 路徑別名、shadcn-vue 初始化、首批 20 個元件
- 元件盤點頁：`/playground`（`src/views/PlaygroundView.vue`，各分類在 `src/views/playground/`），第一區是設計 Token 一覽
- ✅ Step 7 完成：Vue Router、三端外框（`src/layouts/AppShell.vue`）、角色設定（`src/config/roles.js`）；各分頁目前是佔位頁
- ✅ Step 8 完成：設計 Token（`src/style.css`）、Noto Sans TC、外框彩色版、按鈕與輸入框放大到 44px
- wireframe 大致完成（2026-10-06），接下來做 Step 9（假資料），之後逐頁製作畫面
- Step 10（PWA）可隨時進行

## 使用者角色與 wireframe
- 三端使用者：**住戶**、**管委會**、**管理人員**（物業公司、警衛等）。廠商是被管理的資料，不是使用者
- 路由以網址區分三端：`/resident`、`/committee`、`/staff`；`/` 是角色選擇頁（尚無登入功能）
- wireframe 在 Figma（fileKey `S17Fjm0lNpOneka6BH0upt`，頁面「wireframe」），只看這三個區塊，其餘是草稿：
  - 住戶端-元件庫版（node `102:70`）
  - 管委會端-元件庫版（node `401:2627`）
  - 管理人員-元件庫版（node `763:7220`）
- 共用外框：頂部「好彼社區」+ 通知鈴鐺；底部浮動膠囊導覽列 + 右側圓形「＋」按鈕
  - 住戶分頁：首頁、社區檔案、我的；＋ = 通報
  - 管委會、管理人員分頁：首頁、案件、廠商、社區檔案、我的；＋ = 全域新增選單
- 彩色版參考畫面：住戶端首頁（node `758:11251`），三端都套用這個風格

## 設計 Token（`src/style.css`）
- 三層：基礎色階（`@theme`，覆蓋 Tailwind 的 blue / red / gray；orange 用 Tailwind 內建的，不覆蓋）→ 語意色（`:root`）→ 接到 Tailwind（`@theme inline`）。換色改 `:root`
- 文字樣式用 `type-` 開頭的 class：`type-title`、`type-card-title`、`type-body`、`type-label` 等（不要用 `text-` 開頭，會和顏色 class 撞名）
- 內文是 16px（設計稿 14px，團隊決定放大）
- 卡片：`rounded-card`（20px）+ `shadow-card`
- 外框顏色變數：`--nav`、`--nav-active`、`--fab` 等

## 待辦提醒
- 【之後】產品完成後要做一個網頁版使用手冊（給不會用的人看的說明），現在先不處理
- 【設計待決定】對比度偏低，目前完全照設計稿：白字在品牌藍（`--primary` / `--nav-active`）約 2 : 1、白字在 `--fab` 紅約 3 : 1。之後要調整時改 `style.css` 的 `:root` 變數即可
- 【之後】首頁的問候語與吉祥物放在 `AppHeader` 的 slot；吉祥物圖片尚未加入專案
- 【之後】管委會、管理人員的「＋」按鈕目前連到佔位頁，設計是彈出「全域新增選單」
- 【觀察中】`npm audit` 有 7 個 moderate 弱點，來自 shadcn-vue CLI 的相依套件（不會打包進網頁）；勿用 `npm audit fix --force`（會把 shadcn-vue 降回 0.10.5）

## 注意事項
- shadcn-vue 的 JavaScript 版：在 `components.json` 設 `"typescript": false`。官方 JS 文件範例的 alias 路徑寫 `./*`，但 Vite 專案原始碼在 `src/`，請以 `./src/*` 為準並驗證
- 長輩也是使用者：字級、觸控區（至少約 44px）、對比要留意
- PWA 功能（manifest、Service Worker）另用 `vite-plugin-pwa`，不屬於 shadcn-vue，延後處理
- 中文字型需另外指定
- 吉祥物「好彼管家」用於情感化設計（報修送出、新手引導、重要通知）
