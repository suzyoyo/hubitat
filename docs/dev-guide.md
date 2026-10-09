# 好彼社區 Hubitat — 開發規範

兩個人一起寫程式時共同遵守的約定。目的只有一個：**不管誰寫的頁面，打開來長得都像同一個人寫的**，對方接手時不用重新猜。

每條規則後面都會寫「為什麼」。如果覺得某條規則不合理，先討論、改這份文件，再改程式。

相關文件：

- 假資料的完整規劃：[data-model.md](data-model.md)
- shadcn-vue 的用法筆記：[shadcn-vue-notes.md](shadcn-vue-notes.md)
- 分工、分支與 PR 怎麼操作：[git-workflow.md](git-workflow.md)
- Kit 元件與程式元件對照：`component-map.md`（尚未撰寫）

## 目錄

1. [開始之前](#1-開始之前)
2. [資料夾地圖](#2-資料夾地圖)
3. [命名規則](#3-命名規則)
4. [寫一個新頁面的步驟](#4-寫一個新頁面的步驟)
5. [樣式規則](#5-樣式規則)
6. [拿資料的規則](#6-拿資料的規則)
7. [不要做的事](#7-不要做的事)
8. [尚未定案的事](#8-尚未定案的事)

---

## 1. 開始之前

### 需要先裝好的東西

| 工具 | 用途 | 怎麼確認裝好了 |
|---|---|---|
| Node.js（20.19 以上，或 22.12 以上） | 執行開發工具 | 終端機輸入 `node -v` 會顯示版本 |
| Git | 版本控制 | 終端機輸入 `git --version` |
| VS Code | 寫程式的編輯器 | — |
| VS Code 擴充套件「Vue - Official」 | 讓編輯器看得懂 `.vue` 檔 | 用 VS Code 打開專案時，右下角會跳出安裝建議，按安裝 |

Node.js 版本太舊的話 `npm run dev` 會直接報錯，到 [nodejs.org](https://nodejs.org) 下載 LTS 版重裝即可。

### 第一次把專案抓下來

```bash
git clone https://github.com/suzyoyo/hubitat.git
```

```bash
cd hubitat
```

```bash
npm install
```

`npm install` 會依照 `package.json` 把需要的套件下載到 `node_modules/`，第一次要等一兩分鐘。之後只要對方新增了套件（`package.json` 有變動），就要再跑一次。

### 每次開始工作

```bash
npm run dev
```

終端機會顯示網址 `http://localhost:5173`，用瀏覽器打開。存檔後畫面會自動更新，不用重新整理。要停止時在終端機按 `Ctrl + C`。

三個常用指令：

| 指令 | 做什麼 | 什麼時候用 |
|---|---|---|
| `npm run dev` | 啟動開發用的網站 | 每次開始寫程式 |
| `npm run build` | 把程式打包成正式版，放進 `dist/` | 交出去之前，確認沒有錯誤 |
| `npm run preview` | 用瀏覽器看打包後的結果 | 想確認正式版長什麼樣子時 |

### 用手機的寬度看

這個產品只做手機版，所以開發時瀏覽器要調成手機寬度：

1. 在 Chrome 按 `F12`（Mac 是 `Option + Command + I`）打開開發者工具
2. 按左上角的手機圖示（Mac 是 `Command + Shift + M`）
3. 上方的裝置選 iPhone 14 或寬度相近的（約 390px）

開發者工具的 **Console** 分頁會顯示錯誤訊息（紅字）。畫面怪怪的時候先看這裡。

### 認識幾個網址

| 網址 | 是什麼 |
|---|---|
| `/` | 角色選擇頁。目前沒有登入功能，從這裡選要看哪一端 |
| `/resident` | 住戶端 |
| `/committee` | 管委會端 |
| `/staff` | 管理人員端 |
| `/playground` | 元件盤點頁，只有開發時用，使用者看不到入口 |

還沒做的頁面會顯示佔位頁，上面寫著頁面名稱和目前的網址。

### `/playground` 是什麼

把專案裡有的東西全部列出來的一頁，寫畫面之前先來這裡找有沒有現成的可以用：

- **最上面「設計 Token」**：所有顏色、文字樣式、圓角、陰影實際的樣子
- **中間各區**：shadcn-vue 的基礎元件（按鈕、徽章、表單、進度、清單等）
- **最下面「假資料」**：每一種假資料實際載入後的內容

新增了基礎元件，或改了 Token，記得來這裡確認沒有其他地方跟著壞掉。

### 示範用的人物

假資料裡的「我」是固定的，三端各有一個：

- **住戶端、管委會端**：李伯伯，A 棟 8 樓之 1 的住戶，同時是管委會的修繕委員
- **管理人員端**：張管理員

假資料的「今天」固定是 **2026 年 10 月 1 日**，所以畫面上的「3 天後到期」「逾期 11 天」不會隨著真實日期改變。

---

## 2. 資料夾地圖

所有程式都在 `src/` 裡面。

```
src/
├── main.js            程式的起點，通常不用動
├── App.vue            最外層，只放一個 <RouterView />，通常不用動
├── style.css          設計 Token（顏色、字級、圓角、陰影）
│
├── router/            路由：哪個網址顯示哪個畫面
│   ├── index.js         把三端的清單組合起來，平常不用改
│   └── resident.js …    每一端一份頁面清單（另有 committee.js、staff.js）
├── config/roles.js    三端的設定：底部有哪些分頁、「＋」按鈕做什麼
├── layouts/           外框（頂部列 + 底部導覽），三端共用 AppShell.vue
│
├── views/             「頁面」：一個網址對應一個檔案
│   ├── resident/        住戶端的頁面
│   ├── committee/       管委會端的頁面（做到時建立）
│   ├── staff/           管理人員端的頁面（做到時建立）
│   └── playground/      元件盤點頁 /playground 的各個區塊
│
├── components/        「元件」：會被頁面拿來用的零件
│   ├── ui/              shadcn-vue 的基礎元件（Button、Badge、Card…）
│   ├── app/             對應 Kit 的 App/：外框、問候列、區塊標題
│   ├── report/          對應 Kit 的 Report/
│   ├── notice/          對應 Kit 的 Notice/
│   └── meeting/         對應 Kit 的 Meeting/
│
├── mocks/             假資料
│   ├── data/            純資料（畫面不要直接讀這裡）
│   └── api/             假 API（畫面一律從這裡拿資料）
│
├── lib/               小工具：date.js（日期顯示）、utils.js（shadcn 用的 cn）
└── assets/            圖片：logo/、mascot/（縮小後的吉祥物）
```

### 新檔案該放哪裡

| 我要做的東西 | 放在 | 例子 |
|---|---|---|
| 一個有自己網址的畫面 | `src/views/<哪一端>/` | `src/views/resident/HomeView.vue` |
| Kit「hubitat」頁裡的產品元件 | `src/components/<Kit 的分類，小寫>/` | Kit 的 `Report/Card` → `src/components/report/ReportCard.vue` |
| shadcn 的基礎元件 | 不要手動建立，用指令加：`npx shadcn-vue@latest add <名稱>` | 會出現在 `src/components/ui/` |
| 好幾個地方都會用到的小函式 | `src/lib/` | `src/lib/date.js` |
| 新的假資料 | `src/mocks/data/` 加資料、`src/mocks/api/` 加函式，並在 `api/index.js` 匯出 | 見 [data-model.md](data-model.md) |

### 頁面和元件怎麼分

判斷方式：**它自己去拿資料嗎？**

- **頁面（view）**：自己向假 API 拿資料，決定要放哪些元件、怎麼排。
- **元件（component）**：不拿資料，只把別人傳進來的資料（props）畫出來。

例如 `HomeView.vue` 呼叫 `getMyReports()` 拿到通報，再把其中一筆傳給 `ReportCard`；`ReportCard` 完全不知道資料從哪來。

> **為什麼**：元件不拿資料，才能在任何頁面重複使用，也才能放進 `/playground` 單獨檢查。之後換成真的後端時，也只需要改頁面和假 API，元件不用動。

### 只用在一個頁面的東西，要不要拆成元件？

- Kit 裡有這個元件 → 拆，並照 Kit 命名。
- Kit 裡沒有，只是頁面裡的一小塊排版 → 先直接寫在頁面裡，不用拆。等第二個頁面也需要時再拆出來。

> **為什麼**：太早拆會多出很多只用一次的小檔案，反而難找。

---

## 3. 命名規則

### 檔案與資料夾

| 種類 | 規則 | 例子 |
|---|---|---|
| 頁面 | 大駝峰，結尾加 `View` | `HomeView.vue`、`ReportDetailView.vue` |
| 元件 | 大駝峰，至少兩個單字 | `ReportCard.vue`、`SectionHeader.vue` |
| 資料夾 | 全小寫 | `resident/`、`report/` |
| `.js` 檔 | 小駝峰 | `date.js`、`quickSaves.js` |

「大駝峰」是每個單字開頭都大寫（`ReportCard`）；「小駝峰」是第一個單字小寫（`quickSaves`）。

> **為什麼元件至少要兩個單字**：`Card`、`Header` 這種單字名稱會和 HTML 標籤或 shadcn 的基礎元件撞名，也看不出它是哪一類的卡片。

### 元件名稱：跟著 Kit 走

Kit 的元件名稱是「分類/名稱」，轉成程式時：

1. **分類** → 資料夾（小寫）
2. **分類 + 名稱** → 檔名（去掉斜線和空格）

| Kit 的名稱 | 程式的位置 |
|---|---|
| `Report/Card` | `src/components/report/ReportCard.vue` |
| `App/Section Header` | `src/components/app/SectionHeader.vue` |

分類是 `App` 而名稱已經看得出用途時，不用重複寫成 `AppSectionHeader`。

每個元件檔的第一行註解要寫出它對應 Kit 的哪個元件：

```vue
<script setup>
// 「我的通報」卡片（對應 Figma 的 Report/Card）
```

> **為什麼**：我們兩個都會看設計稿。在 Figma 看到 `Report/Card`，就能直接猜到程式在 `report/ReportCard.vue`，反過來也一樣，不用另外查表。

**Kit 元件的變體（variant）不要拆成多個檔案**，用 props 切換。例如 `Report/Card` 在 Kit 有 Compact 和 Empty 兩種，程式裡是同一個 `ReportCard.vue`：有傳 `report` 就顯示摘要，沒傳就顯示「目前無通報」。

### props（傳給元件的資料）

| 用途 | 命名 | 例子 |
|---|---|---|
| 一筆資料 | 那種資料的單數英文 | `report`、`notice`、`meeting` |
| 點了要去哪一頁 | 一律叫 `to` | `to="/resident/reports"` |
| 顯示的文字 | 說明它是什麼 | `title`、`subtitle` |

每個 prop 上面用一行註解說明要傳什麼：

```js
defineProps({
  // getMyReports() 回傳的其中一筆；不傳就顯示「目前無通報」
  report: { type: Object, default: null },
  // 點卡片要連到哪一頁
  to: { type: String, default: '' },
})
```

> **為什麼連結一律叫 `to`**：和 Vue Router 的 `<RouterLink to="...">` 同名，不用記每個元件各自的叫法。連結由頁面傳進去而不是寫死在元件裡，同一張卡片才能在三端連到不同的網址。

### 變數與函式

| 種類 | 規則 | 例子 |
|---|---|---|
| 變數、函式 | 小駝峰，用英文 | `latestReport`、`formatDate` |
| 清單 | 複數 | `reports`、`meetings` |
| 是或否 | 形容詞或 `is` 開頭 | `loading`、`isOpen` |
| 不會變的對照表、固定值 | 全大寫加底線 | `MOCK_TODAY`、`CASE_STATUSES` |
| 假 API 的函式 | `get` 開頭 | `getVendors`、`getCaseById`、`getMyReports` |
| 圖示 | 結尾是 `Icon`，從 `@lucide/vue` 匯入 | `ChevronRightIcon` |

### 網址（路由）

- 全小寫英文，三端的開頭固定是 `/resident`、`/committee`、`/staff`
- 清單頁用複數：`/resident/reports`
- 詳情頁在清單後面加 `:id`：`/resident/reports/:id`
- 「新增」用單數或動作：`/resident/report`（新增通報）

底部分頁的網址（`home`、`cases`、`vendors`、`files`、`me`）定義在 `src/config/roles.js`，不要在別處另外寫。

---

## 4. 寫一個新頁面的步驟

以住戶端首頁（[`src/views/resident/HomeView.vue`](../src/views/resident/HomeView.vue)）當範例。做新頁面時把它開在旁邊對照。

### 步驟 1：建立頁面檔

在對應那一端的資料夾建立檔案，先放最少的內容，確認路由通了再往下做：

```vue
<script setup>
// 住戶端・我的通報：列出我通報過的所有問題
</script>

<template>
  <div class="px-5 pt-5">
    <p>我的通報</p>
  </div>
</template>
```

- 第一行註解寫「哪一端・哪一頁：這頁在做什麼」。
- 不用自己寫頂部列和底部導覽，外框（`AppShell.vue`）會自動包在外面。
- 頁面左右留白固定是 `px-5`（20px）。

### 步驟 2：接上路由

每一端有自己的頁面清單，只改自己那一端的檔案：

| 哪一端 | 檔案 |
|---|---|
| 住戶 | `src/router/resident.js` |
| 管委會 | `src/router/committee.js` |
| 管理人員 | `src/router/staff.js` |

`src/router/index.js` 負責把三份清單組合起來，平常不用改。

> **為什麼拆成三個檔案**：兩個人各做一端時，不會同時改到同一個檔案，合併時就不會衝突。

清單裡有兩個東西：

```js
import HomeView from '@/views/resident/HomeView.vue'
import ReportsView from '@/views/resident/ReportsView.vue'

export default {
  // 已經做好的畫面：「網址」對應「畫面」
  views: {
    home: HomeView,
    reports: ReportsView,
  },

  // 內頁：從別的頁面點進去的頁面
  innerPages: [
    { path: 'reports', title: '我的通報' },
    { path: 'reports/:id', title: '通報詳情' },
  ],
}
```

- **`views`**：做好一個畫面，就匯入並加一行。key 是網址去掉開頭那一端之後的部分（`/resident/reports/:id` 寫成 `'reports/:id'`，有斜線或冒號時要加引號）。沒列在這裡的頁面會顯示佔位頁。
- **`innerPages`**：這一端有哪些內頁。底部分頁、通知、「＋」按鈕的網址已經由 `roles.js` 決定，不用寫在這裡。

所以分兩種情況：

- **底部分頁、通知、「＋」按鈕的那一頁**：只要在 `views` 加一行。
- **內頁**：先在 `innerPages` 加一筆（這時會顯示佔位頁，別的頁面就可以先連過來），畫面做好後再到 `views` 加一行。

存檔後打開那個網址，看到步驟 1 的文字就表示路由通了。

### 步驟 3：拿資料

頁面拿資料的寫法固定是這四件事：

```js
import { onMounted, ref } from 'vue'
import { getCurrentUser, getMyReports } from '@/mocks/api'

// ① loading：資料還沒回來時是 true
const loading = ref(true)
// ② 每種資料一個 ref，先給空的初始值
const reports = ref([])

// ③ 畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('resident')
  reports.value = await getMyReports(user.id)
  // ④ 全部拿到後才把 loading 關掉
  loading.value = false
})
```

- 資料一律從 `@/mocks/api` 匯入，不要直接讀 `src/mocks/data/`。
- 要拿好幾種資料時用 `Promise.all` 同時拿（見 `HomeView.vue`），不要一個等完再等下一個，不然每多一種就多等 0.4 秒。
- 從資料「算出來」的東西用 `computed`，不要另外存一個 ref：

```js
// 首頁只放最新的一筆
const latestReport = computed(() => reports.value[0])
```

> **為什麼用 `computed`**：資料變了它會自動重算。如果另外存一個 ref，就要記得每次手動更新，很容易漏掉。

### 步驟 4：畫出三種狀態

每個會拿資料的區塊都要處理三種狀態，缺一種畫面就會壞：

| 狀態 | 什麼時候 | 怎麼做 |
|---|---|---|
| 載入中 | `loading` 是 true | 用 `<Skeleton>` 放一個和內容差不多高的灰色方塊 |
| 有資料 | 拿到一筆以上 | 用元件把資料畫出來 |
| 沒資料 | 拿到空的清單 | 顯示設計稿的空狀態（例如「目前無通報」） |

```vue
<Skeleton v-if="loading" class="h-[150px] rounded-xl" />
<ReportCard
  v-else
  :report="latestReport"
  :to="latestReport ? `/resident/reports/${latestReport.id}` : ''"
/>
```

- Skeleton 的高度抓實際內容的大概高度，資料出現時畫面才不會跳動。
- 用 `v-for` 列出清單時一定要加 `:key`，用資料的 `id`：

```vue
<NoticeHomeCard v-for="notice in homeNotices" :key="notice.id" :notice="notice" />
```

### 步驟 5：排版

- 頁面裡的每一區用 `<section>` 包起來，區塊標題用 `<SectionHeader>`。
- 區塊之間的距離用 `space-y-8`，區塊裡面的東西用 `space-y-3`。
- 會換頁的按鈕用 `<Button as-child>` 包 `<RouterLink>`，不要用 `@click` 加 `router.push`：

```vue
<Button as-child class="w-full">
  <RouterLink to="/resident/report">新增通報</RouterLink>
</Button>
```

> **為什麼**：這樣產生的是真正的連結（`<a>`），可以長按、可以被螢幕閱讀器讀成連結，行為和使用者預期的一樣。

顏色、字級、卡片、徽章的規則在第 5 節。

### 步驟 6：交出去之前自己檢查

- [ ] 把瀏覽器調成手機寬度（約 390px）看過一遍
- [ ] 重新整理頁面，有看到 Skeleton，資料出現時畫面沒有跳動
- [ ] 沒資料的狀態看過（暫時把拿到的資料換成空清單 `[]` 來測）
- [ ] 所有可以點的東西都點過，連到的網址是對的
- [ ] 可以點的範圍高度至少 44px
- [ ] 瀏覽器的 Console 沒有紅字
- [ ] 跑 `npm run build` 沒有錯誤

---

## 5. 樣式規則

樣式全部用 Tailwind 的 class 寫在 `<template>` 裡，不另外寫 `<style>`。顏色、字級、圓角、陰影的值都定義在 [`src/style.css`](../src/style.css)，這些值叫做「設計 Token」。

打開 `/playground` 的第一區「設計 Token」，可以看到所有顏色和文字樣式實際的樣子。

### 顏色：用「用途」的名字，不用色號

```vue
<!-- ✅ 用語意色 -->
<p class="text-muted-foreground">更新於 9/25</p>

<!-- ❌ 不要寫色號，也盡量不要直接用色階 -->
<p class="text-[#6c6d6e]">更新於 9/25</p>
<p class="text-gray-600">更新於 9/25</p>
```

常用的語意色（前面加 `bg-`、`text-`、`border-` 使用）：

| 名稱 | 用途 |
|---|---|
| `background` | 頁面背景 |
| `card` | 卡片底色（白） |
| `foreground` | 主要文字 |
| `text-secondary` | 卡片裡的內文（寫成 `text-text-secondary`） |
| `muted-foreground` | 次要說明文字，例如時間、補充說明 |
| `heading` | 區塊大標 |
| `primary` | 品牌藍：主要按鈕 |
| `brand-subtle` / `brand-strong` | 淺藍底 / 深藍 |
| `border` | 分隔線、邊框 |
| `remind`（另有 `-strong`、`-subtle`） | 提醒（橘） |
| `warning`（另有 `-strong`、`-subtle`） | 警告（紅） |
| `progress` / `success` | 進行中 / 完成 |

> **為什麼**：設計還在調整顏色。用語意色的話，之後只要改 `style.css` 的 `:root` 一行，整個 App 一起變；寫死色號就得一個一個檔案找。

如果設計稿上的顏色找不到對應的語意色，**不要自己寫色號，也不要自己加變數**，先跟對方確認：可能是設計稿用錯顏色，也可能是真的需要新增一個語意色。

### 文字：用 `type-` 開頭的 class

一個 class 同時設定字級、行高、粗細和字距，不要自己拼 `text-lg font-bold`。

| class | 用在 | 大小 |
|---|---|---|
| `type-title` | 區塊標題，例如「我的通報」 | 22px 粗體 |
| `type-card-title` | 卡片標題 | 18px 粗體 |
| `type-greeting` | 好彼管家的問候語 | 18px 粗體 |
| `type-body` | 內文 | 16px |
| `type-body-strong` | 內文裡要強調的字 | 16px 中粗 |
| `type-link` | 「看全部」這類文字連結 | 16px 中粗 |
| `type-date` | 日期、更新時間 | 14px |
| `type-button` | 按鈕文字（Button 已內建，不用自己加） | 14px 粗體 |
| `type-nav` | 底部導覽列 | 13px |
| `type-label` | 徽章 | 12px |

文字樣式和顏色分開寫，各一個 class：

```vue
<h2 class="type-title text-heading">我的通報</h2>
```

- **內文是 16px，不是設計稿的 14px。** 這是團隊為了長輩閱讀決定放大的，看到設計稿寫 14px 的內文，程式一律用 `type-body`。
- 自訂的文字樣式一律用 `type-` 開頭，不要用 `text-` 開頭。

> **為什麼不用 `text-` 開頭**：Tailwind 的 `text-` 同時用在字級（`text-lg`）和顏色（`text-heading`），自訂的名稱很容易撞名，撞到時其中一個會失效而且很難發現。

### 卡片

新做的卡片用這三個 class：

```vue
<div class="rounded-xl bg-card p-4 shadow-card">...</div>
```

- `rounded-xl` 是 14px，和 Kit 的卡片圓角一致。
- `shadow-card` 是帶一點藍色調的陰影，不要用 Tailwind 內建的 `shadow`、`shadow-md`。

### 徽章（Badge）

徽章只用這三種，依「意思」選，不是依喜歡的顏色選：

| `variant` | 外觀 | 什麼時候用 | 例子 |
|---|---|---|---|
| `default`（不用寫） | 淺藍底、深藍字 | 分類，或還沒開始處理的狀態 | 「定期保養」「已收到」 |
| `secondary` | 淺橘底、深橘字 | 正在進行的狀態 | 「處理中」「施工中」 |
| `outline` | 灰底、黑字 | 不需要強調的分類 | 「常態例會」「1F 大廳」 |

```vue
<Badge>已收到</Badge>
<Badge variant="secondary">處理中</Badge>
<Badge variant="outline">1F 大廳</Badge>
```

`outline` 這個名字是沿用 shadcn 的，實際上是灰底、沒有外框。

除了「已收到」和「處理中」，其他狀態該用哪個顏色還沒定案，見[第 8 節](#8-尚未定案的事)。

### 按鈕與可以點的範圍

- 所有可以點的東西，高度至少 **44px**（Tailwind 的 `h-11`）。
- `<Button>` 預設就是 44px，直接用，不要加 `size="sm"` 或 `size="xs"` 把它縮小。
- 純文字連結本身不夠高時，把可點擊的範圍撐到 `h-11`。`SectionHeader.vue` 的「看全部」是範例。

> **為什麼**：長輩也是使用者。按鈕太小會按不到或按錯。

### 表單

- **必填**：欄位名稱後面加紅色星號，不要寫「必填」兩個字。
- **選填**：欄位名稱後面用灰色小字寫「選填」，不要加底色。

### 間距

| 位置 | class |
|---|---|
| 頁面左右留白 | `px-5`（20px） |
| 區塊和區塊之間 | `space-y-8` |
| 區塊裡的東西之間 | `space-y-3` |
| 卡片內距 | `p-4` |

### 設計稿和這份規則不一樣時

以這份規則為準，但要讓對方知道。設計稿有些地方是手工畫的、沒有用 Kit 元件，數值可能不一致。發現不一致時在 PR 裡寫一句，不要默默照設計稿的數字寫死。

---

## 6. 拿資料的規則

現在沒有後端，資料都是假的。假資料的完整規劃在 [data-model.md](data-model.md)，這裡只寫「畫面怎麼用」。

### 規則 1：只從 `@/mocks/api` 拿

```js
// ✅
import { getVendors } from '@/mocks/api'

// ❌ 不要直接讀資料檔
import { vendors } from '@/mocks/data/vendors'
```

> **為什麼**：假 API 做了三件畫面不該自己做的事：依角色拿掉不能看的欄位、算出會隨日期變的狀態（例如逾期幾天）、把資料值轉成顯示文字。直接讀資料檔會全部跳過。另外，之後接真的後端時只需要改 `src/mocks/api/` 裡面的函式，畫面不用動。

**唯一的例外是對照表**（全大寫的那些，例如 `CASE_STATUSES`）。需要列出所有選項時，例如做篩選按鈕，可以從 `data/` 匯入。

### 規則 2：每個函式都要 `await`

假 API 全部回傳 Promise，並故意延遲 0.4 秒模擬網路。忘記寫 `await` 的話，拿到的會是 Promise 而不是資料，畫面會是空的。

```js
const vendors = await getVendors()
```

### 規則 3：傳對 `role`

很多函式可以傳入角色：`'resident'`、`'committee'`、`'staff'`。假 API 會依角色拿掉不該看到的欄位，例如合約金額和維修費用只有管委會看得到。

**頁面是哪一端的，就傳哪一端的角色**，不要為了拿到更多欄位而傳別的角色。

```js
// 在管理人員端的頁面
const user = await getCurrentUser('staff')
const contracts = await getContracts('staff') // 拿到的資料不會有金額
```

所以畫面上要顯示「可能不存在」的欄位時，要先判斷有沒有：

```vue
<p v-if="contract.amount">合約金額：{{ contract.amount }}</p>
```

### 規則 4：先拿「我是誰」

需要使用者資料的頁面，第一步都是 `getCurrentUser(角色)`，再用 `user.id` 去拿其他資料。不要把使用者的 id（例如 `'u-c04'`）直接寫在頁面裡。

### 規則 5：住戶端和管理端用不同的函式

「通報」和「案件」是同一份資料，但兩邊看到的欄位和狀態文字不同：

| 哪一端 | 清單 | 單筆 |
|---|---|---|
| 住戶 | `getMyReports` | `getReportById` |
| 管委會、管理人員 | `getCases` | `getCaseById` |

### 規則 6：顯示文字用假 API 給的，不要自己轉

狀態、類別在資料裡是英文代號，假 API 已經附上中文，欄位名稱以 `Label` 結尾：

```vue
<!-- ✅ -->
<Badge>{{ report.statusLabel }}</Badge>

<!-- ❌ 不要在畫面裡自己寫對照 -->
<Badge>{{ report.status === 'pending' ? '已收到' : '處理中' }}</Badge>
```

> **為什麼**：同一個狀態在住戶端和管理端的文字不一樣，用詞之後也可能再改。對照只寫在一個地方，才不會有的頁面改了、有的沒改。

### 規則 7：日期和「今天」

- 資料裡的時間是字串（`'2026-09-25T14:30'`），顯示時用 [`src/lib/date.js`](../src/lib/date.js) 的函式轉換，例如 `formatDate`、`formatDateTime`、`formatDateRange`。
- 需要「今天」或「現在」時，用假 API 匯出的 `MOCK_TODAY`（`2026-10-01`）和 `MOCK_NOW`，**不要用 `new Date()`**。

> **為什麼**：假資料是照著 2026/10/01 這一天設計的。用真正的今天去算，「3 天後到期」會變成「已過期 200 天」，而且每天打開畫面都不一樣，沒辦法對照設計稿。

### 需要的資料或函式不存在時

先看 `src/mocks/api/` 裡那一種資料的檔案，開頭的註解列了有哪些函式。真的沒有再新增，並且：

1. 資料加在 `data/`，函式加在 `api/` 對應的檔案（新檔案要在 `api/index.js` 匯出）。
2. 欄位的意思寫在資料檔開頭的註解。
3. **改動既有的資料或函式前，先跟對方說。** 三端看的是同一批資料，改一個欄位可能讓對方的頁面壞掉。

想看每種資料實際載入的樣子，打開 `/playground` 最下面的「假資料」區。

---

## 7. 不要做的事

| 不要 | 改成 | 為什麼 |
|---|---|---|
| 用 TypeScript（`.ts`、`<script setup lang="ts">`） | 一律 JavaScript | 團隊還在學 JavaScript，先不增加負擔 |
| 用 `pnpm` 或 `yarn` | `npm install`、`npx` | 混用會產生不同的 lock 檔，兩人裝到的套件版本會不一樣 |
| 執行 `npm audit fix --force` | 不要處理，維持現狀 | 會把 shadcn-vue 降回很舊的版本，元件會壞 |
| 沒討論就安裝新套件 | 先問對方 | `package.json` 兩人共用，容易衝突，套件也會讓網頁變大 |
| 手動在 `src/components/ui/` 建立檔案 | `npx shadcn-vue@latest add <名稱>` | 手動建立的會缺檔案或版本不一致 |
| 沒說一聲就改 `src/components/ui/` 裡的元件 | 先跟對方說，並在檔案裡用註解寫下改了什麼 | 這些元件整個 App 都在用，改一個地方會影響所有頁面 |
| 直接 import `src/mocks/data/` | 從 `@/mocks/api` 拿 | 見[第 6 節](#6-拿資料的規則) |
| 用 `new Date()` 取得今天 | `MOCK_TODAY`、`MOCK_NOW` | 見[第 6 節](#6-拿資料的規則) |
| 寫色號（`text-[#6c6d6e]`） | 用語意色 | 見[第 5 節](#5-樣式規則) |
| 做桌機版的排版（`md:`、`lg:` 開頭的 class） | 只做手機寬度 | 這個產品只做手機版 |
| commit `src/assets/IP/` 的吉祥物原圖 | 縮小後放 `src/assets/mascot/` 再用 | 原圖每張約 3MB，會讓 repo 和網頁都變得很慢 |
| 在程式碼裡留 `console.log` | 交出去前刪掉 | 除錯用的訊息不該留在成品裡 |

### 共用的檔案：改之前先說

下面這些檔案兩個人都會用到，改之前先告訴對方，並且單獨開一個 PR，不要和頁面的修改混在一起：

- `src/style.css`（設計 Token）
- `src/config/roles.js`（三端的分頁設定）
- `src/layouts/AppShell.vue` 和 `src/components/app/` 裡的外框元件
- `src/router/index.js`
- `src/components/ui/`
- `src/mocks/`（新增沒關係；修改或刪除既有的要先說）
- `package.json`

---

## 8. 尚未定案的事

下面這些還沒決定。**遇到時不要各自決定**，先照「目前的做法」寫，定案後再一起改。定案後把那一項從這裡移到對應的章節。

| 事項 | 現況 | 目前的做法 |
|---|---|---|
| 通報／案件的狀態顏色 | 只定了「已收到＝淺藍」「處理中＝淺橘」。已受理、已完成、進行中、待處理在設計稿上有兩三種顏色混用 | 還沒開始的用 `default`，進行中的用 `secondary`；其他的先用 `default`，並在 PR 裡註明 |
| 卡片圓角 | Kit 的卡片是 14px（`rounded-xl`）。但 `rounded-card`（20px）還留著，shadcn 的 `<Card>` 元件、角色選擇頁、playground 都在用 | 新做的產品元件用 `rounded-xl`，不要用 `rounded-card` |
| 對比度偏低 | 白字在品牌藍上約 2 : 1、白字在「＋」按鈕的紅色上約 3 : 1，長輩可能看不清楚 | 完全照設計稿。之後要調整時只改 `style.css` 的 `:root` |
| 管委會、管理人員的導覽列 | 設計稿已把「社區檔案」改名為「社區」，只有住戶端改了 | 做到那兩端時再改 `roles.js` 的 `managementTabs` |
| 管委會、管理人員的「＋」按鈕 | 設計是彈出「全域新增選單」，目前連到佔位頁 | 維持佔位頁 |
| 管委會和管理人員共用的頁面放哪 | 兩端的分頁相同，有些頁面可能長得一樣 | 管理人員端先不做。等管委會端做出幾頁後再決定（見 [git-workflow.md](git-workflow.md#1-分工)） |
| 篩選標籤 | Kit 沒有這個元件，設計稿有 6 處是借用 Button 手動調整 | 做到時先討論，不要各做一個 |
| 用詞 | 住戶端叫「通報」，通知裡出現「報修」 | 畫面上一律用「通報」 |
| mockup 裡手工畫的卡片 | 有些卡片不是 Kit 元件，不會跟著 Kit 變動，還沒清查 | 以 Kit 的元件為準 |
