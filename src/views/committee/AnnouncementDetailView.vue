<script setup>
// 管委會端・公告詳情：一則公告的時間、地點、內容說明與發布紀錄
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate, formatTime } from '@/lib/date'
import { getAnnouncementById } from '@/mocks/api'
import { ANNOUNCEMENT_STATUSES } from '@/mocks/data/announcements'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// useRoute()：取得目前路由的資訊
// 網址是 /committee/announcements/:id，所以 route.params.id 就是這則公告的編號
const route = useRoute()

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 這一則公告。編號不存在時，假 API 會回傳 undefined
const announcement = ref(null)

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  announcement.value = await getAnnouncementById(route.params.id, 'committee')
  loading.value = false
})

// 狀態徽章的顏色（dev-guide 第 5 節管理端的規則）
//   待補、已退回 → 橘：要發布的人動手
//   待審核       → 藍：流程進行中，在等審核的人
//   已發布、已撤回 → 灰：正常或已結束
const STATUS_BADGE_VARIANTS = {
  draft: 'secondary',
  rejected: 'secondary',
  pending: 'default',
  published: 'outline',
  withdrawn: 'outline',
}

// 日期時間（照管委會設計稿，有年份）
//   一天： '2026/10/12 09:00–12:00'
//   多天： '2026/10/05～2026/10/07'，有每日時段的話換行接在後面
function dateText(item) {
  const startDate = item.startAt.split('T')[0]
  const endDate = item.endAt.split('T')[0]
  if (startDate === endDate) {
    return `${formatFullDate(startDate)} ${formatTime(item.startAt)}–${formatTime(item.endAt)}`
  }
  const days = `${formatFullDate(startDate)}～${formatFullDate(endDate)}`
  return item.timeText ? `${days}\n${item.timeText}` : days
}

// 第一張卡下面的資訊列：label 是左邊的標籤，value 是右邊的內容
const basicRows = computed(() => [
  { label: '日期時間', value: dateText(announcement.value) },
  // 活動有地點就顯示地點，其他顯示影響範圍
  { label: '地點／影響範圍', value: announcement.value.place || announcement.value.scopeLabel },
  { label: '主辦／負責單位', value: announcement.value.organizer },
])

// '2026-10-01T14:20' → '2026/10/01 14:20'
function fullDateTime(value) {
  return `${formatFullDate(value)} ${formatTime(value)}`
}

// 審核欄的文字（審核規則見 docs/data-model.md 的公告）
function reviewText(item) {
  if (item.status === 'rejected') return `${item.reviewerLabel} 退回`
  if (item.reviewerLabel) return `${item.reviewerLabel} 審核通過`
  if (item.needsReview) return '待審核'
  return item.isUrgent ? '緊急公告，免審核' : '委員發布，免審核'
}

// 發布紀錄的資訊列；已撤回的公告多一列撤回紀錄
const publishRows = computed(() => {
  const item = announcement.value
  const rows = [
    { label: '發布者', value: item.authorLabel },
    { label: '發布時間', value: item.publishedAt ? fullDateTime(item.publishedAt) : '尚未發布' },
    { label: '審核', value: reviewText(item) },
  ]
  if (item.status === 'withdrawn') {
    rows.push({ label: '撤回', value: `${item.withdrawnByLabel}\n${fullDateTime(item.withdrawnAt)}` })
  }
  return rows
})
</script>

<template>
  <div class="space-y-4 px-5 pt-4">
    <!-- 載入中：三個和卡片差不多高的灰色方塊 -->
    <template v-if="loading">
      <Skeleton class="h-[200px] rounded-xl" />
      <Skeleton class="h-[120px] rounded-xl" />
      <Skeleton class="h-[150px] rounded-xl" />
    </template>

    <!-- 找不到這則公告 -->
    <Empty v-else-if="!announcement" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這則公告</EmptyTitle>
      <EmptyDescription class="type-body">可能已經刪除，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink to="/committee/home">回到首頁</RouterLink>
      </Button>
    </Empty>

    <!-- 有資料 -->
    <template v-else>
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-center justify-between">
          <Badge variant="outline">{{ announcement.typeLabel }}</Badge>
          <Badge :variant="STATUS_BADGE_VARIANTS[announcement.status]">
            {{ ANNOUNCEMENT_STATUSES[announcement.status].label }}
          </Badge>
        </div>
        <h2 class="type-card-title text-foreground">{{ announcement.title }}</h2>
        <Separator />
        <div v-for="row in basicRows" :key="row.label" class="flex items-baseline gap-3">
          <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
          <!-- whitespace-pre-line：值裡的 \n 會換行 -->
          <p class="min-w-0 flex-1 text-right whitespace-pre-line type-body-strong text-foreground">{{ row.value }}</p>
        </div>
      </section>

      <section class="space-y-3.5 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">內容說明</h2>
        <p class="type-body text-foreground">{{ announcement.content }}</p>
      </section>

      <section class="space-y-3.5 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">發布紀錄</h2>
        <div v-for="row in publishRows" :key="row.label" class="flex items-baseline gap-3">
          <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
          <p class="min-w-0 flex-1 text-right whitespace-pre-line type-body-strong text-foreground">{{ row.value }}</p>
        </div>
      </section>
    </template>
  </div>
</template>
