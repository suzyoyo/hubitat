<script setup>
// 頂部標題列：左邊 logo、右邊通知鈴鐺（對應 Figma 的 App/Header，Brand 版）
// 首頁的問候語與吉祥物是另一個元件 AppGreeting，由首頁自己放
import { BellIcon } from '@lucide/vue'
import logoUrl from '@/assets/logo/logo3.svg' // 橫式 logo

defineProps({
  // 通知頁的網址，例如 /resident/notifications
  notificationsTo: { type: String, required: true },
})
</script>

<template>
  <!-- sticky top-0：往下捲時標題列會黏在畫面最上面 -->
  <!-- pt 用 max()：一般 10px；有瀏海的手機則避開瀏海（safe-area-inset-top） -->
  <header
    class="sticky top-0 z-10 flex items-center justify-between bg-background pr-3 pb-2.5 pl-5 pt-[max(10px,env(safe-area-inset-top))]"
  >
    <!-- width / height 寫原圖尺寸，讓瀏覽器先算好比例；實際顯示高度由 h-[26px] 決定 -->
    <img :src="logoUrl" alt="好彼社區" width="303" height="67" class="h-[26px] w-auto" />
    <!-- 外層 44px 是可點擊範圍（長輩好按），裡面的藍色圓形是設計稿的 40px -->
    <RouterLink
      :to="notificationsTo"
      aria-label="通知"
      class="-mr-0.5 flex size-11 items-center justify-center"
    >
      <span class="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <BellIcon class="size-4" />
      </span>
    </RouterLink>
  </header>
</template>
