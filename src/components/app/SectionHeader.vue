<script setup>
// 區塊標題：左邊大標，右邊「看全部」連結（對應 Figma 的 App/Section Header）
import { ChevronRightIcon } from '@lucide/vue'

defineProps({
  title: { type: String, required: true },
  // 「看全部」要連到哪一頁；不傳就不顯示連結
  to: { type: String, default: '' },
})
</script>

<template>
  <div class="flex items-center justify-between">
    <h2 class="type-title text-heading">{{ title }}</h2>
    <!-- h-11 是 44px 的可點擊範圍；-my-1 讓這一列的高度維持設計稿的 36px -->
    <RouterLink
      v-if="to"
      :to="to"
      class="-my-1 flex h-11 items-center gap-1 rounded-lg px-2.5 type-link tracking-[0.4px] text-heading"
    >
      看全部
      <ChevronRightIcon class="size-4" />
    </RouterLink>
  </div>
</template>
