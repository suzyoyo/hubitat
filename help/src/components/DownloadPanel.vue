<script setup>
// 下載 App 區塊：上面是 App 圖示＋標題，下面是 iOS、Android 兩顆大按鈕並排
//   資料在 src/content/download.js，首頁、認識我們共用，改網址只要改那裡
//   按鈕用中藍（brand-700）當底（2026-10-19 從最深的 brand-950 改淺，原本視覺太重）；白字對比約 4.6 : 1
//   上面的小字（App Store）也用白色，淺藍字在這個底色上對比不夠
import appIcon from '@app/../public/icon/icon-192.png'
import { DOWNLOAD } from '@/content/download'
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] md:p-6"
    aria-labelledby="download-title"
  >
    <div class="flex items-center gap-4">
      <img :src="appIcon" alt="" class="size-14 shrink-0 rounded-2xl border border-line" width="56" height="56" />
      <h2 id="download-title" class="min-w-0 text-xl font-bold text-brand-950 md:text-2xl">{{ DOWNLOAD.title }}</h2>
    </div>

    <!-- 兩顆按鈕並排；最窄的手機（320px）把圖示和間距縮小，「Google Play」才放得下 -->
    <ul class="mt-5 grid grid-cols-2 gap-3">
      <li v-for="store in DOWNLOAD.stores" :key="store.id">
        <!-- 在新分頁打開，看說明的頁面不會被蓋掉 -->
        <a
          :href="store.url"
          target="_blank"
          rel="noopener"
          class="flex min-h-16 items-center justify-center gap-2.5 rounded-xl bg-brand-700 px-3 text-white hover:bg-brand-800 max-[359px]:gap-1.5 max-[359px]:px-2"
        >
          <!-- Apple、Android 的圖示（Lucide 沒有品牌圖示，直接畫 SVG；路徑來自 Simple Icons） -->
          <svg v-if="store.id === 'ios'" viewBox="0 0 24 24" class="size-7 shrink-0 fill-current max-[359px]:size-5" aria-hidden="true">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="size-7 shrink-0 fill-current max-[359px]:size-5" aria-hidden="true">
            <path d="M18.44 5.56c-.68 1.17-1.35 2.33-2.03 3.5l-.11-.04c-1.83-.7-3.48-.8-4.42-.79-1.86.02-3.35.46-4.26.82-.08-.15-1.75-3.02-2.02-3.49a1.15 1.15 0 0 0-.14-.19c-.33-.36-.91-.49-1.38-.2-.48.28-.71.94-.39 1.5l1.95 3.36c.02.03-.49.26-1.39 1.02C2.9 12.18.45 14.77 0 18.99h24c-.12-1.11-.37-2.1-.75-3.01-.74-1.8-1.85-3.13-2.91-4.06-.66-.58-1.29-1.01-1.83-1.33l1.99-3.45c.3-.52.2-1.19-.22-1.53-.48-.39-1.21-.28-1.55.22zM7.35 14.6c.58 0 1.04.47 1.04 1.05 0 .58-.47 1.05-1.04 1.05-.58 0-1.04-.47-1.04-1.05 0-.57.46-1.05 1.04-1.05zm9.3 0c.58 0 1.04.47 1.04 1.05 0 .58-.46 1.05-1.04 1.05-.57 0-1.04-.47-1.04-1.05 0-.57.47-1.05 1.04-1.05z" />
          </svg>
          <span class="flex min-w-0 flex-col items-start leading-tight">
            <span class="whitespace-nowrap text-xs">{{ store.caption }}</span>
            <span class="text-lg font-bold">{{ store.label }}</span>
          </span>
          <span class="sr-only">（在新分頁開啟）</span>
        </a>
      </li>
    </ul>
    <p v-if="DOWNLOAD.isTestData" class="mt-2 text-center text-sm text-muted">測試連結，App 上架後更新</p>
  </section>
</template>
