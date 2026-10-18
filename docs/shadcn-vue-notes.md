# shadcn-vue 筆記（Vue + JavaScript 版）

來源：官方文件 https://www.shadcn-vue.com/docs

## 核心觀念
- 不是傳統元件庫，而是「建立你自己元件庫的方式」
- CLI 把元件**原始碼複製進專案**（`src/components/ui/`），之後檔案屬於專案，可直接修改
- 樣式全部用 Tailwind class；主題用 CSS 變數（語意 token）
- 五大原則：Open Code、Composition、Distribution、Beautiful Defaults、AI-Ready

## 安裝流程（Vite + Vue）
1. `npm create vite@latest <name> -- --template vue`（JS 版用 `vue`，不是 `vue-ts`）
2. `npm install tailwindcss @tailwindcss/vite`，`src/style.css` 改為 `@import "tailwindcss";`
3. 路徑別名：`jsconfig.json` 設 `@/*` → `./src/*`；`vite.config.js` 加 `resolve.alias` 與 tailwind plugin
4. `npx shadcn-vue@latest init`（會問 base color，產生 `components.json`）
5. `npx shadcn-vue@latest add button`（要什麼元件加什麼）

使用範例：

```vue
<script setup>
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button>送出通報</Button>
</template>
```

## 用指令加元件之後一定要檢查（2026-10-12 踩到）
`npx shadcn-vue@latest add <名稱>` 除了新增元件，還可能順手改到別的檔案。2026-10-12 加 `dialog` 時發生了三件事：

1. **`src/style.css` 被改壞**：Noto Sans TC 的字型載入被刪掉、換成 Geist，檔案最後還多了一段 `@layer base`
2. **`package.json`、`package-lock.json` 被升級**：`reka-ui` 和 `@lucide/vue` 的版本被往上調
3. **問要不要覆蓋 `button`**：`dialog` 會用到 `button`，指令想用官方版本蓋掉我們改過的。一定要選 **N**

所以每次加完元件：

1. 執行 `git status`，確認多出來的只有 `src/components/ui/<名稱>/` 這個新資料夾
2. 其他被改到的檔案全部還原：`git checkout -- src/style.css package.json package-lock.json`
3. 執行 `npm install`，把套件裝回原本的版本
4. 執行 `npm run build`，並打開畫面確認字型還是 Noto Sans TC

## JavaScript 版設定
- `components.json` 設 `"typescript": false`
- 官方 JS 文件的 jsconfig 範例寫 `"@/*": ["./*"]`，但 Vite 專案原始碼在 `src/`，以 `./src/*` 為準並驗證

## 主題（Theming）
- 成對 token：`primary` 是底色、`primary-foreground` 是其上的文字色
- 核心 token：background、card、popover、primary、secondary、muted、accent、destructive、border、input、ring、chart-1~5、sidebar-*
- `--radius` 是圓角基準值，改一個數字整套圓角一起變
- 深色模式：在 `.dark` 選擇器覆寫同一組 token
- 新增自訂 token（例如通報狀態色 `--warning`）：在 `:root` 與 `.dark` 定義，再用 `@theme inline` 對應到 `--color-*`
- 可用 https://www.shadcn-vue.com/create 視覺化調色再產生 preset

## 元件候選（對應好彼社區）
| 情境 | 候選元件 |
|---|---|
| 手機底部彈出面板 | Drawer、Sheet |
| 送出通報後回饋、通知 | Sonner（Toast） |
| 通報進度 | Stepper、Progress |
| 通報表單 | Field、Form、Textarea、Radio Group、Slider |
| 廠商名冊、維修史列表 | Item、Card、Avatar、Badge |
| 管委會查找資料 | Command（桌機版不做，Data Table、Sidebar 暫不使用） |
| 分類切換 | Tabs |
| 載入中、沒資料 | Skeleton、Spinner、Empty |
| 好彼管家對話式引導 | Bubble、Message（尚未讀文件，需確認用途） |
| 施工前後照片 | Attachment、Carousel |

## 做「假裝 APP 的網頁」注意
1. PWA 不歸 shadcn-vue 管，可安裝與離線另用 `vite-plugin-pwa`（一般知識，非上述文件內容）
2. 只做手機版：Drawer / Sheet / 底部 Tab；桌機版不做
3. 長輩友善需自行調整：放大字級、觸控區至少約 44px、提高對比
4. 中文字型需另外指定
