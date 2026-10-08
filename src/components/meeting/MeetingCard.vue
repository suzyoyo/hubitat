<script setup>
// 會議卡（對應 Figma 的 Meeting/Card）
// 目前只做 Summary：首頁的會議摘要。Latest（最新會議）等做到社區檔案再加
import { ChevronRightIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/date'

defineProps({
  // getMeetings() 回傳的其中一場
  meeting: { type: Object, required: true },
  // 「閱讀會議紀錄完整版」要連到哪一頁
  to: { type: String, required: true },
})
</script>

<template>
  <article class="overflow-hidden rounded-xl bg-card pt-4 shadow-card">
    <div class="space-y-3 px-4 pb-3">
      <!-- 標題在左、會議類型在右；標題太長會自己換行 -->
      <div class="flex items-start gap-3">
        <h3 class="min-w-0 flex-1 type-greeting">{{ meeting.title }}</h3>
        <Badge variant="outline">{{ meeting.typeLabel }}</Badge>
      </div>
      <div class="space-y-0.5 py-2">
        <p class="type-body-strong">重點決議</p>
        <p class="type-body">{{ meeting.summary }}</p>
      </div>
      <p class="type-date text-muted-foreground">{{ formatDate(meeting.heldAt) }} 召開</p>
    </div>
    <RouterLink
      :to="to"
      class="flex h-11 items-center justify-center gap-1 border-t bg-background text-sm leading-5 font-medium"
    >
      閱讀會議紀錄完整版
      <ChevronRightIcon class="size-4" />
    </RouterLink>
  </article>
</template>
