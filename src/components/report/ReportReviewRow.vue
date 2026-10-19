<script setup>
// 確認送出頁的一列（對應 Figma 的 Report/Review Row）：欄位名稱＋填的內容＋右邊的「修改」按鈕
// 列和列之間的分隔線由外面的容器畫（divide-y），這個元件自己不畫
import { Button } from '@/components/ui/button'

defineProps({
  // 欄位名稱，例如「地點」
  label: { type: String, required: true },
  // 填的內容，例如「A 棟・1F 大廳」
  value: { type: String, required: true },
})

// edit：按了「修改」
defineEmits(['edit'])
</script>

<template>
  <div class="flex items-start gap-3 py-3.5">
    <div class="min-w-0 flex-1 space-y-0.5">
      <p class="type-body-strong text-foreground">{{ label }}</p>
      <!-- whitespace-pre-line：內容裡有換行的話照樣換行（補充說明可能打了好幾行） -->
      <p class="type-body whitespace-pre-line text-muted-foreground">{{ value }}</p>
    </div>
    <!-- aria-label：螢幕閱讀器會念「修改地點」，才知道是改哪一項 -->
    <Button variant="ghost" class="shrink-0" :aria-label="`修改${label}`" @click="$emit('edit')">修改</Button>
  </div>
</template>
