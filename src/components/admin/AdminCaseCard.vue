<script setup>
// 管委會端的案件卡（對應 Figma 的 Admin/Case Card）
// 第一行標題＋狀態徽章＋›；第二行地點；第三行負責人和廠商
import { computed } from 'vue'
import { ChevronRightIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { caseStatusBadge } from './caseStatusBadge'

const props = defineProps({
  // getCases() 回傳的其中一筆
  item: { type: Object, required: true },
  // 點卡片要連到哪一頁
  to: { type: String, default: '' },
})

// 狀態徽章的規則放在 caseStatusBadge.js，案件詳情頁也用同一份
const statusBadge = computed(() => caseStatusBadge(props.item))

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
    <!-- 第一行：標題、狀態徽章、›（徽章放在箭頭左邊，dev-guide 第 5 節） -->
    <div class="flex items-start gap-2">
      <h3 class="min-w-0 flex-1 type-card-title text-foreground">{{ item.title }}</h3>
      <!-- mt-0.5、mt-1：徽章和箭頭對齊標題第一行 -->
      <Badge :variant="statusBadge.variant" class="mt-0.5 shrink-0">{{ statusBadge.text }}</Badge>
      <ChevronRightIcon class="mt-1 size-4 shrink-0" />
    </div>
    <div>
      <Badge variant="outline">{{ item.areaName }}</Badge>
    </div>
    <p class="type-body text-muted-foreground">{{ footerText }}</p>
  </RouterLink>
</template>
