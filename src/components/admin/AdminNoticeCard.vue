<script setup>
// 管委會首頁的橫向小卡（對應 Figma 的 Admin/Notice Card），有兩種：
//   公告：    傳 announcement（上排類型徽章＋時間、下排時程）
//   住戶意見：傳 opinion（下排留言日期）
import { computed } from 'vue'
import { ChevronRightIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { MOCK_TODAY } from '@/mocks/api'
import { ANNOUNCEMENT_TYPES } from '@/mocks/data/announcements'
import { diffDays, formatDate, formatDateRange } from '@/lib/date'

const props = defineProps({
  // getManagedAnnouncements() 回傳的其中一筆
  announcement: { type: Object, default: null },
  // getResidentOpinions() 回傳的其中一筆；有傳 announcement 時不用傳
  opinion: { type: Object, default: null },
  // 點卡片要連到哪一頁
  to: { type: String, default: '' },
})

// 公告右上角的時間，例如「進行中」「今天」「5 天後」
const announcementWhen = computed(() => {
  if (props.announcement.isOngoing) return '進行中'
  const days = diffDays(MOCK_TODAY, props.announcement.startAt.split('T')[0])
  return days <= 0 ? '今天' : `${days} 天後`
})
</script>

<template>
  <RouterLink :to="to" class="block w-[260px] shrink-0 space-y-3 rounded-xl bg-card p-4 shadow-card">
    <!-- 公告 -->
    <template v-if="announcement">
      <div class="flex items-center justify-between">
        <Badge variant="outline">{{ ANNOUNCEMENT_TYPES[announcement.type].label }}</Badge>
        <p class="type-date text-muted-foreground">{{ announcementWhen }}</p>
      </div>
      <h3 class="type-card-title text-foreground">{{ announcement.title }}</h3>
      <p class="line-clamp-2 type-body text-muted-foreground">{{ announcement.content }}</p>
      <div class="flex items-center justify-between">
        <p class="type-date text-muted-foreground">
          時程 {{ formatDateRange(announcement.startAt.split('T')[0], announcement.endAt.split('T')[0]) }}
        </p>
        <ChevronRightIcon class="size-3.5 shrink-0" />
      </div>
    </template>

    <!-- 住戶意見：標題是留言所在的會議 -->
    <template v-else>
      <h3 class="type-card-title text-foreground">{{ opinion.meetingTitle }}</h3>
      <p class="line-clamp-2 type-body text-muted-foreground">{{ opinion.text }}</p>
      <div class="flex items-center justify-between">
        <p class="type-date text-muted-foreground">{{ formatDate(opinion.at) }}</p>
        <ChevronRightIcon class="size-3.5 shrink-0" />
      </div>
    </template>
  </RouterLink>
</template>
