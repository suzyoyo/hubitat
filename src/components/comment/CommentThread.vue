<script setup>
// 一串留言（對應 Kit 的 Comment/Thread）：會議名稱＋狀態徽章、我的留言，下面接管委會的回覆
// 變體 Status：
//   已回覆 → 下面是管委會回覆的泡泡
//   待回覆 → 下面是一行灰字「管委會尚未回覆…」
// 傳 getMyComments() 回傳的一筆
import CommentBubble from '@/components/comment/CommentBubble.vue'
import { Badge } from '@/components/ui/badge'

defineProps({
  comment: { type: Object, required: true },
})
</script>

<template>
  <div class="space-y-3 rounded-xl bg-card p-4 shadow-card">
    <div class="flex items-center gap-2">
      <h3 class="flex-1 type-card-title">{{ comment.meetingTitle }}</h3>
      <!-- 徽章顏色照住戶端的規則（dev-guide 第 5 節）：待回覆＝還在等、跟你有關（藍）；已回覆＝已經結束（灰） -->
      <Badge :variant="comment.isReplied ? 'outline' : 'default'">
        {{ comment.isReplied ? '已回覆' : '待回覆' }}
      </Badge>
    </div>
    <CommentBubble from="mine" :at="comment.at" :text="comment.text" />
    <CommentBubble v-if="comment.isReplied" from="reply" :at="comment.reply.at" :text="comment.reply.text" />
    <p v-else class="type-date text-muted-foreground">管委會尚未回覆，回覆後好彼管家會通知你</p>
  </div>
</template>
