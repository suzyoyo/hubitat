<script setup>
// 管委會端的案件卡（對應 Figma 的 Admin/Case Card）
// 第一行標題＋›；第二行左邊地點、右邊狀態徽章；第三行負責人和廠商
import { computed } from 'vue'
import { ChevronRightIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps({
  // getCases() 回傳的其中一筆
  item: { type: Object, required: true },
  // 點卡片要連到哪一頁
  to: { type: String, default: '' },
})

// 狀態徽章（dev-guide 第 5 節管理端的顏色）
//   逾期、還沒受理 → 紅：已經出問題
//   待驗收        → 橘：輪到管委會確認
//   已受理、施工中 → 藍：進行中，在等別人
//   已結案、已取消 → 灰：已結束
const statusBadge = computed(() => {
  const { item } = props
  if (item.isOverdue) return { variant: 'destructive', text: `逾期 ${item.overdueDays} 天` }
  if (item.status === 'pending') return { variant: 'destructive', text: '尚未受理' }
  if (item.status === 'to_verify') return { variant: 'secondary', text: item.statusLabel }
  if (item.isOpen) return { variant: 'default', text: item.statusLabel }
  return { variant: 'outline', text: item.statusLabel }
})

// 最下面那一行：還沒受理的只寫「尚未受理」，其他寫負責人和廠商
const footerText = computed(() => {
  const { item } = props
  if (item.status === 'pending') return '尚未受理'
  const assignee = item.assigneeLabel ? `負責：${item.assigneeLabel}` : '尚未指派負責人'
  const vendor = item.vendorName ? `廠商：${item.vendorName}` : '尚未派廠商'
  return `${assignee}｜${vendor}`
})
</script>

<template>
  <RouterLink :to="to" class="block space-y-3 rounded-xl bg-card p-4 shadow-card">
    <div class="flex items-start gap-2">
      <h3 class="min-w-0 flex-1 type-card-title text-foreground">{{ item.title }}</h3>
      <!-- mt-1：箭頭對齊標題第一行 -->
      <ChevronRightIcon class="mt-1 size-4 shrink-0" />
    </div>
    <div class="flex items-center justify-between gap-2">
      <Badge variant="outline">{{ item.areaName }}</Badge>
      <Badge :variant="statusBadge.variant">{{ statusBadge.text }}</Badge>
    </div>
    <p class="type-body text-muted-foreground">{{ footerText }}</p>
  </RouterLink>
</template>
