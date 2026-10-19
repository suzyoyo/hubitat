<script setup>
// 管委會端・緊急標示使用紀錄：誰在什麼時候把公告標成「緊急」（設計稿 1134:17759）
// 從「我的」→「交接與設定」點進來（主委、副主委才看得到那一列）
// 上面是本年度、本月的次數，下面是紀錄（新的在前）；點一筆到那則公告的詳情
import { onMounted, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate, formatTime } from '@/lib/date'
import { getUrgentLog } from '@/mocks/api'
import { ANNOUNCEMENT_TYPES } from '@/mocks/data/announcements'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const loading = ref(true)
// { items, yearCount, monthCount }
const log = ref(null)

onMounted(async () => {
  log.value = await getUrgentLog()
  loading.value = false
})

// '2026-10-01T13:40' → '2026/10/01 13:40'（管委會端的日期有年份）
function dateTimeText(value) {
  return `${formatFullDate(value)} ${formatTime(value)}`
}
</script>

<template>
  <div class="space-y-4 px-5 pt-4 pb-5">
    <template v-if="loading">
      <div class="flex gap-3">
        <Skeleton class="h-[92px] flex-1 rounded-xl" />
        <Skeleton class="h-[92px] flex-1 rounded-xl" />
      </div>
      <Skeleton class="h-[300px] rounded-xl" />
    </template>

    <template v-else>
      <!-- 次數：本年度、本月 -->
      <div class="flex gap-3">
        <div class="flex-1 space-y-0.5 rounded-xl bg-secondary p-4">
          <p class="type-date text-muted-foreground">本年度</p>
          <p class="type-title text-foreground">{{ log.yearCount }} 次</p>
        </div>
        <div class="flex-1 space-y-0.5 rounded-xl bg-secondary p-4">
          <p class="type-date text-muted-foreground">本月</p>
          <p class="type-title text-foreground">{{ log.monthCount }} 次</p>
        </div>
      </div>

      <!-- 還沒有人標過緊急 -->
      <Empty v-if="!log.items.length" class="gap-1 pt-10">
        <EmptyMedia>
          <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
          <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
        </EmptyMedia>
        <EmptyTitle class="type-greeting">還沒有緊急標示紀錄</EmptyTitle>
      </Empty>

      <!-- 紀錄：每一筆是時間＋公告類型、公告標題、標示者 -->
      <div v-else class="rounded-xl bg-card px-4 py-1 shadow-card">
        <template v-for="(item, index) in log.items" :key="item.id">
          <Separator v-if="index > 0" />
          <!-- 整列都可以點，到那則公告的詳情 -->
          <RouterLink :to="`/committee/announcements/${item.id}`" class="block space-y-1 py-3.5">
            <div class="flex items-center justify-between gap-2">
              <p class="type-date text-muted-foreground">{{ dateTimeText(item.at) }}</p>
              <Badge variant="outline">{{ ANNOUNCEMENT_TYPES[item.type].label }}</Badge>
            </div>
            <p class="type-body-strong text-foreground">{{ item.title }}</p>
            <p class="type-date text-muted-foreground">標示者：{{ item.authorLabel }}</p>
          </RouterLink>
        </template>
      </div>
    </template>
  </div>
</template>
