<script setup>
// 頂部列：左邊品牌名稱、右邊通知鈴鐺
import { BellIcon } from '@lucide/vue'

defineProps({
  // 通知頁的網址，例如 /resident/notifications
  notificationsTo: { type: String, required: true },
})
</script>

<template>
  <!-- pt 用 max()：一般至少 12px；有瀏海的手機則避開瀏海（safe-area-inset-top） -->
  <header
    class="sticky top-0 z-10 flex items-center justify-between bg-card pt-[max(12px,env(safe-area-inset-top))] pr-3 pb-3 pl-5"
  >
    <div class="flex items-center gap-2">
      <!-- 品牌標記：之後換成正式 logo -->
      <span class="h-6 w-2 rounded bg-foreground" />
      <span class="text-xl leading-normal font-bold">好彼社區</span>
    </div>
    <!-- 設計稿是 36px；用 size-11（44px）放大可點擊範圍，圖示大小不變 -->
    <RouterLink
      :to="notificationsTo"
      aria-label="通知"
      class="flex size-11 items-center justify-center rounded-full"
    >
      <BellIcon class="size-4" />
    </RouterLink>
  </header>
</template>
