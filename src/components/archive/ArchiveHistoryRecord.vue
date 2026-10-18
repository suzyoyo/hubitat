<script setup>
// 設備維修史的一筆（對應 Figma 的 Archive/History Record）：日期＋項目＋徽章
// 用法：<ArchiveHistoryRecord date="2026-09-10" title="定期保養" label="保養" />
import { Badge } from '@/components/ui/badge'
import { formatFullDate } from '@/lib/date'

defineProps({
  date: { type: String, required: true }, // '2026-09-10'
  title: { type: String, required: true }, // 做了什麼
  label: { type: String, required: true }, // 徽章上的字
})
</script>

<template>
  <div class="flex items-start gap-3">
    <!-- 設計稿只寫「9/10」；紀錄會跨年，所以寫完整日期 -->
    <p class="shrink-0 type-date text-muted-foreground">{{ formatFullDate(date) }}</p>
    <p class="min-w-0 flex-1 type-body text-foreground">{{ title }}</p>
    <Badge variant="outline" class="shrink-0">{{ label }}</Badge>
  </div>
</template>
