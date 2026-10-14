<script setup>
// 會議紀錄頁首（對應 Figma 的 Meeting/Head）：主辦單位、會議名稱、日期、出席人數
import { CalendarIcon, UsersIcon } from '@lucide/vue'
import { formatFullDate, weekdayIndex } from '@/lib/date'

const props = defineProps({
  // getMeetingById() 回傳的會議
  meeting: { type: Object, required: true },
})

// '2026-09-20T19:30' → '2026/09/20（日）'
const weekday = '日一二三四五六'[weekdayIndex(props.meeting.heldAt)]
const dateText = `${formatFullDate(props.meeting.heldAt)}（${weekday}）`
</script>

<template>
  <div class="space-y-1">
    <p class="type-date text-muted-foreground">社區管理委員會</p>
    <h2 class="type-title text-heading">{{ meeting.title }}</h2>
    <!-- 日期和出席人數：圖示＋文字 -->
    <p class="flex items-center gap-2 pt-1 type-body">
      <CalendarIcon class="size-5 shrink-0" />
      {{ dateText }}
    </p>
    <p class="flex items-center gap-2 type-body">
      <UsersIcon class="size-5 shrink-0" />
      {{ meeting.attendanceText }}
    </p>
  </div>
</template>
