<script setup>
// 「← 回到好彼社區」橫條（2026-10-20）：只有從 App 裡打開手冊時才出現，放在頂部列最上面，捲動時一直看得到
//   怎麼判斷、怎麼回去寫在 lib/from-app.js
import { ChevronLeftIcon } from '@lucide/vue'
import { backToApp, useFromApp } from '@/lib/from-app'

const { fromApp } = useFromApp()
</script>

<template>
  <!-- bg-brand-800 白字對比 6.9 : 1；整條都可以按，高 44px -->
  <button
    v-if="fromApp"
    type="button"
    class="flex min-h-11 w-full items-center gap-1 bg-brand-800 px-3 font-bold text-white hover:bg-brand-900 md:px-6"
    @click="backToApp"
  >
    <ChevronLeftIcon class="size-5" aria-hidden="true" />
    回到好彼社區
  </button>
</template>
