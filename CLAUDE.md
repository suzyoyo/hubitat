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
3. **不直接 commit 到 `main`**（2026-10-09 起）：照 `docs/git-workflow.md`，一個頁面開一個分支（例如 `resident/reports`），做完開 PR，由 013 看過才合併。Claude 幫我做事時也照這個流程
4. 寫程式照 `docs/dev-guide.md`；做完元件要更新 `docs/component-map.md` 的狀態，放在同一個 PR
5. Commit 訊息用英文、簡短（例如 `chore: add tailwindcss`）
6. 回覆使用繁體中文

## 目前進度
- repo：`suzyoyo/hubitat`，分支 `main`
- ✅ Step 0–6 完成：Vite + Vue（JS）、Tailwind v4、`@` 路徑別名、shadcn-vue 初始化、首批 20 個元件
- 元件盤點頁：`/playground`（`src/views/PlaygroundView.vue`，各分類在 `src/views/playground/`），第一區是設計 Token 一覽
- ✅ Step 7 完成：Vue Router、三端外框（`src/layouts/AppShell.vue`）、角色設定（`src/config/roles.js`）；各分頁目前是佔位頁
- ✅ Step 8 完成：設計 Token（`src/style.css`）、Noto Sans TC、外框彩色版、按鈕與輸入框放大到 44px
- ✅ Step 9 完成：三端的假資料全部建好（14 種資料 + 我的待辦、決議事項、交接包、搜尋等彙整功能），規劃見 `docs/data-model.md`
- ✅ 住戶端首頁完成（2026-10-08）：`src/views/resident/HomeView.vue`，有通報／無通報兩種狀態都做了
  - 元件名稱對應好彼 Kit：`AppGreeting`、`SectionHeader`（`src/components/app/`）、`ReportCard`（`report/`）、`NoticeHomeCard`（`notice/`）、`MeetingCard`（`meeting/`）
  - 首頁連出去的內頁還是佔位頁的：`/resident/meetings/:id`
  - 首頁的公告卡點了是開詳情彈窗（`NoticeDetailDialog`），不是連到公告列表；要看全部按「看全部」
  - 問候語顯示「今天」正在進行的公告（優先與我有關的）；公告卡片只放與我有關的前 2 則
- ✅ 開發規格書與分工完成（2026-10-09）：我（suzy）和組員 013 共同開發，兩人程度相近、都參與設計、都是第一次用分支和 PR
  - `docs/dev-guide.md`：開發規範（資料夾、命名、寫新頁面的步驟、樣式、拿資料、不要做的事、尚未定案的事）
  - `docs/git-workflow.md`：分工與 Git 流程
  - `docs/component-map.md`：Kit 的 61 個產品元件對照程式檔案與完成狀態；第 5 節列了 Kit 本身待確認的問題
  - 分工：suzy 做住戶端、013 做管委會端；管理人員端先不做，等管委會端做出幾頁再看哪些畫面共用
  - 共用的東西（`style.css`、`roles.js`、外框、`components/ui/`、`src/mocks/`）由 suzy 負責
  - 路由已依三端拆開：`src/router/resident.js`、`committee.js`、`staff.js` 各有 `views`（做好的畫面）與 `innerPages`（內頁清單），`index.js` 負責組合，平常不用改
- ✅ 住戶端「我的通報」頁完成（2026-10-11 合併，PR #3）：`src/views/resident/ReportsView.vue`
  - 「進行中」「已完成」兩個分頁；載入中、沒資料、有資料三種狀態都做了
  - `ReportCard` 三種變體都做了：用 `type` 切換 Compact／Full，不傳 `report` 是 Empty；徽章顏色依狀態自動決定
  - 空狀態是設計稿沒畫的，用 `ui/empty` + 拿放大鏡的好彼管家（`src/assets/mascot/searching.png`，原圖 6）
  - review 後還沒定案的事（分頁按鈕高度、件數徽章、分頁外框）記在 `docs/dev-guide.md` 第 8 節
- ✅ 住戶端「通報詳情」頁（`src/views/resident/ReportDetailView.vue`）分兩個 PR 做完：
  - ✅ 第一部分「看」（分支 `resident/report-detail`）：通報摘要卡 `ReportSummary`、處理進度卡 `ReportProgressCard`（裡面是 `ReportStepper`、`ReportRecord`），載入中與找不到通報的畫面
  - ✅ 第二部分「改」（2026-10-13，分支 `resident/report-edit`）：補充說明（200 字）、照片（最多 3 張）、確認修改、撤回通報
    - 只有自己通報、還沒結案的才能改和撤回，假 API 用 `canEdit` 告訴畫面；已完成的、只是按「我也遇到了」的都只能看
    - 「補充說明」就是原本的問題描述（`description`），地點和主旨不能改
    - 假 API 新增 `updateReport`、`withdrawReport(id, userId, reason)`，都只改記憶體，重新整理網頁會變回原本的假資料
    - 新元件：`app/BottomCta`（固定在底部的按鈕區）、`report/ReportPhotoTile`（照片格，只做了 preview、add 兩種）、`report/ReportWithdrawDialog`（撤回確認彈窗，撤回原因選填）
    - 照片只顯示圖示和檔名（假資料只有檔名，沒有圖檔）
    - 底部按鈕下面的「撤回後…無法復原」拿掉了（和彈窗裡的說明重複），Figma 的通報詳情兩個畫面還有，要跟著拿掉
  - 設計稿的詳情頁同時是編輯頁，「我的通報」的「編輯通報 / 補充」按鈕也是連到這裡
  - 徽章顏色的規則放在 `src/lib/report.js`（`reportBadgeVariant`），`ReportCard` 和 `ReportSummary` 共用
  - 保密通報的公開狀態文字定為「僅你本人與管委會可見」（`CASE_VISIBILITY.private.note`）；進度條還沒到的步驟下面不顯示文字
- ✅ 住戶端「社區公告」頁（2026-10-12，分支 `resident/announcements`）：`src/views/resident/AnnouncementsView.vue`
  - 由上到下：社區行事曆 `CalendarCard`（`calendar/`，兩週日期＋圓點，不能點）、「與我有關／社區公告」分頁、公告卡 `NoticeCard`；載入中、空狀態（卡片樣式＋吉祥物）都做了
  - 分頁上的數字是「還沒看過的則數」，打開那個分頁就算看過、數字消失。已讀紀錄在假 API 的記憶體裡（`isRead`、`markAnnouncementsRead`），重新整理網頁會清空。從首頁彈窗看公告目前不算已讀
  - 公告詳情彈窗 `NoticeDetailDialog`（`notice/`）首頁和公告頁共用；兩種公告卡都是整張可點、送出 `detail` 事件。設計稿的「留言給管委會」按鈕還沒放，等留言功能
  - 公告卡和彈窗共用的規則放在 `src/lib/notice.js`（日期文字、主辦／負責）
  - 公告卡的徽章（2026-10-12 決定）：列表的 `NoticeCard` 只有類型、範圍兩個徽章，不放日期徽章（覺得太多，日期看內文）；首頁的 `NoticeHomeCard` 保留右上角的狀態徽章（施工中、今天開始＝紅；明天開始＝藍；N 天後開始＝灰）。Kit 的 `Notice/Card` 還有日期徽章，要跟著拿掉。活動的內容說明叫「活動說明」，其他叫「注意事項」
  - 公告沒有 `impact`（影響範圍說明）這個欄位了（2026-10-13 和 013 決定，PR #13 的討論）：發布公告的表單沒有地方填。首頁卡顯示「影響範圍：地點」＋內容說明前兩行（灰色）；列表卡顯示「注意事項：內容說明」前兩行；完整內容在彈窗的「注意事項」。首頁會議卡的重點決議內容也改成灰色
- ✅ 管委會端首頁完成（2026-10-12 合併，PR #10，013 做的）：`src/views/committee/HomeView.vue`，問候列、我的待辦（前 2 筆）、捷徑方塊、住戶意見、公告與動態
  - 新元件：`common/IconTile`、`admin/AdminTodoCard`、`admin/AdminNoticeCard`；`getMyTodos()` 的每一筆多了 `createdAt`（PR #9），合約、文件類是 `null`
  - 首頁連出去的內頁（待辦詳情、各「看全部」列表）都還是佔位頁，清單在 `src/router/committee.js` 的 `innerPages`
  - review 時答應 013、還沒做的（共用的東西由 suzy 開 PR）：
    - 緊急待辦的底色 `bg-red-50` 要加語意色（例如 `--warning-surface`），並一起看「紅色徽章疊在淺紅底上不明顯」的問題（013 想最後一起調顏色）
    - 「早安／午安／晚安」的判斷在住戶端和管委會端首頁各寫了一份，要搬到 `src/lib/date.js` 共用
  - 還沒處理的小事：公告卡片橫向排列時，內容少的卡片底部會多一塊空白；「查看全部待辦事項」按鈕在載入中和沒有待辦時也會顯示
- **下一步**：其他住戶端畫面（「我的」頁與加入管委會流程、新增通報流程、會議紀錄），開始前先問我要做哪一個。另外有三件答應過 013 的小事還沒做：「我的通報」分頁按鈕的可點範圍補到 44px（見待辦提醒）、緊急待辦底色 `red-50` 的語意色、問候語搬到 `src/lib/date.js`
- 013 已是 repo 協作者（hakukanojyo），PR 互相 review 的流程已經跑過（PR #1～#14）
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
  - 住戶分頁：首頁、社區、我的；＋ = 通報
  - 管委會、管理人員分頁：首頁、案件、廠商、社區、我的；＋ = 全域新增選單
  - 頂部列有兩種（`src/components/app/AppHeader.vue`）：底部分頁的那幾頁是 logo + 鈴鐺、有底部導覽；其他頁面（內頁、通知等）是「返回 + 置中標題」、沒有底部導覽。外框依路由的 `meta.isTab` 自動切換，頁面不用自己放標題列
- 彩色版參考畫面：住戶端首頁（node `758:11251`），三端都套用這個風格

## 設計 Token（`src/style.css`）
- 三層：基礎色階（`@theme`，覆蓋 Tailwind 的 blue / red / gray；orange 用 Tailwind 內建的，不覆蓋）→ 語意色（`:root`）→ 接到 Tailwind（`@theme inline`）。換色改 `:root`
- 文字樣式用 `type-` 開頭的 class：`type-title`、`type-card-title`、`type-body`、`type-label` 等（不要用 `text-` 開頭，會和顏色 class 撞名）
- 內文是 16px（設計稿 14px，團隊決定放大）
- 日期和補充資訊用 `type-date`，也是 16px（2026-10-12 從 14px 放大，原本 14px 和自己拼的 16px 混用）。靠 `text-muted-foreground` 的灰色和內文區分，不要自己拼 `text-base leading-5`
- 卡片：好彼 Kit 的卡片圓角是 14px，新做的元件用 `rounded-xl` + `shadow-card`。`rounded-card`（20px）是舊值，shadcn 的 `<Card>`（`src/components/ui/card/Card.vue`）、角色選擇頁和 playground 還在用，還沒決定要不要改
- 徽章（`src/components/ui/badge/index.js`，對照 Kit 的 Badge，高 22px）：顏色代表「需不需要注意」，住戶端和管理端的意思不同，完整規則與例子在 `docs/dev-guide.md` 第 5 節（2026-10-11 定案，來源是 013 整理的《管委會端規格：角色權限與狀態顏色》）
  - 住戶端：紅 `destructive`＝今天就會影響你（施工中、今天開始、緊急公告）；橘 `secondary`＝需要你動手做（待投票、請補充通報資料）；藍 `default`＝跟你有關但不用做什麼（與你相關、明天開始、已收到、處理中）；灰 `outline`＝已結束或只是分類（已完成、公告類型、一般日期）
  - 管理端：紅＝已經出問題（逾期、尚未受理）；橘＝輪到你處理或快到期；藍＝進行中、在等別人；灰＝已結束、正常或分類
  - 住戶端不顯示逾期天數、附議人數、處理人姓名
  - 紅色徽章的色值用我們色階裡的（`bg-warning-subtle text-red-800`），和 Kit 的 `#ffdbdc` / `#e7000b` 不完全相同
- 表單：必填只用紅色星號，不寫「必填」；選填用灰色小字「選填」，不要底色
- 按鈕（`src/components/ui/button/index.js`，對照 Kit 的 Button，2026-10-12）：`default` 品牌藍底＝主要動作；`outline` 灰底深藍字、**沒有外框**＝次要動作（撤回通報、登出帳號）；`secondary` 淺藍底（管委會端有用到，住戶端目前沒有）；`destructive` 淺紅底；`ghost`、`link` 沒有底色。有底色的四種底部有一條 1px 深色的線，用 `inset-shadow` 做（不用 `border-b`，圓角會斷開），已寫在元件裡，不用自己加。完整說明在 `docs/dev-guide.md` 第 5 節
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
- 篩選的規則 2026-10-13 定案（013 寫的，`docs/dev-guide.md` 第 5 節「篩選」）：選項含「全部」4 個以內用篩選標籤、5 個以上用下拉選單，排序也用下拉；看起來 32px、可以點的範圍補到 44px；不帶件數。Kit 裡就是 Button Small 膠囊形，不另外做元件；程式要包成 `common/FilterChips.vue`、`common/FilterSelect.vue`（都還沒做，013 做「我的待辦」時會做）。設計稿原本借用 Button 手動調整的 6 處（管委會端・社區檔案・公開文件）還沒對過新規則
- 【之後】新增提案畫面有 4 個 Textarea 被縮成單行在用，應改成 Input
- 專案根目錄的 `第一組＿好彼社區 Hubitat.pdf` 是我的個人檔案，**不要 commit**（已用 `.git/info/exclude` 在本機排除）
- 給組員看的假資料進度整理：https://claude.ai/code/artifact/fbdedca5-8868-4f7e-954e-5f8e9b94e09d
- 【之後】住戶端新增了「加入管委會」流程（2026-10-08 設計稿新增，尚未做假資料與畫面）：我的頁的「身分」區塊 → 輸入邀請碼或掃 QR Code → 確認邀請 → 接受完成（任期開始日才生效）。做到「我的」頁時要補邀請碼的假資料
- 【之後】管委會、管理人員的導覽列（5 個分頁）還沒對照 Kit 的樣式。分頁名稱「社區檔案」→「社區」三端都改完了（2026-10-10）；角色選擇頁管委會的說明文字還寫「社區檔案」，那是開發預覽用的頁面，先不改
- 【之後】管委會、管理人員的「＋」按鈕目前連到佔位頁，設計是彈出「全域新增選單」
- 【設計待決定】住戶端「我的通報」的分頁（`src/views/resident/ReportsView.vue`）：按鈕高度 35px 要修到 44px、選中「已完成」時件數徽章和底色融在一起、分頁沒有外框不容易看出可以切換。013 提案改成「看過的分頁不顯示件數、在列表上方顯示進行中件數」（需要已讀狀態，假資料還沒有）；「進行中」不加件數。詳見 `docs/dev-guide.md` 第 8 節。**按鈕高度的做法 2026-10-13 定案（還沒改）**：看起來的高度不變，可以點的範圍上下補到 44px，和 013 的篩選標籤規則（看起來 32px、可以點 44px）同一種做法；件數徽章和外框還沒定
- 【設計待決定】「編輯通報 / 補充」按鈕樣式：等設計稿三端統一後再修（PR #3 的 review 意見，還沒記進 dev-guide）。2026-10-12 起先跟著 Kit 的 `outline`（灰底、底部一條線）
- 【觀察中】`npm audit` 有 7 個 moderate 弱點，來自 shadcn-vue CLI 的相依套件（不會打包進網頁）；勿用 `npm audit fix --force`（會把 shadcn-vue 降回 0.10.5）

## 注意事項
- 用 `npx shadcn-vue@latest add` 加元件時，指令會順手改壞 `src/style.css`（字型換成 Geist）、升級 `package.json` 的套件、並問要不要覆蓋 `button`（選 N）。加完要還原這些檔案，只留新的元件資料夾，步驟在 `docs/shadcn-vue-notes.md`
- shadcn-vue 的 JavaScript 版：在 `components.json` 設 `"typescript": false`。官方 JS 文件範例的 alias 路徑寫 `./*`，但 Vite 專案原始碼在 `src/`，請以 `./src/*` 為準並驗證
- 長輩也是使用者：字級、觸控區（至少約 44px）、對比要留意
- PWA 功能（manifest、Service Worker）另用 `vite-plugin-pwa`，不屬於 shadcn-vue，延後處理
- 中文字型需另外指定
- 吉祥物「好彼管家」用於情感化設計（報修送出、新手引導、重要通知）
