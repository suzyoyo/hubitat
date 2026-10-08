<script setup>
// 首頁的社區公告卡（對應 Figma 的 Notice/Home Card）
// 標題＋狀態標籤、影響範圍、日期
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { diffDays, formatDateRange } from '@/lib/date'
import { MOCK_TODAY } from '@/mocks/api'

const props = defineProps({
  // getAnnouncements() 回傳的其中一則
  notice: { type: Object, required: true },
  // 點卡片要連到哪一頁
  to: { type: String, required: true },
})

// 各類型「進行中」的說法
const ONGOING_WORDS = {
  construction: '施工中',
  maintenance: '維護中',
  activity: '活動中',
  other: '進行中',
}

// '2026-10-01T14:00' → '2026-10-01'
const startDate = computed(() => props.notice.startAt.split('T')[0])
const endDate = computed(() => props.notice.endAt.split('T')[0])

// 右上角的標籤文字，例如「施工中」「明天開始」「3 天後開始」
const statusText = computed(() => {
  if (props.notice.isOngoing) return ONGOING_WORDS[props.notice.type]
  const days = diffDays(MOCK_TODAY, startDate.value)
  if (days <= 0) return '今天開始'
  if (days === 1) return '明天開始'
  return `${days} 天後開始`
})
</script>

<template>
  <RouterLink :to="to" class="block space-y-3 rounded-xl bg-card p-4 shadow-card">
    <div class="flex items-center gap-1">
      <h3 class="min-w-0 flex-1 type-greeting">{{ notice.title }}</h3>
      <!-- 進行中用橘色（和「處理中」同一種），還沒開始的用灰色 -->
      <Badge :variant="notice.isOngoing ? 'secondary' : 'outline'">{{ statusText }}</Badge>
    </div>
    <!-- 有影響範圍說明就顯示影響範圍；活動類沒有，改顯示地點 -->
    <div v-if="notice.impact" class="space-y-0.5 py-2">
      <p class="type-body-strong">影響範圍：{{ notice.scopeLabel }}</p>
      <p class="type-body">{{ notice.impact }}</p>
    </div>
    <div v-else-if="notice.place" class="py-2">
      <p class="type-body-strong">地點：{{ notice.place }}</p>
    </div>
    <p class="text-base leading-5 text-muted-foreground">
      {{ formatDateRange(startDate, endDate) }}
    </p>
  </RouterLink>
</template>
