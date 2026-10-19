<script setup>
// 下載 App 區塊：上面是 App 圖示＋標題，下面是 iOS、Android 兩顆大按鈕並排
//   資料在 src/content/download.js，首頁、認識我們共用，改網址只要改那裡
//   按鈕排法仿 App Store／Google Play 官方徽章（2026-10-19 suzy 給範例）：圖示在左、兩行字靠左
//   （上面小字「立即下載」、下面大字商店名稱），不再全部擠在中間
//   顏色維持中藍（brand-700），白字對比約 4.6 : 1；圖示都用白色，彩色的 Google Play 在藍底上看不清楚
import appIcon from '@app/../public/icon/icon-192.png'
import { DOWNLOAD } from '@/content/download'
</script>

<template>
  <section
    class="@container rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] md:p-6"
    aria-labelledby="download-title"
  >
    <div class="flex items-center gap-4">
      <img :src="appIcon" alt="" class="size-14 shrink-0 rounded-2xl border border-line" width="56" height="56" />
      <h2 id="download-title" class="min-w-0 text-xl font-bold text-brand-950 md:text-2xl">{{ DOWNLOAD.title }}</h2>
    </div>

    <!-- 兩顆按鈕一律左右並排（2026-10-19 suzy 決定，手機、平板也不換成上下）。區塊越窄，圖示、字、留白越小，「Google Play」才放得下：
           桌機（區塊 400px 以上）：內容靠左、字最大；平板（296px 以上）：中等；手機最窄的（320px 寬）：最小，內容置中
         @container／@[400px]：看的是下載區塊自己的寬度，不是整個畫面的寬度（區塊在不同頁面寬度不一樣） -->
    <ul class="mt-5 grid grid-cols-2 gap-2 @[296px]:gap-3">
      <li v-for="store in DOWNLOAD.stores" :key="store.id">
        <!-- 在新分頁打開，看說明的頁面不會被蓋掉 -->
        <a
          :href="store.url"
          target="_blank"
          rel="noopener"
          class="flex min-h-16 items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-2 text-white hover:bg-brand-800 @[296px]:gap-2 @[296px]:px-2.5 @[400px]:justify-start @[400px]:gap-3 @[400px]:px-4"
        >
          <!-- Apple 的圖示（Lucide 沒有品牌圖示，直接畫 SVG；路徑來自 Simple Icons） -->
          <svg v-if="store.id === 'ios'" viewBox="0 0 24 24" class="size-[18px] shrink-0 fill-current @[296px]:size-5 @[400px]:size-7" aria-hidden="true">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          <!-- Google Play 的三角形（白色） -->
          <svg v-else viewBox="0 0 24 24" class="size-[18px] shrink-0 fill-current @[296px]:size-5 @[400px]:size-7" aria-hidden="true">
            <path d="M3.6 1.8 13.6 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1z" />
            <path d="M16.9 8.7 13.6 12 3.6 1.8c.4-.2.8-.2 1.2 0z" opacity="0.85" />
            <path d="M16.9 15.3 4.8 22.2c-.4.2-.8.2-1.2 0L13.6 12z" opacity="0.85" />
            <path d="M20.4 10.8c.8.5.8 1.9 0 2.4l-3.5 2.1-3.3-3.3 3.3-3.3z" opacity="0.7" />
          </svg>
          <span class="flex min-w-0 flex-col items-start leading-tight">
            <span class="whitespace-nowrap text-[11px] @[400px]:text-xs">{{ store.caption }}</span>
            <span class="whitespace-nowrap text-sm font-semibold tracking-tight @[296px]:text-base @[400px]:text-xl">{{ store.label }}</span>
          </span>
          <span class="sr-only">（在新分頁開啟）</span>
        </a>
      </li>
    </ul>
  </section>
</template>
