<script setup>
// 管委會端的待辦動作卡（對應 Figma 的 Admin/Action Card），「我的待辦」列表用
//   Kit 的變體 Footer 只做了「按鈕」；「文字」（例如「等待交辦人確認」）等有頁面用到再加
//   和 Kit 不一樣的地方同 AdminTodoCard：期限一律用徽章，緊急用淺紅底色
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatFullDate, formatTime } from '@/lib/date'
import { todoDeadlineBadge } from '@/lib/todo'

const props = defineProps({
  // getMyTodos() 回傳的 items 其中一筆
  todo: { type: Object, required: true },
  // 按「前往完成」要連到哪一頁
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
  <!-- 卡片裡有按鈕，所以整張卡不做成連結，要前往就按下面的按鈕 -->
  <!-- 緊急的底色還沒有語意色，先用色階 red-50（和 AdminTodoCard 一樣） -->
  <article class="space-y-3 rounded-xl p-4 shadow-card" :class="todo.isUrgent ? 'bg-red-50' : 'bg-card'">
    <div class="flex items-center gap-1.5">
      <p class="min-w-0 flex-1 type-date text-muted-foreground">{{ todo.kindLabel }}</p>
      <Badge v-if="deadlineBadge" :variant="deadlineBadge.variant">{{ deadlineBadge.text }}</Badge>
    </div>
    <h3 class="type-card-title text-foreground">{{ todo.title }}</h3>
    <div class="space-y-1">
      <p class="type-body text-muted-foreground">{{ todo.hint }}</p>
      <p v-if="dateLine" class="type-body text-muted-foreground">{{ dateLine }}</p>
    </div>
    <Separator />
    <Button as-child class="w-full">
      <RouterLink :to="to">前往完成</RouterLink>
    </Button>
  </article>
</template>
