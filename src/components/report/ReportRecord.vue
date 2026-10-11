<script setup>
// 處理紀錄的一筆（對應 Figma 的 Report/Record）：左邊日期、右邊說明
// 最新的一筆是深色，之前的是灰色
import { formatDate } from '@/lib/date'

defineProps({
  // 通報 timeline 裡的其中一筆：{ at: 時間, text: 給住戶看的說明 }
  record: { type: Object, required: true },
  // 是不是最新的一筆
  latest: { type: Boolean, default: false },
})
</script>

<template>
  <div class="flex items-start gap-3 type-body" :class="latest ? 'font-medium text-heading' : 'text-muted-foreground'">
    <!-- w-11：日期固定寬度，不管是 9/5 還是 10/25，右邊的說明都會對齊 -->
    <p class="w-11 shrink-0">{{ formatDate(record.at) }}</p>
    <p class="min-w-0 flex-1">{{ record.text }}</p>
  </div>
</template>
