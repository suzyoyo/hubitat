<script setup>
// 好彼管家提示框（對應 Figma 的 Feedback/Haobi Tip）
// 左邊是好彼管家的頭像，右邊是「好彼管家」＋一句主要的話＋補充說明
import mascotUrl from '@/assets/mascot/thinking.png' // 托著下巴思考的好彼管家

defineProps({
  // 主要的那句話，例如「想通報哪裡的問題呢？」
  title: { type: String, required: true },
  // 下面的補充說明；不傳就不顯示
  description: { type: String, default: '' },
})
</script>

<template>
  <!-- items-end：頭像貼齊底部，看起來像從框的下緣探出頭 -->
  <div class="flex items-end gap-3 overflow-hidden rounded-lg bg-secondary px-4">
    <!-- 外框 74×74 只露出好彼管家的上半身，超出的部分用 overflow-hidden 裁掉 -->
    <div class="relative size-[74px] shrink-0 overflow-hidden">
      <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
      <img :src="mascotUrl" alt="" width="233" height="330" class="absolute top-[-8%] left-0 h-auto w-full max-w-none" />
    </div>
    <div class="min-w-0 flex-1 space-y-1 py-3.5 text-blue-950">
      <p class="type-body-strong">好彼管家</p>
      <p class="type-greeting">{{ title }}</p>
      <p v-if="description" class="type-date text-muted-foreground">{{ description }}</p>
    </div>
  </div>
</template>
