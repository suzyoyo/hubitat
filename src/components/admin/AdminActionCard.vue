<script setup>
// 管委會端的待辦動作卡（對應 Figma 的 Admin/Action Card），「我的待辦」列表用
//   Kit 的變體 Footer 只做了「連結」：整張卡可以點，右下角「前往完成 ›」當提示（2026-10-13 改，原本是滿版藍色按鈕）
//   「按鈕」「文字」等有頁面用到再加
//   和 Kit 不一樣的地方同 AdminTodoCard：期限一律用徽章，緊急用淺紅底色
import { computed } from 'vue'
import { ChevronRightIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { formatFullDate, formatTime } from '@/lib/date'
import { todoDeadlineBadge } from '@/lib/todo'

const props = defineProps({
  // getMyTodos() 回傳的 items 其中一筆
  todo: { type: Object, required: true },
  // 點卡片要連到哪一頁
  to: { type: String, default: '' },
})

const deadlineBadge = computed(() => todoDeadlineBadge(props.todo))

// '2026-09-30T18:00' → '2026/09/30 18:00'；只有日期的就只顯示日期
function dateText(value) {
  const time = formatTime(value)
  return time ? `${formatFullDate(value)} ${time}` : formatFullDate(value)
}

// 到期資訊：有期限顯示到期日；沒有期限（例如需補資料的留存）改顯示建立日期
const dateLine = computed(() => {
  if (props.todo.dueAt) return `到期：${dateText(props.todo.dueAt)}`
  if (props.todo.createdAt) return `建立：${dateText(props.todo.createdAt)}`
  return ''
})
</script>

<template>
  <!-- 緊急的底色還沒有語意色，先用色階 red-50（和 AdminTodoCard 一樣） -->
  <RouterLink :to="to" class="block space-y-3 rounded-xl p-4 shadow-card" :class="todo.isUrgent ? 'bg-red-50' : 'bg-card'">
    <div class="flex items-center gap-1.5">
      <p class="min-w-0 flex-1 type-date text-muted-foreground">{{ todo.kindLabel }}</p>
      <Badge v-if="deadlineBadge" :variant="deadlineBadge.variant">{{ deadlineBadge.text }}</Badge>
    </div>
    <h3 class="type-card-title text-foreground">{{ todo.title }}</h3>
    <div class="space-y-1">
      <p class="type-body text-muted-foreground">{{ todo.hint }}</p>
      <p v-if="dateLine" class="type-body text-muted-foreground">{{ dateLine }}</p>
    </div>
    <!-- 只是提示「可以點」，整張卡本身就是連結 -->
    <p class="flex items-center justify-end gap-1 type-link text-foreground">
      前往完成
      <ChevronRightIcon class="size-4" />
    </p>
  </RouterLink>
</template>
