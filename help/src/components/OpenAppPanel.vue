<script setup>
// 「開始使用好彼社區」區塊：上面是 App 圖示＋標題＋一行說明，下面「打開好彼社區」和「加到主畫面」兩顆按鈕並排
//   資料在 src/content/open-app.js，首頁、認識我們共用
//   2026-10-20 從「下載 App」（App Store／Google Play 兩顆按鈕）改來：好彼社區是 PWA，沒有 App 可以下載
//   從 App 裡打開手冊時不顯示這一塊（人已經在 App 裡了），改成頂部的「回到好彼社區」（components/BackToAppBar.vue）
//   按鈕顏色維持中藍（brand-700），白字對比約 4.6 : 1
import { ArrowRightIcon, ExternalLinkIcon } from '@lucide/vue'
import appIcon from '@app/../public/icon/icon-192.png'
import { OPEN_APP } from '@/content/open-app'
import { useFromApp } from '@/lib/from-app'

const { fromApp } = useFromApp()
</script>

<template>
  <section
    v-if="!fromApp"
    class="@container rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] md:p-6"
    aria-labelledby="open-app-title"
  >
    <div class="flex items-center gap-4">
      <img :src="appIcon" alt="" class="size-14 shrink-0 rounded-2xl border border-line" width="56" height="56" />
      <h2 id="open-app-title" class="min-w-0 text-xl font-bold text-brand-950 md:text-2xl">{{ OPEN_APP.title }}</h2>
    </div>
    <p class="mt-3 text-ink-soft">{{ OPEN_APP.text }}</p>

    <!-- 兩顆按鈕一律左右並排（2026-10-20 suzy 決定）：左邊「打開好彼社區」（主要，藍底白字），右邊「如何加到主畫面」（次要，淺藍底）
         @container／@[400px]：看的是這個區塊自己的寬度。區塊夠寬才顯示按鈕裡的小圖示，最窄的手機（320px 寬）只放字，
         而且字縮成 15px、左右留白縮小，「如何加到主畫面」7 個字才放得進一行 -->
    <div class="mt-5 grid grid-cols-2 gap-2 @[296px]:gap-3">
      <!-- 在新分頁打開，看說明的頁面不會被蓋掉 -->
      <a
        :href="OPEN_APP.url"
        target="_blank"
        rel="noopener"
        class="flex min-h-14 items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-1.5 text-[15px] font-semibold text-white hover:bg-brand-800 @[296px]:px-2 @[296px]:text-base @[400px]:text-lg"
      >
        {{ OPEN_APP.buttonLabel }}
        <ExternalLinkIcon class="hidden size-5 shrink-0 @[400px]:block" aria-hidden="true" />
        <span class="sr-only">（在新分頁開啟）</span>
      </a>
      <RouterLink
        :to="OPEN_APP.guideLink.to"
        class="flex min-h-14 items-center justify-center gap-1.5 rounded-xl bg-brand-50 px-1.5 text-[15px] font-semibold text-brand-900 hover:bg-brand-100 @[296px]:px-2 @[296px]:text-base @[400px]:text-lg"
      >
        {{ OPEN_APP.guideLink.label }}
        <ArrowRightIcon class="hidden size-5 shrink-0 @[400px]:block" aria-hidden="true" />
      </RouterLink>
    </div>
  </section>
</template>
