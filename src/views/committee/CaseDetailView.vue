<script setup>
// 管委會端・案件詳情：一件案件的基本資料、通報內容、廠商、處理紀錄（設計稿 1134:17558）
// 這一版只有「看」；底部的發布社區公告、交辦、完工標記與結案要新的假 API，之後再做
import { ImageIcon, VideoIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { caseStatusBadge } from '@/components/admin/caseStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate, formatTime } from '@/lib/date'
import { getCaseById } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// 網址是 /committee/cases/:id，所以 route.params.id 就是案件編號
const route = useRoute()

const loading = ref(true)
// 這一件案件；編號不存在時，假 API 會回傳 undefined
const item = ref(null)

onMounted(async () => {
  item.value = await getCaseById(route.params.id)
  loading.value = false
})

const statusBadge = computed(() => caseStatusBadge(item.value))

// '2026-09-25T10:12' → '2026/09/25 10:12'（管委會端的日期有年份）
function dateTimeText(value) {
  return `${formatFullDate(value)} ${formatTime(value)}`
}

// 第一張卡下面的資訊列：label 是左邊的標籤，value 是右邊的內容
const basicRows = computed(() => {
  const data = item.value
  let deadline = '尚未設定'
  if (data.deadline) {
    deadline = formatFullDate(data.deadline)
    if (data.isOverdue) deadline += `（已逾期 ${data.overdueDays} 天）`
  }
  return [
    { label: '負責人', value: data.assigneeLabel || '尚未指派' },
    { label: '附議', value: data.supporterCount ? `${data.supporterCount} 戶` : '無' },
    { label: '處理期限', value: deadline },
  ]
})

// 看副檔名判斷是不是影片，例如 .mp4、.mov（和通報的照片格同一個規則）
function isVideo(name) {
  return /\.(mp4|mov|m4v|webm|avi)$/i.test(name)
}
</script>

<template>
  <div class="space-y-4 px-5 pt-4 pb-5">
    <template v-if="loading">
      <Skeleton class="h-[208px] rounded-xl" />
      <Skeleton class="h-[137px] rounded-xl" />
      <Skeleton class="h-[200px] rounded-xl" />
    </template>

    <!-- 找不到這件案件 -->
    <Empty v-else-if="!item" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這件案件</EmptyTitle>
      <EmptyDescription class="type-body">可能已經刪除，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink to="/committee/cases">回到案件列表</RouterLink>
      </Button>
    </Empty>

    <template v-else>
      <!-- 基本資料 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="space-y-1">
          <h2 class="type-card-title text-foreground">{{ item.title }}</h2>
          <p class="type-date text-muted-foreground">#{{ item.id }}</p>
        </div>
        <div class="flex items-center justify-between gap-2">
          <Badge variant="outline">{{ item.areaName }}</Badge>
          <Badge :variant="statusBadge.variant">{{ statusBadge.text }}</Badge>
        </div>
        <div v-for="row in basicRows" :key="row.label" class="flex items-baseline gap-3">
          <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
          <p class="min-w-0 flex-1 text-right type-body-strong text-foreground">{{ row.value }}</p>
        </div>
      </section>

      <!-- 通報人寫的描述 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">住戶通報描述</h2>
        <p class="type-body text-muted-foreground">{{ item.description ? `「${item.description}」` : '沒有填寫' }}</p>
      </section>

      <!-- 現場照片／影片：假資料只有檔名，先顯示圖示和檔名 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">現場照片／影片</h2>
        <div v-if="item.photos.length" class="grid grid-cols-2 gap-3">
          <div
            v-for="name in item.photos"
            :key="name"
            class="flex h-[100px] flex-col items-center justify-center gap-1.5 rounded-lg bg-muted px-2"
          >
            <component :is="isVideo(name) ? VideoIcon : ImageIcon" class="size-7 text-muted-foreground" />
            <p class="w-full truncate text-center type-date text-muted-foreground">{{ name }}</p>
          </div>
        </div>
        <p v-else class="type-body text-muted-foreground">沒有照片或影片</p>
      </section>

      <!-- 廠商 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">廠商履歷</h2>
        <div class="space-y-1 rounded-lg bg-muted p-3.5">
          <p class="type-body-strong text-foreground">{{ item.vendorName || '尚未派廠商' }}</p>
          <p v-if="!item.vendorName" class="type-date text-muted-foreground">
            指派後可在這裡查看該廠商的履歷與過往施工紀錄
          </p>
        </div>
      </section>

      <!-- 處理進度與留痕：由舊到新 -->
      <section class="space-y-3.5 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">處理進度與留痕</h2>
        <template v-for="(log, index) in item.logs" :key="`${log.at}-${index}`">
          <Separator v-if="index > 0" />
          <div class="flex gap-3">
            <p class="w-[88px] shrink-0 type-date text-muted-foreground">{{ dateTimeText(log.at) }}</p>
            <div class="min-w-0 flex-1 space-y-0.5">
              <p class="type-body-strong text-foreground">{{ log.label }}</p>
              <p class="type-body text-muted-foreground">{{ log.text }}</p>
            </div>
          </div>
        </template>
      </section>

      <!-- 完工紀錄：完工了才有 -->
      <section v-if="item.completion" class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">完工紀錄</h2>
        <p class="type-date text-muted-foreground">{{ dateTimeText(item.completion.at) }}</p>
        <p class="type-body text-foreground">{{ item.completion.note }}</p>
        <p v-if="item.completion.photos.length" class="type-date text-muted-foreground">
          附 {{ item.completion.photos.length }} 張照片
        </p>
      </section>

      <!-- 施工日誌：假資料還沒有，先顯示空的 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">施工日誌</h2>
        <div class="space-y-1 rounded-lg bg-muted p-3.5">
          <p class="type-body-strong text-foreground">尚無施工日誌</p>
          <p class="type-date text-muted-foreground">施工中拍下收據或單據，系統自動帶入日期與記錄者。</p>
        </div>
      </section>
    </template>
  </div>
</template>
