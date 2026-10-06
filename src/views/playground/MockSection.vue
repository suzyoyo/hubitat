<script setup>
// 假資料：示範怎麼從假 API 取得資料並顯示（資料在 src/mocks/）
import { onMounted, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatDateRange, formatDateTime } from '@/lib/date'
import { getAnnouncements, getCurrentUser, getMeetings, getMyReports } from '@/mocks/api'
import { ANNOUNCEMENT_TYPES } from '@/mocks/data/announcements'
import { MEETING_TYPES } from '@/mocks/data/meetings'
import { REPORT_STATUSES } from '@/mocks/data/reports'

// 畫面要用的資料，一開始都是空的
const loading = ref(true)
const user = ref(null)
const reports = ref([])
const announcements = ref([])
const meetings = ref([])

// async / await：等資料回來再繼續往下執行
async function loadData() {
  loading.value = true
  user.value = await getCurrentUser('resident')
  // Promise.all：三個請求同時送出，全部回來後一起拿結果（比一個一個等快）
  const [reportList, announcementList, meetingList] = await Promise.all([
    getMyReports(user.value.id, 'active'),
    getAnnouncements(),
    getMeetings(),
  ])
  reports.value = reportList
  announcements.value = announcementList
  meetings.value = meetingList
  loading.value = false
}

// onMounted：元件顯示到畫面上之後，自動執行一次
onMounted(loadData)
</script>

<template>
  <section id="mock" class="scroll-mt-40 space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold">假資料</h2>
      <Button size="sm" variant="outline" @click="loadData">重新載入</Button>
    </div>

    <!-- 載入中：顯示灰色佔位框 -->
    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-5 w-1/2" />
      <Skeleton class="h-20 w-full" />
      <Skeleton class="h-20 w-full" />
    </div>

    <!-- 載入完成 -->
    <template v-else>
      <div class="space-y-1">
        <h3 class="text-sm font-medium text-muted-foreground">目前使用者 getCurrentUser()</h3>
        <p class="type-body">{{ user.unit }} {{ user.name }}</p>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          進行中的通報 getMyReports()：{{ reports.length }} 件
        </h3>
        <div v-for="report in reports" :key="report.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ report.location }}｜{{ report.subject }}</p>
            <!-- 用 status 當 key，到 REPORT_STATUSES 查出要顯示的文字 -->
            <Badge variant="secondary" class="shrink-0">{{ REPORT_STATUSES[report.status].label }}</Badge>
          </div>
          <!-- at(-1)：陣列的最後一筆，也就是最新的處理進度 -->
          <p class="type-date text-text-secondary">{{ report.timeline.at(-1).text }}</p>
          <p class="type-date text-muted-foreground">更新於 {{ formatDateTime(report.updatedAt) }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          社區公告 getAnnouncements()：{{ announcements.length }} 則
        </h3>
        <div v-for="item in announcements" :key="item.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ item.title }}</p>
            <Badge variant="outline" class="shrink-0">{{ ANNOUNCEMENT_TYPES[item.type].label }}</Badge>
          </div>
          <p class="type-date text-muted-foreground">
            {{ formatDateRange(item.startDate, item.endDate) }}・{{ item.scope }}
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          會議紀錄 getMeetings()：{{ meetings.length }} 筆
        </h3>
        <div v-for="meeting in meetings" :key="meeting.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ meeting.title }}</p>
            <Badge variant="outline" class="shrink-0">{{ MEETING_TYPES[meeting.type].label }}</Badge>
          </div>
          <p class="type-date text-text-secondary">{{ meeting.keyResolutions }}</p>
          <p class="type-date text-muted-foreground">{{ formatDate(meeting.heldAt) }} 召開</p>
        </div>
      </div>
    </template>
  </section>
</template>
