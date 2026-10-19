<script setup>
// 整個網站的外框：頂部列、頁面內容、頁尾、返回頂部按鈕
import BackToTop from '@/components/BackToTop.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import SiteHeader from '@/components/SiteHeader.vue'
</script>

<template>
  <!-- 鍵盤使用者按 Tab 第一個會到這裡，可以略過頂部列直接到內容 -->
  <a
    href="#main"
    class="sr-only z-50 rounded-lg bg-brand-800 px-4 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
  >
    跳到主要內容
  </a>
  <!-- 內容很短的頁面，頁尾也要貼在畫面最下面：整頁至少一個畫面高，main 把剩下的空間撐滿 -->
  <div class="flex min-h-dvh flex-col">
    <SiteHeader />
    <main id="main" tabindex="-1" class="flex-1 outline-none">
      <RouterView />
    </main>
    <SiteFooter />
  </div>
  <BackToTop />
</template>
