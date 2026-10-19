# 好彼社區 Hubitat — 元件對照表

Figma 好彼 Kit 的元件，對應到程式裡的哪個檔案、做了沒。

- 在設計稿看到一個元件，想知道程式裡有沒有 → 查這份
- 要做一個新元件，想知道檔案該叫什麼、放哪裡 → 查這份
- 做完一個元件 → **回來把狀態改成 ✅**，和元件放在同一個 PR

命名規則的說明在 [dev-guide.md 第 3 節](dev-guide.md#3-命名規則)。

資料來源：好彼 Kit（fileKey `QN3qtb18bNf1syex8n5FTv`）的「hubitat」頁，2026-10-09 讀取，共 61 個產品元件。Kit 之後有增減時要更新這份。

## 目錄

1. [怎麼讀這份表](#1-怎麼讀這份表)
2. [產品元件](#2-產品元件)
   - [A. 版面與導覽（App/）](#a-版面與導覽app)
   - [B. 通報相關（Report/）](#b-通報相關report)
   - [C. 公告與會議](#c-公告與會議)
   - [D. 社區檔案](#d-社區檔案)
   - [E. 回饋與提示](#e-回饋與提示)
   - [F. 管委會卡片（Admin/）](#f-管委會卡片admin)
3. [基礎元件（shadcn-vue）](#3-基礎元件shadcn-vue)
4. [Kit 和程式不一樣的地方](#4-kit-和程式不一樣的地方)
5. [需要跟設計確認的事](#5-需要跟設計確認的事)

---

## 1. 怎麼讀這份表

**狀態**

| 記號 | 意思 |
|---|---|
| ✅ | 做好了，可以直接用 |
| 🟡 | 做了一部分，備註會寫缺什麼 |
| ⬜ | 還沒做。「程式檔案」欄是做的時候該用的名稱和位置 |
| ➖ | 不用另外做，備註會寫改用什麼 |

**Kit 的「變體」和「屬性」怎麼變成程式**

Kit 的元件右側面板有兩種設定，轉成程式時都是 props：

| Kit 裡的 | 例子 | 程式裡 |
|---|---|---|
| 變體（Variant） | `Report/Card` 的 Type：Compact／Full／Empty | 同一個檔案，用 props 切換，不拆成三個檔案 |
| 文字屬性 | Title、Date | 不會一個一個變成 prop。程式是傳「一整筆資料」進去（例如 `report`），元件自己取出要顯示的欄位 |
| 開關屬性 | Badge、Button（顯示或隱藏） | 有資料就顯示、沒資料就不顯示；真的需要手動開關時才加 prop |

> **為什麼文字不一個一個傳**：假 API 回傳的一筆資料已經有所有欄位。傳一整筆進去，頁面的程式碼會短很多，之後欄位增減也只需要改元件。

**誰來做**

依 [git-workflow.md 的分工](git-workflow.md#1-分工)：誰先用到誰做，動手前在群組說一聲。大致上 A～E 區是住戶端先用到（suzy），F 區是管委會端先用到（013）；E 區的空狀態、通知、對話框兩邊都會用到，先做的人做。

---

## 2. 產品元件

### A. 版面與導覽（App/）

放在 `src/components/app/`。這一區大多是外框，屬於共用的東西，改之前先說。

| Kit 元件 | 程式檔案 | 狀態 | 備註 |
|---|---|---|---|
| `App/Header` | `app/AppHeader.vue` | 🟡 | 變體 Type：**Brand**（首頁品牌列）、**Page**（內頁：返回＋置中標題）已做，外框會自動切換，頁面不用自己放。Page 的右側按鈕還沒做，等有頁面用到再加 |
| `App/Bottom Nav` | `app/BottomNav.vue` | ✅ | 住戶端 3 個分頁 |
| `App/Bottom Nav 管委會` | `app/BottomNav.vue` | 🟡 | 和上面是同一個檔案，分頁由 `roles.js` 傳入。5 個分頁的版本能用，但還沒對照 Kit 的樣式|
| `App/Nav Item` | ➖ | ➖ | 寫在 `BottomNav.vue` 裡面，沒有拆出來 |
| `App/FAB` | ➖ | ➖ | 寫在 `BottomNav.vue` 裡面，沒有拆出來 |
| `App/Greeting` | `app/AppGreeting.vue` | ✅ | |
| `App/Section Header` | `app/SectionHeader.vue` | ✅ | 沒傳 `to` 就不顯示「看全部」；文字可以用 `link-text` 換，例如廠商分頁的「查看所有廠商」（2026-10-18） |
| `App/Bottom CTA` | `app/BottomCta.vue` | ✅ | 畫面底部固定的按鈕區。按鈕用 slot 放進去，一個或兩個都會平分寬度；`note` 是按鈕下面的一行灰字；加上 `vertical` 按鈕改成上下排（完成頁用）。這一區會蓋住頁面最下面的內容，頁面自己要在底部留空間（例如 `pb-24`）。用法見 `views/resident/ReportDetailView.vue` |
| `App/Bottom CTA 三按鈕` | `app/BottomCta.vue` | ⬜ | 做成同一個檔案，用 props 決定幾個按鈕 |
| `App/Drawer Content` | `app/DrawerContent.vue` | ⬜ | 從底部滑出的面板內容。外層用基礎元件 `ui/drawer` |
| `App/Menu Item` | `app/MenuItem.vue` | ✅ | 選單的一列：圖示＋標題＋箭頭。圖示用 slot 放進去；`description` 是標題下面的灰色說明；有傳 `to` 才能點、才有箭頭。住戶端「我的」頁、管委會和管理人員的「全域新增選單」（`app/BottomNav.vue`）在用。設計稿「我的」頁的這幾列用的是基礎元件 Item，不是 `App/Menu Item`，兩個長得一樣不一樣還沒對過 |
| `App/Message` | `app/AppMessage.vue` | ✅ | 右下角圓形的「留言」按鈕（68px、半透明品牌藍），會議紀錄頁用來打開留言抽屜。只是按鈕，固定在哪裡由頁面決定，送出 `click`。圖示是設計稿的 hugeicons（`assets/icons/chat-edit.svg`），lucide 沒有一樣的 |
| `_Drawer Slot` | ➖ | ➖ | 底線開頭是 Kit 內部用的零件，程式不用做 |

### B. 通報相關（Report/）

放在 `src/components/report/`。

| Kit 元件 | 程式檔案 | 狀態 | 備註 |
|---|---|---|---|
| `Report/Card` | `report/ReportCard.vue` | ✅ | 變體 Type 三種都做了：**Compact**（首頁摘要）、**Full**（我的通報列表：送出日期＋管委會回覆＋編輯按鈕）、**Empty**（目前無通報）。用 `type` prop 切換 Compact／Full，不傳 `report` 就是 Empty。Full 的編輯按鈕由 `editTo` 決定要不要顯示 |
| `Report/Summary` | `report/ReportSummary.vue` | ✅ | 通報摘要卡：標題＋狀態徽章＋送出日期＋公開狀態。沒有另外做 Visibility 的 prop，依傳進來的 `report.visibility` 自動切換：Public 是地球圖示「公共區域・公開顯示」，Private 是鎖頭圖示「僅你本人與管委會可見」（文字來自假 API 的 `visibilityLabel`）。最下面「你的描述」顯示住戶當初寫的描述（只能看，沒寫顯示「沒有填寫描述」，2026-10-19） |
| `Report/Progress Card` | `report/ReportProgressCard.vue` | ✅ | 「處理進度」卡片，裡面用到下面三個。傳 `report` 進去，會用到 `steps` 和 `timeline` |
| `Report/Stepper` | `report/ReportStepper.vue` | ✅ | 三步驟進度條。沒有 Current 的 prop，傳通報的 `steps`（三個階段的時間）進去，元件自己算走到第幾步；已完成時三步都打勾。還沒到的步驟下面不顯示日期（設計稿寫「尚未完成」）。沒有用 `ui/stepper`，那是給可以點的表單流程用的 |
| `Report/Step` | ➖ | ➖ | 進度條的單一圓點（Done／Current／Todo）。寫在 `ReportStepper.vue` 裡面即可 |
| `Report/Record` | `report/ReportRecord.vue` | ✅ | 處理紀錄的一筆。變體 State 用 `latest` prop 切換：不傳是 Past（灰色），傳了是 Latest（深色粗體） |
| `Report/Similar Card` | `report/ReportSimilarCard.vue` | ✅ | 相似通報卡。傳 `getSimilarReports()` 的一筆 `report`。變體 Type 用 `type` prop 切換：`similar`（預設，有「我也遇到了」按鈕，按了送出 `support` 事件）／`joined`（完成頁用，沒有按鈕，多一行「原始通報內容」）。自己通報的、已經按過的不顯示按鈕，改顯示一句說明（設計稿沒畫） |
| `Report/Flow Progress` | `report/ReportFlowProgress.vue` | ✅ | 新增通報流程頂部的進度：步驟名稱＋百分比＋進度條。傳 `step`（1～5），名稱和百分比元件自己算。進度條用基礎元件 `ui/progress` |
| `Report/Review Row` | `report/ReportReviewRow.vue` | ✅ | 確認送出頁的一列：欄位名稱（`label`）＋內容（`value`）＋「修改」按鈕，按了送出 `edit` 事件。分隔線由外面的容器用 `divide-y` 畫，沒有做成 prop |
| `Report/Photo Tile` | `report/ReportPhotoTile.vue` | ✅ | 照片格，**所有上傳照片的地方都用它**（2026-10-19 統一：新增通報、通報詳情、快速留存、回報完成、交辦回報）。`type` 有兩種：`thumbnail`（預設，傳 `name` 檔名，格子裡**直接顯示照片、不顯示檔名**，影片顯示第一個畫面＋攝影機圖示；假資料沒有內容的只放圖示；**PDF 放文件圖示＋檔名**（沒有縮圖分不出是哪份）。下面一顆「刪除」文字按鈕，送出 `remove`）／`add`（虛線框的「新增」，**可以一次選好幾個**，送出 `pick` 帶檔案的陣列；`accept` 決定能選什麼，預設照片或影片）。加入檔案、影片 50MB 上限、超過上限的提示、同名改名都在 `lib/filePreview.js` 的 `addPickedFiles`。**和 Kit 不一樣**：沒有大張的 Preview 和「更換」（2026-10-13 決定兩頁統一用小張＋「刪除」，長輩比較看得懂文字；要換就先刪除再新增） |
| （Kit 沒有元件） | `report/ReportPhotoGrid.vue` | ✅ | 照片／影片那一區：一排三格的 `ReportPhotoTile`＋下面一行說明（最多 3 個、影片 50MB 以內）。用 `v-model` 綁檔名的陣列。新增通報和通報詳情共用，兩頁才會長得一樣 |
| （Kit 沒有元件） | `case/CaseAttachmentList.vue` | ✅ | 附件那一區：和 `ReportPhotoGrid` 一樣是一排三格的 `ReportPhotoTile`（2026-10-19 從一列一個檔案改過來），多了 PDF、上限由頁面傳 `max`。快速留存、回報完成、交辦回報用 |
| （Kit 沒有元件） | `case/CaseFileGrid.vue` | ✅ | 案件詳情、留存詳情**看**照片的地方：一排兩格，示範時剛選的照片顯示縮圖、點了全螢幕；影片顯示第一個畫面；假資料只放圖示。不顯示檔名，只有 PDF 留檔名（2026-10-19） |

### C. 公告與會議

這一區有五種分類，各放各的資料夾。

| Kit 元件 | 程式檔案 | 狀態 | 備註 |
|---|---|---|---|
| `Notice/Home Card` | `notice/NoticeHomeCard.vue` | ✅ | 首頁的社區公告卡，右上角是狀態徽章（施工中、明天開始、3 天後開始）。中間是地點（活動類），或影響範圍＋公告內容說明的前兩行（灰色，超過用「…」）。整張可以點，點了送出 `detail` 事件，由頁面打開詳情彈窗 |
| `Notice/Card` | `notice/NoticeCard.vue` | ✅ | 社區公告頁的完整公告卡：類型、範圍兩個徽章＋日期時間＋地點（活動類）或「注意事項」（公告內容說明的前兩行）＋負責單位。沒有日期徽章（2026-10-12 決定拿掉，Kit 還有，待更新）。整張可以點，點了送出 `detail` 事件 |
| （Kit 沒有元件，設計稿是「查看詳情彈窗」） | `notice/NoticeDetailDialog.vue` | ✅ | 公告詳情彈窗，首頁和社區公告頁共用。傳 `notice`，用 `v-model:open` 控制開關。設計稿的「留言給管委會」按鈕還沒放，等留言功能做的時候再加 |
| `Meeting/Card` | `meeting/MeetingCard.vue` | 🟡 | 變體 Type：**Summary**（首頁會議摘要）已做；**Latest**（最新會議：3 條決議重點）還沒做。重點決議的內容是灰色，和首頁公告卡一致 |
| `Meeting/Point` | `meeting/MeetingPoint.vue` | ⬜ | 決議重點的一條：勾選圖示＋文字 |
| `Meeting/Head` | `meeting/MeetingHead.vue` | ✅ | 會議紀錄頁首：「社區管理委員會」、會議名稱、日期（含星期）、出席人數。傳 `getMeetingById()` 回傳的 `meeting`。住戶端會議紀錄頁在用 |
| `Meeting/Case` | `meeting/MeetingCase.vue` | ✅ | 會議全文的案由卡片：結果徽章（灰色）＋案由標題，點標題展開或收合內容。變體 State（Open／Closed）由外層的 `<Accordion>` 決定，不是 prop。要放在 `<Accordion type="multiple">` 裡面，傳 `section`（全文的一段）和 `value`。字級、標題列高度（78px）在元件裡調整過，`ui/accordion` 本身沒動。住戶端會議紀錄頁預設全部展開 |
| `Calendar/Card` | `calendar/CalendarCard.vue` | ✅ | 社區行事曆卡：從這個星期日開始的兩週日期＋公告圓點（實心＝與我有關、空心＝其他）。傳 `notices`。只顯示、不能點 |
| `Calendar/Day` | ➖ | ➖ | 行事曆的單一日期。寫在 `CalendarCard.vue` 裡面即可 |
| `Comment/Thread` | `comment/CommentThread.vue` | ✅ | 一串留言：會議名稱＋狀態徽章、我的留言，已回覆的下面接管委會回覆，待回覆的是一行灰字。變體 Status 不是 prop，看傳進來的留言有沒有回覆。傳 `comment`（`getMyComments()` 的一筆）。徽章照住戶端規則：待回覆藍、已回覆灰（設計稿是待回覆橘、已回覆藍） |
| `Comment/Bubble` | `comment/CommentBubble.vue` | ✅ | 一則留言：「我的留言・9/30 14:20」＋內容。變體 From 用 `from` 切換：`mine` 淺灰底、`reply` 淺藍底（寫「管委會回覆」，不顯示委員姓名）。傳 `at`、`text` |
| `Message/Sheet Content` | `message/MessageSheetContent.vue` | ✅ | 「留言給管委會」的底部抽屜，外層的 `ui/drawer` 已經包在元件裡，用 `v-model:open` 控制開關。變體 State 用 `sent` 切換：`false` 輸入中、`true` 送出成功。傳 `meetingTitle`、`maxLength`、`pending`、`myCommentsPath`；按「確認送出」送出 `submit`（帶留言內容），真的送出是頁面的工作。拖曳把手照設計稿改成 40px 寬，`ui/drawer` 本身沒動 |

### D. 社區檔案

| Kit 元件 | 程式檔案 | 狀態 | 備註 |
|---|---|---|---|
| `Archive/Doc Card` | `archive/ArchiveDocCard.vue` | ⬜ | 公開文件卡：圖示方塊＋標題＋狀態徽章與日期 |
| `Archive/Icon Tile` | ➖ | ➖ | 和 `Common/Icon Tile` 重複，見[第 5 節](#5-需要跟設計確認的事)。程式只做一個 `common/IconTile.vue` |
| `Archive/History Record` | `archive/ArchiveHistoryRecord.vue` | ✅ | 設備維修史的一筆：日期＋項目＋徽章（2026-10-16）。傳 `date`（'2026-09-10'，顯示完整年月日，設計稿只有月/日但紀錄會跨年）、`title`、`label`（徽章的字，住戶端放「保養／維修」）。住戶端「設備與維修史」在用 |
| `Archive/Search Result Bar` | `archive/ArchiveSearchResultBar.vue` | ✅ | 內文搜尋結果列：「第 X／Y 處符合「關鍵字」」＋上一處／下一處（44px 的圓形按鈕）。傳 `keyword`、`current`、`total`，按鈕送出 `prev`、`next`。住戶端會議紀錄的全文搜尋在用；搜到的字怎麼標出來在 `meeting/MeetingHighlight.vue` |
| `Timeline/Month` | `timeline/TimelineMonth.vue` | ⬜ | 社區時間軸的月份分組列，可展開收合 |
| `Timeline/Entry` | `timeline/TimelineEntry.vue` | ⬜ | 社區時間軸的一筆事件 |
| `Rule/Article` | `rule/RuleArticle.vue` | ⬜ | 社區規約的一條條文 |

### E. 回饋與提示

| Kit 元件 | 程式檔案 | 狀態 | 備註 |
|---|---|---|---|
| `Feedback/Empty State` | `feedback/FeedbackEmptyState.vue` | ⬜ | 空狀態：圖示＋標題＋說明＋按鈕。變體 Container：Plain／Card。可以用基礎元件 `ui/empty` 當底。住戶端「我的通報」（Plain）和「社區公告」（Card）的空狀態先直接用 `ui/empty`＋吉祥物寫在頁面裡，做這個元件時再換過來 |
| `Feedback/Haobi Tip` | `feedback/FeedbackHaobiTip.vue` | 🟡 | 好彼管家提示框：頭像＋「好彼管家」＋主訊息（`title`）＋補充說明（`description`，選填）。頭像是思考的好彼管家（`assets/mascot/thinking.png`，原圖 1）。Kit 的「可加 Badge」還沒做 |
| （Kit 沒有）狀態畫面 | `feedback/FeedbackState.vue` | 🟡 | 整頁的狀態（2026-10-18 013）：`kind` 選 `load-failed`（載入失敗＋「重新整理」，送出 `retry`）／`not-found`（找不到資料）／`page-not-found`（網址打錯，`NotFoundView` 在用）／`no-permission`（沒有權限）／`coming-soon`（功能準備中，佔位頁 `PlaceholderView` 在用），除了載入失敗都是「回首頁」（回目前這一端）。吉祥物是拿放大鏡那隻，功能準備中是開心那隻（`happy.png`），上方空白和住戶端通知的空狀態一樣。展示在 `/playground` 的「狀態畫面」，頁面還沒套上 |
| （Kit 沒有）同時操作衝突 | `feedback/FeedbackConflictDialog.vue` | 🟡 | 「這筆資料剛剛有人改過了」彈窗：`description` 寫誰、什麼時候改了，只有「重新整理」（送出 `refresh`）。頁面還沒套上 |
| （Kit 沒有）權限被拒 | `feedback/FeedbackPermissionDialog.vue` | 🟡 | 相機（多一顆「改從相簿選照片」，送出 `use-photos`）、相簿、通知被拒時，教使用者到手機「設定」打開，iPhone、Android 各一行。`add-to-home` 教使用者加入主畫面 |
| （Kit 沒有）開啟通知提醒 | `feedback/NotificationReminder.vue` | 🟡 | 三端首頁最上面，還沒開通知就一直出現、不擋（2026-10-18 013）。「先不要」藏到這次關掉 App（sessionStorage）；拒絕過時，按「開啟通知」跳出權限被拒的彈窗。iPhone 用 Safari 開（沒有通知功能）時，改成「加入主畫面，才收得到通知」＋「怎麼加入」（2026-10-19，suzy 在 #144 提的） |
| （Kit 沒有）測試模式橫幅 | `app/MockFailBanner.vue` | ✅ | `/playground`「狀態畫面」的「模擬連線失敗」開著時，頂部列下面一條橘色橫幅「測試模式：正在模擬連線失敗，點這裡關閉」，點了回 playground 關掉（2026-10-19，suzy 在 #144 提的），接在 `AppShell` |
| （Kit 沒有）離線橫幅 | `app/OfflineBanner.vue` | ✅ | 沒有網路時，頂部列下面一條深灰色橫幅，已經接在 `AppShell`，每一頁都有 |
| `Feedback/Toast` | ➖ | ➖ | 用基礎元件 `ui/sonner`（`toast('訊息')`）。樣式和 Kit 不同時調整 sonner，不另外做元件 |
| `Feedback/Dialog Header` | ➖ | ➖ | 用基礎元件 dialog 的標題（`DialogTitle`）。用法見 `notice/NoticeDetailDialog.vue` |
| `Feedback/Dialog Actions` | ➖ | ➖ | 用基礎元件 dialog 的按鈕區。關閉用的按鈕用 `DialogClose` 包起來 |
| `Feedback/Modal Backdrop` | ➖ | ➖ | 基礎元件 dialog、drawer、sheet 已經內建半透明背景 |
| `Notification/Item` | `notification/NotificationItem.vue` | ⬜ | 通知的一筆。變體 Type：留言回覆／報修進度／公告；State：未讀／已讀 |
| `Common/Icon Tile` | `common/IconTile.vue` | ✅ | 圖示方塊。變體 Style 用 `variant` prop 切換：`soft`（預設）／`square`（不叫 `style`，會和 HTML 的 style 屬性撞名）。圖示用 slot 放進去：`<IconTile><UsersIcon /></IconTile>` |
| `Common/Separator` | ➖ | ➖ | 用基礎元件 `ui/separator` |
| `Form/Radio Option` | `form/FormRadioOption.vue` | ⬜ | 整塊可點的單選項。可以用基礎元件 `ui/radio-group` 當底 |

### F. 管委會卡片（Admin/）

放在 `src/components/admin/`。管委會端和管理人員端共用。Kit 的說明寫明這一區的卡片樣式和住戶端相同：`rounded-xl`、`p-4`、內部間距 `gap-3`、`shadow-card`。

| Kit 元件 | 程式檔案 | 狀態 | 備註 |
|---|---|---|---|
| `Admin/Todo Card` | `admin/AdminTodoCard.vue` | ✅ | 待辦卡。傳 `getMyTodos()` 的一筆 `todo` 進去。變體 Type 只做「一般」：只有公告能標示緊急，待辦不會有（2026-10-16 拿掉淺紅底色）；期限徽章和 Kit 不同，見[第 4 節](#4-kit-和程式不一樣的地方)。左上角的建立日期要等 `getMyTodos()` 帶出 `createdAt` 才會顯示 |
| `Admin/Notice Card` | `admin/AdminNoticeCard.vue` | ✅ | 變體 Type 沒有做成 prop：傳 `announcement`（`getManagedAnnouncements()` 的一筆）是公告，傳 `opinion`（`getResidentOpinions()` 的一筆）是住戶意見。住戶意見的標題用留言所在的會議名稱 |
| `Admin/Action Card` | `admin/AdminActionCard.vue` | 🟡 | 「我的待辦」的卡片，傳 `getMyTodos()` 的一筆 `todo`；也可以傳 `getMyDoneTodos()` 的一筆（有 `doneAt`），會變成灰色「已完成」、寫完成時間、右下角「查看詳情」。變體 Footer 只做了「連結」：整張卡可以點，右下角「前往完成 ›」只是提示（2026-10-13 從滿版藍色按鈕改過來，卡片變短，也不會整頁都是主要按鈕）；「按鈕」「文字」還沒做，有頁面用到再加。期限徽章和 `AdminTodoCard` 一樣（沒有緊急底色），規則在 `src/lib/todo.js` |
| `Admin/Meeting Card` | `admin/AdminMeetingCard.vue` | ⬜ | 變體 State：待整理／待發布／已發布 |
| `Admin/Vendor Card` | `admin/AdminVendorCard.vue` | ✅ | 廠商卡：名稱＋合約徽章＋›、處理項目的小標籤。整張卡可以點。合約徽章：無合約紅；即將到期橘；尚未生效藍；合約內灰。管委會端「廠商名冊」在用 |
| `Admin/Case Card` | `admin/AdminCaseCard.vue` | ✅ | 案件卡：標題＋狀態徽章＋›、地點徽章、一行說明（2026-10-14 照 Kit 改版；2026-10-16 第三行從「負責人｜廠商」改成和待辦卡同一套的一句說明，假 API 算好的 `hint`，規則在 `docs/data-model.md`「我的待辦」）。整張卡可以點。狀態徽章：逾期、尚未受理紅；待結案橘；處理中（已受理、處理中）藍；已結案、已取消灰（規則在 `admin/caseStatusBadge.js`，案件詳情頁共用）。prop 叫 `item`（`case` 是 JavaScript 的保留字）。管委會端「案件」分頁在用 |
| `Admin/Contract Card` | `admin/AdminContractCard.vue` | ✅ | 合約卡（2026-10-16）：廠商名稱＋狀態徽章、合約期間、合約金額、負責窗口，右下「查看詳情 ›」，整張卡可以點。傳 `getContracts()` 的一筆 `item`、`contactName`、`to`。合約金額只有管委會看得到，沒有 `amount` 時那一列不顯示（管理人員端可以直接用）。狀態徽章的規則在 `admin/contractBadge.js`（即將到期橘、尚未生效藍、合約內和已到期灰），合約詳情、廠商詳細共用。管委會端「廠商合約」在用 |
| `Admin/Doc Card` | `admin/AdminDocCard.vue` | ⬜ | 文件卡 |
| `Admin/Notification Item` | `admin/AdminNotificationItem.vue` | ⬜ | 通知的一筆。做之前先看能不能和 `Notification/Item` 共用 |
| `Admin/Equipment Row` | `admin/AdminEquipmentRow.vue` | ✅ | 設備的一列（2026-10-16）：左邊類別圖示（設計稿是設備照片，假資料沒有照片）、名稱＋狀態徽章、位置｜廠商，右邊 ›，整列可以點。傳 `getEquipmentList()` 的一筆 `item` 和 `to`。狀態徽章的規則在 `admin/equipmentStatusBadge.js`（待維修、保養逾期紅；保養將到期橘；維修中藍；正常、已報廢灰），設備詳情共用。管委會端、管理人員端「設備清冊」在用 |

---

## 3. 基礎元件（shadcn-vue）

Kit 裡每個基礎元件各有一頁，對應 `src/components/ui/` 裡的資料夾。用法都一樣：

```js
import { Button } from '@/components/ui/button'
```

還沒加進專案的，用到時執行 `npx shadcn-vue@latest add <名稱>`，並單獨開一個 PR。

| Kit 的頁面 | 程式 | 狀態 | 備註 |
|---|---|---|---|
| Avatar | `ui/avatar` | ✅ | |
| Badge | `ui/badge` | ✅ | **已依 Kit 調整**：高 22px、三種顏色。用法見 [dev-guide.md 第 5 節](dev-guide.md#徽章badge) |
| Button | `ui/button` | ✅ | **已調整**：預設高度放大到 44px |
| Card | `ui/card` | ✅ | 圓角目前是 20px，和 Kit 的 14px 不同，見 [dev-guide.md 第 8 節](dev-guide.md#8-尚未定案的事)。產品元件的卡片目前是直接用 class 寫，沒有用這個 |
| Drawer | `ui/drawer` | ✅ | |
| Field | `ui/field` | ✅ | 表單欄位的外框：名稱＋輸入框＋說明 |
| Input | `ui/input` | ✅ | **已調整**：高度放大到 44px |
| Item | `ui/item` | ✅ | |
| Radio Group | `ui/radio-group` | ✅ | |
| Seperator | `ui/separator` | ✅ | Kit 的頁面名稱拼錯了，程式用正確的拼法 separator |
| Tabs | `ui/tabs` | ✅ | |
| Textarea | `ui/textarea` | ✅ | |
| Accordion | `ui/accordion` | ✅ | 2026-10-14 加入，還是 shadcn-vue 原本的樣子（字是 14px），還沒照 Kit 調整。`Meeting/Case`、`Timeline/Month` 會用到，做這兩個元件時在元件裡調整字級和外框。示範在 `/playground` 的「清單」區 |
| Alert | `alert` | ✅ | 2026-10-13 加入。已照 Kit 調整：說明的字是深色；字級照專案放大成 16px（Kit 是 14px）。圖示直接放在 `<Alert>` 裡的第一個位置。提案與簽核的「法定效力說明」、管委會首頁的「換屆交接提示」會用到 |
| Calendar | `common/DatePicker.vue` | 🟡 | 2026-10-15：Kit 還沒有 Date Picker，照設計稿「新增交辦」的完成期限（1134:14034）自己做，沒有用 shadcn 的 `calendar`。按鈕（日曆圖示＋文字）點了跳出月曆，值是 `'2026-10-12'` 字串，可以傳 `min`、`max`。管委會的發布公告在用。時間用 `common/TimePicker.vue`（Kit、shadcn 都沒有時間選擇器，照 DatePicker 的樣子做）：按鈕點了跳出「時」「分」兩欄，分鐘每 5 分一格，值是 `'14:30'` 字串。不用瀏覽器內建的 `type="time"`，因為跳出來的滾輪是手機畫的，樣式改不了 |
| Checkbox | `checkbox` | ⬜ | |
| Combobox | `ui/combobox` | ✅ | 要打字搜尋的選單才用。只是點選的下拉選單用 `select`（見下方），選項的樣子照 Kit 這一頁的「Combobox Item」：文字＋右邊打勾。2026-10-15 加：用 `npx shadcn-vue add combobox` 會失敗（它要的 `input-group` 轉成 JavaScript 時出錯），所以照 shadcn-vue 的寫法手動建，底層是 reka-ui 的 Combobox。案件詳情的「關聯設備」（`case/CaseEquipmentPicker`）在用，照 shadcn Figma（Combobox 頁）的「Basic」＋「Clear Button」：框本身就是輸入框，點了往下展開、打字就篩選，右邊 ✕ 清掉打的字、箭頭展開收起 |
| Dialog | `dialog` | ✅ | 2026-10-12 加入。公告詳情彈窗、各種確認彈窗在用 |
| Native Select | `native-select` | ⬜ | |
| Toggle & Toggle Group | `toggle`、`toggle-group` | ✅ | 2026-10-12 加入。篩選標籤用 `toggle-group` 當底，包成 `common/FilterChips.vue`（2026-10-13，樣式在那裡調，`ui/` 沒改），規則見 [dev-guide.md 第 5 節](dev-guide.md#篩選篩選標籤下拉選單) |
| Kbd | ➖ | ➖ | 顯示鍵盤按鍵用的，手機版用不到 |

專案裡有、但 Kit 沒有獨立頁面的基礎元件：`empty`、`label`、`progress`、`select`、`sheet`、`skeleton`、`slider`、`sonner`、`spinner`、`stepper`。

`select`（2026-10-12 加入）：點選的下拉選單，例如排序。Kit 的下拉選項在 Combobox 頁；選項預設高 28px，用的時候要放大到 44px、字 16px。篩選的下拉（選項 5 個以上）用包好的 `common/FilterSelect.vue`（2026-10-13，膠囊按鈕）；排序用 `common/SortSelect.vue`（2026-10-14，灰色小字、靠右）。兩個都已經放大好了，不用自己調。規則見 dev-guide 第 5 節「篩選」。表單裡的下拉（輸入框的樣子，白底外框、高 44px）直接用 `select`：新增交辦的「關聯案件」、案件詳情的「問題分類」（`case/CaseCategoryPicker`，2026-10-17）。

**圖示**：Kit 有 Lucide、Tabler、HugeIcons 三套圖示的頁面，程式只裝了 Lucide（`@lucide/vue`）。設計稿上的圖示如果在 Lucide 找不到，先跟對方確認，不要另外安裝第二套。

---

## 4. Kit 和程式不一樣的地方

這些是刻意的，不是錯誤。

| 項目 | Kit | 程式 | 為什麼 |
|---|---|---|---|
| 內文字級 | 14px | 16px（`type-body`） | 為了長輩閱讀，團隊決定放大 |
| 底部導覽列 | 住戶端和管委會端是兩個元件 | 同一個 `BottomNav.vue` | 分頁由 `roles.js` 決定，不用做兩份 |
| `App/Nav Item`、`App/FAB` | 獨立的元件 | 寫在 `BottomNav.vue` 裡面 | 只有導覽列會用到 |
| 文字屬性 | 每段文字一個屬性 | 傳一整筆資料 | 見[第 1 節](#1-怎麼讀這份表) |
| Admin/ 的屬性名稱 | 中文（標題、說明） | 英文 | 程式的命名一律用英文 |
| 半透明背景、提示訊息 | 自己畫的元件 | 用 shadcn-vue 內建的 | 內建的已經處理好動畫和鍵盤操作 |
| `Admin/Todo Card` 的期限 | 「緊急」是紅色徽章、「一般」是灰字 | 一律用徽章，照 [dev-guide.md 第 5 節](dev-guide.md#徽章badge)管理端的顏色：逾期、今日到期紅色，剩餘 N 天橘色 | 同一個狀態只用一種顏色 |
| `Admin/Todo Card` 的緊急 | 用紅色徽章標示 | 不做（2026-10-16） | 只有公告能標示緊急，待辦不會有緊急的；Kit 的「緊急」變體可以拿掉 |

---

## 5. 需要跟設計確認的事

讀 Kit 時發現的問題。我們兩個都有參與設計，可以直接在 Kit 修正；修正後把那一項從這裡刪掉。

| 問題 | 說明 |
|---|---|
| `App/Message` 的說明是錯的 | 它的說明文字和 `App/FAB` 一模一樣（「右下角『通報』浮動按鈕」），應該是複製時沒改。實際用途是會議紀錄頁右下角的「留言」按鈕（2026-10-14 確認），Kit 的說明要改 |
| 圖示方塊有兩個 | `Archive/Icon Tile` 和 `Common/Icon Tile` 功能重複。而且 `Archive/Icon Tile` 放在「02 產品元件」區塊外面，說明寫 40×40 但實際高度是 20。建議只留 `Common/Icon Tile` |
| 通知項目有兩個 | `Notification/Item`（住戶端）和 `Admin/Notification Item`（管委會端）。要確認是否真的需要兩種樣式 |
| 名稱裡有中文 | `App/Bottom Nav 管委會`、`App/Bottom CTA 三按鈕`。其他元件都是英文，建議改成變體（例如 `App/Bottom Nav` 加一個 Role 變體） |
| 變體的值中英混用 | `Report/Card` 是 Compact／Full／Empty，`Comment/Bubble` 是「我的留言／管委會回覆」，`Admin/` 全部是中文 |
| 「報修」和「通報」混用 | `Notification/Item` 的變體有「報修進度」，其他地方都叫「通報」 |
| 頁面名稱拼錯 | 基礎元件的 Seperator 應為 Separator |
| 有些元件沒有說明 | `App/Drawer Content`、`App/Menu Item`、`App/Bottom CTA 三按鈕`、`Comment/` 兩個、`Message/Sheet Content`、`Calendar/Day`、`Notification/Item`、`Common/` 兩個、`Form/Radio Option`、`Feedback/Toast` 與 Dialog 三個、`Admin/Notification Item`、`Admin/Equipment Row` |
| Admin/ 的說明都一樣 | 8 個卡片的說明是同一段樣式描述，沒有寫各自的用途 |
