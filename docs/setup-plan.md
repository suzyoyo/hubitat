# 好彼社區 Hubitat｜專案初始化步驟計畫

技術選擇：Vue 3 + **JavaScript（不使用 TypeScript）** + Vite + Tailwind CSS + shadcn-vue
產品形態：只做手機版、可假裝成 APP 的網頁（PWA / WebView 風格），桌機版不做
工作方式：**一次只做一步 → 你確認沒問題 → 我 commit → 再做下一步**

---

## 兩條並行軌道

| 軌道 | 誰做 | 內容 |
|---|---|---|
| A. Wireframe | 你 | 持續繪製，決定畫面、流程、需要哪些元件 |
| B. 專案建置 | 我 + 你確認 | 本文件的步驟 |

原則：**與 wireframe 無關的步驟（B1–B6）現在就能做；依賴 wireframe 的步驟（B7–B9）等你的畫面定案再做。**

---

## Step 0｜前置準備（你來做，我不動手）

- [ ] 在 GitHub 建一個**空的 repo**（不勾 README、不勾 .gitignore、不選 license），例如 `hubitat-app`
- [ ] 把 `owner/repo` 告訴我，我把它接進工作環境
- [ ] 確認 Node.js 版本可用於 Vite 與 Tailwind v4（以官方文件要求為準，我在 Step 1 會檢查）
- [x] 確認你偏好的套件管理器（已決定使用 npm）

## Step 1｜Git 與環境檢查
- 檢查 node / npm / git 版本
- 接上遠端 repo，設定預設分支 `main`
- **Commit**：`chore: init repository`

## Step 2｜建立 Vue（JavaScript）專案
- `npm create vite@latest` 使用 `vue` 樣板（不是 `vue-ts`）
- 確認 `npm run dev` 能跑起來
- **Commit**：`chore: scaffold vite vue project`

## Step 3｜導入 Tailwind CSS
- 安裝 `tailwindcss` 與 `@tailwindcss/vite`
- `src/style.css` 改為 `@import "tailwindcss";`
- **Commit**：`chore: add tailwindcss`

## Step 4｜路徑別名設定
- 新增 `jsconfig.json`，設定 `@/*` → `./src/*`（讓編輯器能跳轉，不需要 tsconfig）
- `vite.config.js` 加入 `@` alias 與 tailwind plugin（JS 版不需要 `@types/node`）
- 注意：shadcn-vue 的 JavaScript 文件範例把路徑寫成 `./*`，但 Vite 專案的原始碼在 `src/`，我會以 `./src/*` 為準，並在 Step 5 驗證
- **Commit**：`chore: configure path alias`

## Step 5｜初始化 shadcn-vue
- `npx shadcn-vue@latest init`，base color 先選 Neutral（品牌色之後在 token 階段再改）
- 確認 `components.json` 中 `"typescript": false`，讓 CLI 產生 **JavaScript 版元件**（`.vue` 檔內為 `<script setup>`，工具函式為 `utils.js`）
- 若 CLI 沒有自動偵測，手動改 `components.json` 後再加元件
- **Commit**：`chore: init shadcn-vue`

## Step 6｜加入首批元件 + 元件盤點頁
先加入與報修閉環最相關的元件，做一個 `/playground`（或暫時的 App.vue）陳列，用來盤點外觀與用法：
- 基礎：button, card, badge, avatar, separator, skeleton, spinner, empty
- 手機互動：drawer, sheet, sonner, tabs
- 表單：field, input, textarea, radio-group, slider
- 進度：stepper, progress
- 清單：item

> 這一步同時完成你清單裡的「元件庫瀏覽盤點」。

- **Commit**：`feat: add first batch of ui components and playground`

---

以下步驟依賴 wireframe（2026-10-06 已大致完成，Figma 連結與區塊見 `CLAUDE.md`）。

## Step 7｜手機殼 App Shell（依賴 wireframe）
- 安裝並設定 Vue Router
- 三端以網址區分：`/resident`（住戶）、`/committee`（管委會）、`/staff`（管理人員）；`/` 是角色選擇頁
- 建立共用外框：置中容器、頂部列（好彼社區 + 通知鈴鐺）、底部浮動導覽列、右側「＋」按鈕
- 每個底部分頁先做一個空白佔位頁；畫面內容之後再逐頁製作
- 元件盤點頁搬到 `/playground`
- viewport 與安全區域設定
- 只做手機版，不做桌機版 Sidebar
- **Commit**：`feat: add mobile app shell and routing`

## Step 8｜設計 Token（依賴 wireframe / 品牌）
- 在 CSS 變數中定義好彼社區的 primary、accent、destructive、圓角 `--radius`
- 新增報修狀態色（例如：待處理 / 施工中 / 已完成）
- 調整字級與觸控區，考慮長輩可讀性
- 指定中文字型
- **Commit**：`feat: add hubitat design tokens`

## Step 9｜Mock 資料結構草擬（依賴 wireframe）
以 wireframe 畫面反推需要的資料，先草擬資料結構與假資料（純 JavaScript 物件，用註解標明欄位，不寫型別）：

| 實體 | 說明 |
|---|---|
| Community | 社區 |
| User | 角色：住戶 / 管委會 / 管理人員 |
| RepairTicket | 報修單 |
| TicketStatusLog | 報修進度紀錄（閉環的核心） |
| Vendor | 廠商名冊 |
| WorkLog | 施工日誌（含照片） |
| Review | 住戶 / 管委會對廠商的評價 |
| HandoverItem | 管委會交接包項目（決議、文件） |

- 檔案位置：`src/mocks/`（例如 `tickets.js`、`vendors.js`），欄位說明用註解或 JSDoc 標註
- 提供簡單的假 API 函式（回傳 Promise，模擬延遲），之後換真 API 不動畫面
- **Commit**：`feat: add mock data models`

## Step 10｜PWA 基礎（可延後）
- `vite-plugin-pwa`、manifest、圖示、可安裝設定
- **Commit**：`feat: add pwa manifest`

---

## 每一步的固定流程
1. 我說明這一步要做什麼
2. 我執行（只做這一步）
3. 我回報結果與如何驗證
4. 你確認 OK
5. 我 commit（必要時 push）

## 待你決定 / 確認
- [ ] repo 名稱與 `owner/repo`
- [x] 套件管理器：npm
- [ ] 專案名稱（資料夾與 package name）
- [x] wireframe 已大致完成（2026-10-06），開始 Step 7–9
