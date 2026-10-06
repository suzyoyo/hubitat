<script setup>
// 頂部區塊：淺藍漸層底，左邊 logo、右邊通知鈴鐺
// 首頁的問候語與吉祥物之後會放在 logo 列的下方（透過 slot 傳進來）
import { BellIcon } from '@lucide/vue'
import logoUrl from '@/assets/logo/logo3.svg' // 橫式 logo

defineProps({
  // 通知頁的網址，例如 /resident/notifications
  notificationsTo: { type: String, required: true },
})
</script>

<template>
  <!-- pt 用 max()：一般至少 20px；有瀏海的手機則避開瀏海（safe-area-inset-top） -->
  <header
    class="flex flex-col gap-2 rounded-b-3xl bg-header-panel px-5 pb-3 pt-[max(20px,env(safe-area-inset-top))] drop-shadow-[0_1px_1px_rgba(0,0,0,0.26)]"
  >
    <div class="flex h-12 items-center justify-between">
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
    </div>
    <!-- slot：各頁可以在這裡放額外內容（例如首頁的問候語） -->
    <slot />
  </header>
</template>
