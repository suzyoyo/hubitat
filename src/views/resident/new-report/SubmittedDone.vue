<script setup>
// 新增通報・送出後的完成頁：告訴住戶已經收到了，接下來會發生什麼事
import { BellIcon, ClockIcon } from '@lucide/vue'
import mascotUrl from '@/assets/mascot/happy.png' // 開心奔跑的好彼管家
</script>

<template>
  <div class="space-y-4 pt-8 text-center">
    <div class="space-y-3">
      <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
      <!-- width / height 寫圖檔尺寸，讓瀏覽器先算好比例；實際顯示高度由 h-[131px] 決定 -->
      <img :src="mascotUrl" alt="" width="233" height="330" class="mx-auto h-[131px] w-auto" />
      <h2 class="type-title text-foreground">已收到你的通報！</h2>
    </div>
    <p class="type-body text-muted-foreground">感謝你為社區公共環境盡一份心力</p>
    <!-- 接下來會發生的事 -->
    <ul class="space-y-3.5 rounded-lg bg-muted p-4 text-left">
      <li class="flex items-start gap-2.5">
        <!-- mt-0.5：圖示往下一點，對齊第一行文字 -->
        <BellIcon class="mt-0.5 size-5 shrink-0" />
        <span class="min-w-0 flex-1 type-body text-foreground">好彼管家已通知管理人員，會盡快處理。</span>
      </li>
      <li class="flex items-start gap-2.5">
        <ClockIcon class="mt-0.5 size-5 shrink-0" />
        <span class="min-w-0 flex-1 type-body text-foreground">進度可到「我的通報」查看。</span>
      </li>
    </ul>
  </div>
</template>
