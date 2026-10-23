<script setup>
// 新增通報・「我也遇到了」的完成頁：告訴住戶已經記錄了，不用再通報一次（住戶端、管委會端的新增通報共用）
import { BellIcon } from '@lucide/vue'
import ReportSimilarCard from '@/components/report/ReportSimilarCard.vue'
import mascotUrl from '@/assets/mascot/waving.png' // 坐著揮手的好彼管家

defineProps({
  // 按了「我也遇到了」的那一筆通報
  report: { type: Object, required: true },
  // 標題下面的一句說明；住戶端用來說明這件會出現在「我的通報」（管委會端沒有「我的通報」，不傳）
  note: { type: String, default: '' },
})
</script>

<template>
  <div class="space-y-4 pt-8">
    <div class="space-y-3 text-center">
      <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
      <!-- width / height 寫圖檔尺寸，讓瀏覽器先算好比例；實際顯示高度由 h-[133px] 決定 -->
      <img :src="mascotUrl" alt="" width="233" height="330" class="mx-auto h-[133px] w-auto" />
      <h2 class="type-title text-foreground">已記錄你也遇到相同問題！</h2>
      <p v-if="note" class="type-body text-muted-foreground">{{ note }}</p>
    </div>
    <ReportSimilarCard :report="report" type="joined" />
    <div class="flex items-start gap-3 rounded-lg bg-muted px-4 py-3.5">
      <!-- mt-0.5：圖示往下一點，對齊第一行文字 -->
      <BellIcon class="mt-0.5 size-5 shrink-0" />
      <p class="min-w-0 flex-1 type-body text-foreground">這件通報處理完成時，會馬上通知你。</p>
    </div>
  </div>
</template>
