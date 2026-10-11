<script setup>
// 通報摘要卡（對應 Figma 的 Report/Summary）：通報詳情頁最上面那一張
// 標題＋狀態徽章，下面是送出日期和公開狀態
// 公開的通報顯示地球圖示，保密的顯示鎖頭圖示
import { GlobeIcon, LockIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/date'
import { reportBadgeVariant } from '@/lib/report'

defineProps({
  // getReportById() 回傳的通報
  report: { type: Object, required: true },
})
</script>

<template>
  <article class="space-y-3 rounded-xl bg-card p-4 shadow-card">
    <div class="flex items-start gap-1">
      <h2 class="min-w-0 flex-1 type-greeting">{{ report.displayTitle }}</h2>
      <Badge :variant="reportBadgeVariant(report)">{{ report.statusLabel }}</Badge>
    </div>
    <!-- flex-wrap：螢幕比較窄、一行放不下時，公開狀態會自動換到下一行 -->
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-base leading-5 text-muted-foreground">
      <p>送出於 {{ formatDate(report.submittedAt) }}</p>
      <p class="flex items-center gap-1.5">
        <!-- component :is：依條件決定要用哪一個圖示元件 -->
        <component :is="report.visibility === 'private' ? LockIcon : GlobeIcon" class="size-4 shrink-0" />
        {{ report.visibilityLabel }}
      </p>
    </div>
  </article>
</template>
