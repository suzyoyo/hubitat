<script setup>
// 管委會端的待辦卡（對應 Figma 的 Admin/Todo Card）
//   和 Kit 不一樣的地方：
//   1. 期限一律用徽章，照 dev-guide 第 5 節管理端的顏色規則（Kit 的「一般」是灰字）
//   2. 緊急（isUrgent）用淺紅底色標示，不靠徽章（Kit 的「緊急」是紅色徽章）
import { computed } from 'vue'
import { ChevronRightIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/date'

const props = defineProps({
  // getMyTodos() 回傳的 items 其中一筆
  todo: { type: Object, required: true },
  // 點卡片要連到哪一頁
  to: { type: String, default: '' },
})

// 期限徽章：逾期、今天到期是紅色，還沒到期是橘色；沒有期限就不顯示
const deadlineBadge = computed(() => {
  const days = props.todo.daysLeft
  if (days === null) return null
  if (days < 0) return { text: `逾期 ${-days} 天`, variant: 'destructive' }
  if (days === 0) return { text: '今日到期', variant: 'destructive' }
  return { text: `剩餘 ${days} 天`, variant: 'secondary' }
})
</script>

<template>
  <!-- 緊急的底色還沒有語意色，先用色階 red-50 -->
  <RouterLink
    :to="to"
    class="block space-y-3 rounded-xl p-4 shadow-card"
    :class="todo.isUrgent ? 'bg-red-50' : 'bg-card'"
  >
    <div class="flex items-center gap-2">
      <!-- 快到期的合約、文件沒有建立日期 -->
      <p v-if="todo.createdAt" class="type-date text-muted-foreground">{{ formatDate(todo.createdAt) }}</p>
      <Badge v-if="deadlineBadge" :variant="deadlineBadge.variant" class="ml-auto">{{ deadlineBadge.text }}</Badge>
      <ChevronRightIcon class="size-4 shrink-0" :class="{ 'ml-auto': !deadlineBadge }" />
    </div>
    <h3 class="type-card-title text-foreground">{{ todo.title }}</h3>
    <p class="type-body text-muted-foreground">{{ todo.hint }}</p>
  </RouterLink>
</template>
