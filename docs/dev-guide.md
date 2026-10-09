# 好彼社區 Hubitat — 開發規範

兩個人一起寫程式時共同遵守的約定。目的只有一個：**不管誰寫的頁面，打開來長得都像同一個人寫的**，對方接手時不用重新猜。

每條規則後面都會寫「為什麼」。如果覺得某條規則不合理，先討論、改這份文件，再改程式。

相關文件：

- 假資料的完整規劃：[data-model.md](data-model.md)
- shadcn-vue 的用法筆記：[shadcn-vue-notes.md](shadcn-vue-notes.md)
- 分支與 PR 怎麼操作：`git-workflow.md`（尚未撰寫）
- Kit 元件與程式元件對照：`component-map.md`（尚未撰寫）

## 目錄

1. 開始之前（尚未撰寫）
2. [資料夾地圖](#2-資料夾地圖)
3. [命名規則](#3-命名規則)
4. [寫一個新頁面的步驟](#4-寫一個新頁面的步驟)
5. 樣式規則（尚未撰寫）
6. 拿資料的規則（尚未撰寫）
7. 不要做的事（尚未撰寫）
8. 尚未定案的事（尚未撰寫）

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
