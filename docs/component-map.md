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
| `App/Header` | `app/AppHeader.vue` | 🟡 | 變體 Type：**Brand**（首頁品牌列）已做；**Page**（內頁：返回＋置中標題＋右側按鈕）還沒做。做第一個內頁時就會需要 |
| `App/Bottom Nav` | `app/BottomNav.vue` | ✅ | 住戶端 3 個分頁 |
| `App/Bottom Nav 管委會` | `app/BottomNav.vue` | 🟡 | 和上面是同一個檔案，分頁由 `roles.js` 傳入。5 個分頁的版本能用，但還沒對照 Kit 的樣式，「社區檔案」也還沒改名為「社區」 |
| `App/Nav Item` | ➖ | ➖ | 寫在 `BottomNav.vue` 裡面，沒有拆出來 |
| `App/FAB` | ➖ | ➖ | 寫在 `BottomNav.vue` 裡面，沒有拆出來 |
| `App/Greeting` | `app/AppGreeting.vue` | ✅ | |
| `App/Section Header` | `app/SectionHeader.vue` | ✅ | 沒傳 `to` 就不顯示「看全部」 |
| `App/Bottom CTA` | `app/BottomCta.vue` | ⬜ | 畫面底部固定的主要按鈕區，可加一行輔助說明、可加第二個按鈕 |
| `App/Bottom CTA 三按鈕` | `app/BottomCta.vue` | ⬜ | 做成同一個檔案，用 props 決定幾個按鈕 |
| `App/Drawer Content` | `app/DrawerContent.vue` | ⬜ | 從底部滑出的面板內容。外層用基礎元件 `ui/drawer` |
| `App/Menu Item` | `app/MenuItem.vue` | ⬜ | 選單的一列：圖示＋文字。「全域新增選單」會用到 |
| `App/Message` | `app/AppMessage.vue` | ⬜ | 用途待確認，見[第 5 節](#5-需要跟設計確認的事) |
| `_Drawer Slot` | ➖ | ➖ | 底線開頭是 Kit 內部用的零件，程式不用做 |

### B. 通報相關（Report/）

放在 `src/components/report/`。

| Kit 元件 | 程式檔案 | 狀態 | 備註 |
|---|---|---|---|
| `Report/Card` | `report/ReportCard.vue` | 🟡 | 變體 Type：**Compact**（首頁摘要）、**Empty**（目前無通報）已做；**Full**（我的通報列表：送出日期＋管委會回覆＋動作）還沒做 |
| `Report/Summary` | `report/ReportSummary.vue` | ⬜ | 通報摘要卡。變體 Visibility：Public／Private（Private 加註「僅你本人與管委會可見」） |
| `Report/Progress Card` | `report/ReportProgressCard.vue` | ⬜ | 「處理進度」卡片，裡面用到下面三個 |
| `Report/Stepper` | `report/ReportStepper.vue` | ⬜ | 三步驟進度條。變體 Current：1／2／3。可以用基礎元件 `ui/stepper` 當底 |
| `Report/Step` | ➖ | ➖ | 進度條的單一圓點（Done／Current／Todo）。寫在 `ReportStepper.vue` 裡面即可 |
| `Report/Record` | `report/ReportRecord.vue` | ⬜ | 處理紀錄的一筆。變體 State：Past／Latest（最新一筆是深色粗體） |
| `Report/Similar Card` | `report/ReportSimilarCard.vue` | ⬜ | 相似通報卡。變體 Type：Similar（可按「我也遇到了」）／Joined（已加入） |
| `Report/Flow Progress` | `report/ReportFlowProgress.vue` | ⬜ | 新增通報流程頂部的進度。變體 Step：1～5。進度條用基礎元件 `ui/progress` |
| `Report/Review Row` | `report/ReportReviewRow.vue` | ⬜ | 確認送出頁的一列：欄位名稱＋值＋「修改」按鈕 |
| `Report/Photo Tile` | `report/ReportPhotoTile.vue` | ⬜ | 照片格。變體 Type：Preview／Add／Thumbnail；Size：Large／Small |

### C. 公告與會議

這一區有五種分類，各放各的資料夾。

| Kit 元件 | 程式檔案 | 狀態 | 備註 |
|---|---|---|---|
| `Notice/Home Card` | `notice/NoticeHomeCard.vue` | ✅ | 首頁的社區公告卡 |
| `Notice/Card` | `notice/NoticeCard.vue` | ⬜ | 社區公告頁的完整公告卡 |
| `Meeting/Card` | `meeting/MeetingCard.vue` | 🟡 | 變體 Type：**Summary**（首頁會議摘要）已做；**Latest**（最新會議：3 條決議重點）還沒做 |
| `Meeting/Point` | `meeting/MeetingPoint.vue` | ⬜ | 決議重點的一條：勾選圖示＋文字 |
| `Meeting/Head` | `meeting/MeetingHead.vue` | ⬜ | 會議紀錄頁首：主辦機關、標題、日期、出席 |
| `Meeting/Case` | `meeting/MeetingCase.vue` | ⬜ | 會議全文的案由，可展開收合。變體 State：Open／Closed。需要先加基礎元件 accordion |
| `Calendar/Card` | `calendar/CalendarCard.vue` | ⬜ | 社區行事曆卡：兩週日期＋活動圓點 |
| `Calendar/Day` | ➖ | ➖ | 行事曆的單一日期。寫在 `CalendarCard.vue` 裡面即可 |
| `Comment/Thread` | `comment/CommentThread.vue` | ⬜ | 一串留言。變體 Status：已回覆／待回覆 |
| `Comment/Bubble` | `comment/CommentBubble.vue` | ⬜ | 一則留言。變體 From：我的留言／管委會回覆 |
| `Message/Sheet Content` | `message/MessageSheetContent.vue` | ⬜ | 對會議留言的輸入面板。變體 State：輸入中／送出成功。外層用基礎元件 `ui/sheet` 或 `ui/drawer` |

### D. 社區檔案

| Kit 元件 | 程式檔案 | 狀態 | 備註 |
|---|---|---|---|
| `Archive/Doc Card` | `archive/ArchiveDocCard.vue` | ⬜ | 公開文件卡：圖示方塊＋標題＋狀態徽章與日期 |
| `Archive/Icon Tile` | ➖ | ➖ | 和 `Common/Icon Tile` 重複，見[第 5 節](#5-需要跟設計確認的事)。程式只做一個 `common/IconTile.vue` |
| `Archive/History Record` | `archive/ArchiveHistoryRecord.vue` | ⬜ | 設備維修史的一筆：日期＋項目＋狀態徽章 |
| `Archive/Search Result Bar` | `archive/ArchiveSearchResultBar.vue` | ⬜ | 內文搜尋結果列：「第 X／Y 處符合」＋上一處／下一處 |
| `Timeline/Month` | `timeline/TimelineMonth.vue` | ⬜ | 社區時間軸的月份分組列，可展開收合 |
| `Timeline/Entry` | `timeline/TimelineEntry.vue` | ⬜ | 社區時間軸的一筆事件 |
| `Rule/Article` | `rule/RuleArticle.vue` | ⬜ | 社區規約的一條條文 |

### E. 回饋與提示

| Kit 元件 | 程式檔案 | 狀態 | 備註 |
|---|---|---|---|
| `Feedback/Empty State` | `feedback/FeedbackEmptyState.vue` | ⬜ | 空狀態：圖示＋標題＋說明＋按鈕。變體 Container：Plain／Card。可以用基礎元件 `ui/empty` 當底 |
| `Feedback/Haobi Tip` | `feedback/FeedbackHaobiTip.vue` | ⬜ | 好彼管家提示框：頭像＋標籤＋訊息 |
| `Feedback/Toast` | ➖ | ➖ | 用基礎元件 `ui/sonner`（`toast('訊息')`）。樣式和 Kit 不同時調整 sonner，不另外做元件 |
| `Feedback/Dialog Header` | ➖ | ➖ | 用基礎元件 dialog 的標題，需要先加 dialog |
| `Feedback/Dialog Actions` | ➖ | ➖ | 用基礎元件 dialog 的按鈕區 |
| `Feedback/Modal Backdrop` | ➖ | ➖ | 基礎元件 dialog、drawer、sheet 已經內建半透明背景 |
| `Notification/Item` | `notification/NotificationItem.vue` | ⬜ | 通知的一筆。變體 Type：留言回覆／報修進度／公告；State：未讀／已讀 |
| `Common/Icon Tile` | `common/IconTile.vue` | ⬜ | 圖示方塊。變體 Style：Soft／Square |
| `Common/Separator` | ➖ | ➖ | 用基礎元件 `ui/separator` |
| `Form/Radio Option` | `form/FormRadioOption.vue` | ⬜ | 整塊可點的單選項。可以用基礎元件 `ui/radio-group` 當底 |

### F. 管委會卡片（Admin/）

放在 `src/components/admin/`。管委會端和管理人員端共用。Kit 的說明寫明這一區的卡片樣式和住戶端相同：`rounded-xl`、`p-4`、內部間距 `gap-3`、`shadow-card`。

| Kit 元件 | 程式檔案 | 狀態 | 備註 |
|---|---|---|---|
| `Admin/Todo Card` | `admin/AdminTodoCard.vue` | ⬜ | 待辦卡。變體 Type：緊急／一般 |
| `Admin/Notice Card` | `admin/AdminNoticeCard.vue` | ⬜ | 變體 Type：公告／住戶意見 |
| `Admin/Action Card` | `admin/AdminActionCard.vue` | ⬜ | 變體 Footer：按鈕／文字 |
| `Admin/Meeting Card` | `admin/AdminMeetingCard.vue` | ⬜ | 變體 State：待整理／待發布／已發布 |
| `Admin/Vendor Card` | `admin/AdminVendorCard.vue` | ⬜ | 廠商卡 |
| `Admin/Case Card` | `admin/AdminCaseCard.vue` | ⬜ | 案件卡 |
| `Admin/Contract Card` | `admin/AdminContractCard.vue` | ⬜ | 合約卡。合約金額只有管委會看得到，管理人員端要能正常顯示沒有金額的樣子 |
| `Admin/Doc Card` | `admin/AdminDocCard.vue` | ⬜ | 文件卡 |
| `Admin/Notification Item` | `admin/AdminNotificationItem.vue` | ⬜ | 通知的一筆。做之前先看能不能和 `Notification/Item` 共用 |
| `Admin/Equipment Row` | `admin/AdminEquipmentRow.vue` | ⬜ | 設備的一列：名稱、位置與廠商、保養資訊 |

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
| Accordion | `accordion` | ⬜ | `Meeting/Case`、`Timeline/Month` 會用到 |
| Alert | `alert` | ⬜ | |
| Calendar | `calendar` | ⬜ | |
| Checkbox | `checkbox` | ⬜ | |
| Combobox | `combobox` | ⬜ | |
| Dialog | `dialog` | ⬜ | `Feedback/Dialog Header`、`Dialog Actions` 會用到 |
| Native Select | `native-select` | ⬜ | |
| Toggle & Toggle Group | `toggle`、`toggle-group` | ⬜ | |
| Kbd | ➖ | ➖ | 顯示鍵盤按鍵用的，手機版用不到 |

專案裡有、但 Kit 沒有獨立頁面的基礎元件：`empty`、`label`、`progress`、`sheet`、`skeleton`、`slider`、`sonner`、`spinner`、`stepper`。

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

---

## 5. 需要跟設計確認的事

讀 Kit 時發現的問題。我們兩個都有參與設計，可以直接在 Kit 修正；修正後把那一項從這裡刪掉。

| 問題 | 說明 |
|---|---|
| `App/Message` 的說明是錯的 | 它的說明文字和 `App/FAB` 一模一樣（「右下角『通報』浮動按鈕」），應該是複製時沒改。要確認這個元件實際的用途 |
| 圖示方塊有兩個 | `Archive/Icon Tile` 和 `Common/Icon Tile` 功能重複。而且 `Archive/Icon Tile` 放在「02 產品元件」區塊外面，說明寫 40×40 但實際高度是 20。建議只留 `Common/Icon Tile` |
| 通知項目有兩個 | `Notification/Item`（住戶端）和 `Admin/Notification Item`（管委會端）。要確認是否真的需要兩種樣式 |
| 名稱裡有中文 | `App/Bottom Nav 管委會`、`App/Bottom CTA 三按鈕`。其他元件都是英文，建議改成變體（例如 `App/Bottom Nav` 加一個 Role 變體） |
| 變體的值中英混用 | `Report/Card` 是 Compact／Full／Empty，`Comment/Bubble` 是「我的留言／管委會回覆」，`Admin/` 全部是中文 |
| 「報修」和「通報」混用 | `Notification/Item` 的變體有「報修進度」，其他地方都叫「通報」 |
| 頁面名稱拼錯 | 基礎元件的 Seperator 應為 Separator |
| 有些元件沒有說明 | `App/Drawer Content`、`App/Menu Item`、`App/Bottom CTA 三按鈕`、`Comment/` 兩個、`Message/Sheet Content`、`Calendar/Day`、`Notification/Item`、`Common/` 兩個、`Form/Radio Option`、`Feedback/Toast` 與 Dialog 三個、`Admin/Notification Item`、`Admin/Equipment Row` |
| Admin/ 的說明都一樣 | 8 個卡片的說明是同一段樣式描述，沒有寫各自的用途 |
| 還缺的元件 | 篩選標籤（設計稿有 6 處借用 Button 手動調整） |
