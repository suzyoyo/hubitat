<script setup>
// 一則留言（對應 Kit 的 Comment/Bubble）
// 變體 From：
//   mine  我的留言   → 淺灰底
//   reply 管委會回覆 → 淺藍底
// 住戶端不顯示回覆的委員姓名，一律寫「管委會回覆」
import { computed } from 'vue'
import { formatDateTime } from '@/lib/date'

const props = defineProps({
  // 'mine' 我的留言 / 'reply' 管委會回覆
  from: { type: String, default: 'mine' },
  // 留言時間，例如 '2026-09-30T14:20'
  at: { type: String, required: true },
  // 留言內容
  text: { type: String, required: true },
})

// 第一行：「我的留言・9/30 14:20」
const meta = computed(() => `${props.from === 'reply' ? '管委會回覆' : '我的留言'}・${formatDateTime(props.at)}`)
</script>

<template>
  <div class="space-y-2 rounded-xl p-3" :class="from === 'reply' ? 'bg-brand-subtle' : 'bg-background'">
    <p class="type-date text-muted-foreground">{{ meta }}</p>
    <!-- whitespace-pre-line：留言裡的換行照樣顯示 -->
    <p class="type-body-strong whitespace-pre-line">{{ text }}</p>
  </div>
</template>
