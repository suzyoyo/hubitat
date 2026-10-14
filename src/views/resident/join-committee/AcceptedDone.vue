<script setup>
// 加入管委會・接受之後的完成頁：告訴住戶已經接受了，什麼時候生效
import { BellIcon, CalendarCheckIcon } from '@lucide/vue'
import mascotUrl from '@/assets/mascot/happy.png' // 開心奔跑的好彼管家
import { formatFullDate } from '@/lib/date'

defineProps({
  // 剛剛接受的邀請（假 API acceptInvite 回傳的）
  invite: { type: Object, required: true },
})
</script>

<template>
  <div class="space-y-4 pt-8 text-center">
    <div class="space-y-3">
      <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
      <!-- width / height 寫圖檔尺寸，讓瀏覽器先算好比例；實際顯示高度由 h-[131px] 決定 -->
      <img :src="mascotUrl" alt="" width="233" height="330" class="mx-auto h-[131px] w-auto" />
      <h2 class="type-title text-foreground">已接受邀請！</h2>
    </div>
    <p class="type-body text-muted-foreground">
      你將加入第 {{ invite.term }} 屆管理委員會，擔任{{ invite.roleLabel }}
    </p>
    <!-- 接下來會發生的事 -->
    <ul class="space-y-3.5 rounded-lg bg-muted p-4 text-left">
      <li class="flex items-start gap-2.5">
        <!-- mt-0.5：圖示往下一點，對齊第一行文字 -->
        <CalendarCheckIcon class="mt-0.5 size-5 shrink-0" />
        <span class="min-w-0 flex-1 type-body text-foreground">
          {{ formatFullDate(invite.startDate) }} 起，可在「我的」頁的「身分」切換到管委會端。
        </span>
      </li>
      <li class="flex items-start gap-2.5">
        <BellIcon class="mt-0.5 size-5 shrink-0" />
        <span class="min-w-0 flex-1 type-body text-foreground">生效前好彼管家會再通知你。</span>
      </li>
    </ul>
  </div>
</template>
