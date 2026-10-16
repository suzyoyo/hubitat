<script setup>
// 管委會端的待辦卡（對應 Figma 的 Admin/Todo Card）
//   和 Kit 不一樣的地方：
//   1. 期限一律用徽章，照 dev-guide 第 5 節管理端的顏色規則（Kit 的「一般」是灰字）
//   2. 沒有「緊急」：只有公告能標示緊急，待辦不會有（2026-10-16 拿掉 Kit 的「緊急」和淺紅底色）
import { computed } from 'vue'
import { ChevronRightIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/date'
import { todoDeadlineBadge } from '@/lib/todo'

const props = defineProps({
  // getMyTodos() 回傳的 items 其中一筆
  todo: { type: Object, required: true },
  // 點卡片要連到哪一頁
  to: { type: String, default: '' },
})

// 期限徽章的規則放在 src/lib/todo.js，AdminActionCard 也用同一份
const deadlineBadge = computed(() => todoDeadlineBadge(props.todo))
</script>

<template>
  <RouterLink :to="to" class="block space-y-3 rounded-xl bg-card p-4 shadow-card">
    <div class="flex items-center gap-2">
      <!-- 快到期的合約、文件沒有建立日期 -->
      <p v-if="todo.createdAt" class="type-date text-muted-foreground">{{ formatDate(todo.createdAt) }}</p>
      <Badge v-if="deadlineBadge" :variant="deadlineBadge.variant" class="ml-auto">{{ deadlineBadge.text }}</Badge>
      <ChevronRightIcon class="size-4 shrink-0" :class="{ 'ml-auto': !deadlineBadge }" />
    </div>
    <h3 class="type-card-title text-foreground">{{ todo.title }}</h3>
    <p class="truncate type-body text-muted-foreground">{{ todo.hint }}</p>
  </RouterLink>
</template>
