# 好彼社區使用指南（Help Center）

給住戶、管委會、管理人員看的網頁版使用手冊。是一個**獨立的網站**，和 App 放在同一個 repo、共用 `package.json` 的套件，但分開啟動、分開打包、分開部署，不會影響 App。

- 內容的依據：`docs/help-center-handoff.md`（產品現況）＋實際的 App 程式。**只寫已經做好的功能**，沒做的功能不寫、也不寫「即將推出」。
- 技術：Vue 3 ＋ Vite ＋ Vue Router ＋ Tailwind CSS v4 ＋ reka-ui（抽屜、彈窗、常見問題摺疊）＋ Lucide 圖示，都是 App 已經有的套件，沒有另外安裝；只多了開發用的 Playwright（自動檢查用）。

## 指令

| 指令 | 做什麼 |
|---|---|
| `npm run dev:help` | 本機啟動，打開 http://localhost:5180（和 App 的 5173 錯開，可以同時開） |
| `npm run build:help` | 打包成靜態網站，產生在 `help/dist/` |
| `npm run preview:help` | 在本機看打包後的樣子 |
| `npm run check:help` | 檢查文章資料有沒有寫錯，並列出「待補截圖清單」 |
| `npm run test:help` | 用 Playwright 自動檢查：五種寬度沒有水平捲軸、所有文章打得開、按鈕夠大、鍵盤操作、搜尋 |
| `npm run test:help -- --shots` | 同上，另外把首頁與文章頁的截圖存到 `help/test-results/`（不會 commit） |

第一次在新電腦跑 `test:help` 前，要先下載 Playwright 用的瀏覽器：`npx playwright install chromium`。

## 部署

`npm run build:help` 產生的 `help/dist/` 是純靜態檔案，可以放到任何靜態網站服務（Netlify、Vercel、GitHub Pages、Cloudflare Pages…）。

1. **網址沒有 `#`**（例如 `/articles/new-report`），所以伺服器要設定「找不到的路徑都回傳 `index.html`」，不然直接打開文章網址會 404：
   - Netlify：在 `help/public/` 新增 `_redirects`，內容 `/*  /index.html  200`
   - Vercel：rewrites 設定 `{ "source": "/(.*)", "destination": "/index.html" }`
   - GitHub Pages：不支援這個設定，要另外做 `404.html` 轉址，或改用其他服務
2. **放在子路徑**時（例如 `https://example.com/help/`），打包前設定 `HELP_BASE`：`HELP_BASE=/help/ npm run build:help`
3. 部署好之後，把 App「我的」→「使用說明」（`me/help`，目前是佔位頁）改成連到這個網址。這是 App 的修改，要另外開分支。

## 資料夾

```text
help/
├─ index.html、vite.config.js     網站的進入點與設定
├─ public/                         原封不動複製的檔案（favicon）
├─ scripts/
│  ├─ check-content.js             檢查文章資料、列出待補截圖
│  └─ test-site.js                 Playwright 自動檢查
└─ src/
   ├─ main.js、App.vue、router.js  進入點、外框、網址
   ├─ style.css                    設計 Token（顏色、字型、按鈕）
   ├─ content/                     ★ 教學內容都在這裡，改內容只需要動這個資料夾
   │  ├─ articles/                 文章，一篇一個檔案
   │  │  ├─ about/                 認識好彼社區
   │  │  ├─ start/                 開始使用（三種身分共用）
   │  │  ├─ resident/              住戶
   │  │  └─ management/            管委會、管理人員
   │  ├─ about.js                  「認識我們」頁的服務介紹、好彼管家比比
   │  ├─ categories.js             文章分類
   │  ├─ roles.js                  三種身分
   │  ├─ faqs.js                   常見問題
   │  └─ contact.js                聯絡支援（目前是測試資料）
   ├─ assets/screenshots/          App 截圖（目前是空的，見下面「截圖」）
   ├─ lib/                         從文章資料算出導覽、目錄、搜尋
   ├─ components/                  共用元件
   └─ views/                       頁面
```

資料夾只是為了好找，**文章出現在哪個身分，看的是 `applicableRoles`，不是放在哪個資料夾**。

## 新增一篇文章

1. 在 `src/content/articles/` 對應的資料夾新增一個 `.js` 檔，可以複製一篇相近的文章來改
2. 改好欄位（見下表），`published: true`
3. 跑 `npm run check:help`，沒有錯誤就完成了

側邊導覽、身分專區、首頁的分類、搜尋、頁內目錄、相關教學都會自動更新，**不用改任何頁面**。

### 文章的欄位

| 欄位 | 必填 | 說明 |
|---|---|---|
| `id` | ✓ | 英文小寫和 `-`，會變成網址 `/articles/id`。發布後不要改，不然分享出去的網址會失效 |
| `title` | ✓ | 文章標題，用「如何…」「查看…」這種動詞開頭的說法 |
| `description` | ✓ | 一句話介紹，會出現在卡片和搜尋結果 |
| `category` | ✓ | 分類 id，見 `categories.js` |
| `applicableRoles` | ✓ | 適用的身分：`'resident'`、`'committee'`、`'staff'`，可以多個 |
| `order` | ✓ | 同一個分類裡的排序，數字小的在前面 |
| `keywords` | ✓ | 搜尋用的關鍵字，放使用者可能會打的說法（例如「報修」「壞掉」） |
| `published` | ✓ | `true` 才會出現在網站上；還沒寫完的設 `false`，網站上完全看不到 |
| `audienceNote` | | 身分底下的補充，例如「只有主委、副主委可以交辦。」 |
| `popular` | | `true` 會出現在首頁「新手教學」（建議維持 6～8 篇） |
| `complex` | | `true` 表示比較複雜的流程，「注意事項」旁邊會放好彼管家（步驟一律一步一步看，不用另外設定） |
| `before` | | 「開始前要知道」，字串陣列 |
| `steps` | | 操作步驟，見下面 |
| `sections` | | 其他段落，見下面 |
| `result` | | 「完成後」會看到什麼 |
| `notes` | | 「注意事項」，字串陣列 |
| `relatedArticles` | | 相關教學的 id 陣列；連到不存在的文章時 `check:help` 會報錯 |

文章至少要有 `steps` 或 `sections` 其中一個。

### 步驟 `steps`

```js
steps: [
  {
    title: '按「受理」',                       // 一個步驟只寫一個動作
    body: '打開案件，按畫面底部的「受理」。',  // 簡短說明
    tips: ['受理後案件變成「處理中」。'],     // 選填：小提示
    screenshot: { file: 'case-pending.jpg', alt: '待受理的案件詳情，底部有「受理」按鈕' }, // 選填
  },
]
```

### 段落 `sections`

```js
sections: [
  {
    heading: '段落標題',
    mascot: 'waving', // 選填：段落右下角放好彼管家，填 src/assets/mascot/ 的檔名（不含 .png）
    mascotRow: ['pointing', 'happy'], // 選填：手機版改在文字下面排成一列的幾隻；沒填就只放 mascot 那一隻
    blocks: [
      { type: 'p', text: '一段文字' },
      { type: 'list', items: ['項目一', '項目二'] },
      { type: 'table', caption: '表格說明（給螢幕閱讀器）', head: ['欄 1', '欄 2'], rows: [['a', 'b']] },
      { type: 'badges', items: [{ tone: 'red', label: '尚未受理', meaning: '意思' }] }, // tone：red、orange、blue、gray
      { type: 'tip', title: '小提示', text: '…' },
      { type: 'warning', title: '請注意', text: '…' },
      { type: 'image', screenshot: { file: '檔名.jpg', alt: '圖上有什麼' } },
    ],
  },
]
```

### 寫法

- **按鈕、欄位、畫面上的文字用「」框起來**，網站會自動加粗變深藍，例如「送出通報」。文字一定要和 App 畫面上的一模一樣
- 短句、動詞開頭，一個步驟只做一件事
- 給一般住戶看的，不要用技術名詞（API、資料庫、狀態值…）
- 站在使用者的角度：只寫「會看到什麼、要按什麼」。不寫字數上限、錯誤訊息原文、系統內部怎麼運作（例如設備狀態怎麼自動改變）、兩個人同時操作這類細節（2026-10-18 全部文章照這個原則改寫過）
- 不要寫：還沒做的功能、原型才有的限制（重新整理資料會還原、角色選擇頁）、登入步驟（等團隊提供正式流程）、管理端的內部資訊寫進住戶文章

## 截圖

**目前先不放截圖**（2026-10-18 決定：App 的最終畫面還要再確認）。文章裡已經寫好每一步要放哪張圖（`screenshot.file` 和 `alt`），檔案還沒放進來的圖片網站上不會顯示，也不會留下空白。

畫面定案後：

1. `npm run check:help` 看「待補截圖清單」（檔名、圖上要有什麼、用在哪幾篇）
2. 用 App 截圖：手機尺寸 375×812、2 倍解析度，存成 `.jpg`（檔案比較小）。截之前到 App 的 `/playground` 選好示範住戶，截完切回李先生；中途不要重新整理
3. 照清單的檔名放進 `src/assets/screenshots/`，網站就會自動顯示，點了可以放大
4. 截圖不要拍到佔位頁（「這一頁還沒製作」）、字體大小設定、下載按鈕

## 認識我們、常見問題、聯絡支援

- 「認識我們」（/about）是獨立的介紹頁，文字在 `src/content/about.js`：服務一個一筆，好彼管家比比的介紹也在這裡。只寫 App 已經做好的功能。文章 `what-is` 會自動拿同樣的文字給搜尋用，打開它會轉到 /about

- 常見問題在 `src/content/faqs.js`，欄位說明寫在檔案開頭。`featured: true` 的會出現在首頁
- 聯絡支援在 `src/content/contact.js`，**目前是測試資料**，頁面上有明顯的「測試資料」標示。換成正式資料時改內容，並把 `isTestData` 改成 `false`

## 設計規則

- 顏色沿用 App 的品牌色階（`src/style.css` 的 `@theme`），但**文字、連結、按鈕底色用深藍 `brand-800`（#306077）或 `brand-900`**；品牌藍 `#6FB7E2` 對比度只有 2.2 : 1，只當裝飾
- 紅色 `#FF5657` 只當圓點和圖示；紅色的字用 `danger`（#AD3739）
- 內文 16px 以上（文章 17px、行高 1.75），可以點的地方至少 44×44px
- 版面寬度：手機 < 768px 單欄；平板 768～1199px 單欄加寬，導覽在抽屜；桌機 ≥ 1200px 文章頁兩欄（左邊是這篇文章的目錄、右邊文章最寬 720px，一起置中）
- 好彼管家只出現在：首頁歡迎、「認識我們」頁、複雜操作的注意事項（`complex` 文章）、完成提示、搜尋不到、疑難排解
