<script setup>
// 「我的通報」卡片（對應 Figma 的 Report/Card）
// 目前做了兩種：Compact（首頁摘要）、Empty（目前無通報）
// 我的通報列表用的 Full 版，等做到那一頁再加
import { ChevronRightIcon, ClockIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDateTime } from '@/lib/date'

defineProps({
  // getMyReports() 回傳的其中一筆；不傳就顯示「目前無通報」
  report: { type: Object, default: null },
  // 點卡片要連到哪一頁
  to: { type: String, default: '' },
})

// 卡片外觀：左邊一條紅線，所以只有右邊是圓角
const cardClass = 'block rounded-r-xl border-l-[5px] border-warning bg-card p-4 shadow-card'
</script>

<template>
  <RouterLink v-if="report" :to="to" :class="cardClass" class="space-y-3">
    <div class="flex items-start gap-1">
      <h3 class="min-w-0 flex-1 type-greeting">{{ report.displayTitle }}</h3>
      <Badge variant="secondary">{{ report.statusLabel }}</Badge>
    </div>
    <!-- 最新一筆給住戶看的進度說明 -->
    <p class="type-body text-muted-foreground">{{ report.latestReply.text }}</p>
    <Separator />
    <div class="flex items-center gap-2.5">
      <ClockIcon class="size-5 shrink-0" />
      <p class="min-w-0 flex-1 text-base leading-5">更新於 {{ formatDateTime(report.updatedAt) }}</p>
      <ChevronRightIcon class="size-5 shrink-0" />
    </div>
  </RouterLink>

  <div v-else :class="cardClass">
    <p class="type-greeting">目前無通報</p>
  </div>
</template>
