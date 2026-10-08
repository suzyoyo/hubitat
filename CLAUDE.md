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
- ✅ Step 9 完成：三端的假資料全部建好（14 種資料 + 我的待辦、決議事項、交接包、搜尋等彙整功能），規劃見 `docs/data-model.md`
- ✅ 住戶端首頁完成（2026-10-08）：`src/views/resident/HomeView.vue`，有通報／無通報兩種狀態都做了
  - 元件名稱對應好彼 Kit：`AppGreeting`、`SectionHeader`（`src/components/app/`）、`ReportCard`（`report/`）、`NoticeHomeCard`（`notice/`）、`MeetingCard`（`meeting/`）
  - 首頁連出去的內頁目前是佔位頁：`/resident/reports`、`/resident/reports/:id`、`/resident/announcements`、`/resident/meetings/:id`
  - 問候語顯示「今天」正在進行的公告（優先與我有關的）；公告卡片只放與我有關的前 2 則
- **下一步**：做首頁連出去的內頁（我的通報、通報詳情、社區公告），或「我的」頁與加入管委會流程，開始前先問我要做哪一個
- wireframe 大致完成（2026-10-06）
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
- 卡片：好彼 Kit 的卡片圓角是 14px，新做的元件用 `rounded-xl` + `shadow-card`。`rounded-card`（20px）是舊值，只剩角色選擇頁和 playground 在用，還沒決定要不要改
- 徽章（`src/components/ui/badge/index.js`，對照 Kit 的 Badge，高 22px）：
  - `default` 淺藍底、深藍字：分類，或「已收到」這類還沒開始處理的狀態
  - `secondary` 淺橘底、深橘字：進行中的狀態，例如「處理中」「施工中」
  - `outline` 灰底、黑字、沒有外框：不需要強調的分類，例如「常態例會」「1F 大廳」
- 通報狀態顏色（已定）：已收到＝淺藍、處理中＝淺橘。其他狀態（已受理、已完成、進行中、待處理）設計稿上還有兩三種顏色混用，尚未定案
- 表單：必填只用紅色星號，不寫「必填」；選填用灰色小字「選填」，不要底色
- 外框顏色變數：`--nav`、`--nav-active`、`--fab` 等

## 假資料（`src/mocks/`）
- 完整規劃在 `docs/data-model.md`（14 種資料、彼此的關係、wireframe 不一致處的統一方式）。三端看同一批資料
- `data/*.js`：純資料，每個檔案開頭用註解說明欄位；狀態、類別用對照表（例如 `VENDOR_STATUSES`）把資料值轉成顯示文字
- `api/`：假 API，每種資料一個檔案，由 `api/index.js` 統一匯出（`import { getVendors } from '@/mocks/api'`）。全部回傳 Promise 並延遲 400ms。畫面只透過這裡拿資料，不直接 import `data/`（對照表除外）
- 角色權限：函式可傳入 `role`，假 API 會拿掉該角色不能看的欄位（合約金額與檔案、維修費用只有管委會看得到）
- 公告審核規則：委員發布的不用審核；管理人員發布的要經過主委或副主委審核，除非標示為緊急（緊急公告直接發布，並同步通知管委會）
- 會隨日期變的狀態不存在資料裡，由假 API 計算（合約即將到期、設備保養逾期等）
- `MOCK_TODAY`（`2026-10-01`）與 `MOCK_NOW`（`2026-10-01T13:42`）：假裝的「今天」與「現在」
- 案件（`cases.js`）是住戶的「通報」也是管理端的「案件」：管理端用 `getCases` / `getCaseById`，住戶端用 `getMyReports` / `getReportById`，兩邊拿到的欄位和狀態文字不同
- 示範主角：李伯伯（`u-c04`），住戶兼修繕委員；管理人員端是張管理員
- 時間用 ISO 字串（`2026-09-25T14:30`），顯示時用 `src/lib/date.js` 轉換
- 彙整類的功能不另外存資料，由假 API 從其他資料算出來：`getMyTodos`（我的待辦）、`getResolutions`（決議事項）、`getResidentOpinions`（住戶意見＝會議的住戶留言）、`getHandoverPackage`（交接包）、`search`（搜尋）
- 會議：管委會看得到全部；住戶與管理人員只看得到已發布的「住戶版內容」，留言只看得到自己的
- 盤點頁 `/playground` 最下面的「假資料」區可以看到各種資料實際載入的樣子
- Figma 團隊另外在建元件，做到用得上的內頁時才轉成 Vue 元件

## Figma 檔案
- 設計稿：fileKey `S17Fjm0lNpOneka6BH0upt`，畫面在「mockup」頁，分成住戶端、管委會端、管理人員三個區塊（住戶端區塊 node `758:7722`，首頁 `758:7723`）
- 好彼 Kit（元件庫）：fileKey `QN3qtb18bNf1syex8n5FTv`。從 shadcn 拉出來的基礎元件各一頁；自訂的產品元件（App/、Report/、Notice/、Meeting/、Admin/ 等）在「hubitat」頁
- 在 Kit 調整元件高度時要用「綁變數」的方式，不要直接輸入數字；直接輸入會解掉變數，mockup 裡填滿寬度的實例就不會跟著變
- 在 Kit 清除巢狀元件的覆寫前，先確認清掉後會退回什麼預設值（2026-10-08 曾因此讓通報卡片的徽章變回預設文字）
- Figma 工具的截圖偶爾會落後於實際畫面，以讀到的資料為準，重要畫面請我在 Figma 裡確認

## 待辦提醒
- 【之後】產品完成後要做一個網頁版使用手冊（給不會用的人看的說明），現在先不處理
- 【設計待決定】對比度偏低，目前完全照設計稿：白字在品牌藍（`--primary` / `--nav-active`）約 2 : 1、白字在 `--fab` 紅約 3 : 1。之後要調整時改 `style.css` 的 `:root` 變數即可
- 吉祥物原圖在 `src/assets/IP/`（`1.png`～`6.png`，每張約 3MB，**不要 commit**）：1 思考、2 開心奔跑、3 指向左上、4 驚訝坐著、5 坐著揮手、6 拿放大鏡流汗。用在網頁前要先縮小，縮好的放 `src/assets/mascot/`（首頁問候列用的是 3，存成 `pointing.png`）
- 【之後】mockup 裡有些卡片是手工畫的框、不是 Kit 元件，不會跟著 Kit 變動，還沒清查
- 【之後】Kit 缺「篩選標籤」元件，目前有 6 處借用 Button 手動調整（管委會端・社區檔案・公開文件）
- 【之後】新增提案畫面有 4 個 Textarea 被縮成單行在用，應改成 Input
- 專案根目錄的 `第一組＿好彼社區 Hubitat.pdf` 是我的個人檔案，**不要 commit**（已用 `.git/info/exclude` 在本機排除）
- 給組員看的假資料進度整理：https://claude.ai/code/artifact/fbdedca5-8868-4f7e-954e-5f8e9b94e09d
- 【之後】住戶端新增了「加入管委會」流程（2026-10-08 設計稿新增，尚未做假資料與畫面）：我的頁的「身分」區塊 → 輸入邀請碼或掃 QR Code → 確認邀請 → 接受完成（任期開始日才生效）。做到「我的」頁時要補邀請碼的假資料
- 【之後】導覽列的「社區檔案」設計稿已改名為「社區」：住戶端已改；管委會、管理人員做到時再改（`src/config/roles.js` 的 `managementTabs`），並一起對照 Kit 的導覽列樣式
- 【之後】管委會、管理人員的「＋」按鈕目前連到佔位頁，設計是彈出「全域新增選單」
- 【觀察中】`npm audit` 有 7 個 moderate 弱點，來自 shadcn-vue CLI 的相依套件（不會打包進網頁）；勿用 `npm audit fix --force`（會把 shadcn-vue 降回 0.10.5）

## 注意事項
- shadcn-vue 的 JavaScript 版：在 `components.json` 設 `"typescript": false`。官方 JS 文件範例的 alias 路徑寫 `./*`，但 Vite 專案原始碼在 `src/`，請以 `./src/*` 為準並驗證
- 長輩也是使用者：字級、觸控區（至少約 44px）、對比要留意
- PWA 功能（manifest、Service Worker）另用 `vite-plugin-pwa`，不屬於 shadcn-vue，延後處理
- 中文字型需另外指定
- 吉祥物「好彼管家」用於情感化設計（報修送出、新手引導、重要通知）
