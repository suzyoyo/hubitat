<script setup>
// 住戶端首頁：問候列、我的通報、公告與動態
import { computed, onMounted, ref } from 'vue'
import AppGreeting from '@/components/app/AppGreeting.vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import MeetingCard from '@/components/meeting/MeetingCard.vue'
import NoticeHomeCard from '@/components/notice/NoticeHomeCard.vue'
import ReportCard from '@/components/report/ReportCard.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MOCK_NOW,
  MOCK_TODAY,
  getAnnouncements,
  getCurrentUser,
  getMeetings,
  getMyReports,
} from '@/mocks/api'

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
const reports = ref([]) // 我進行中的通報
const allNotices = ref([]) // 住戶看得到的所有公告
const meetings = ref([]) // 已發布的會議

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('resident')
  // Promise.all：三種資料同時去拿，全部回來才往下走，比一個一個等來得快
  const [reportList, noticeList, meetingList] = await Promise.all([
    getMyReports(user.id, 'active'),
    getAnnouncements(user.id),
    getMeetings('resident', user.id),
  ])
  reports.value = reportList
  allNotices.value = noticeList
  meetings.value = meetingList
  loading.value = false
})

// 首頁每一區只放最前面的幾筆，其餘的按「看全部」
const latestReport = computed(() => reports.value[0])
// 公告只放「與我有關」的（全社區的，或影響到我住的那一棟）
const homeNotices = computed(() => allNotices.value.filter((item) => item.relatedToMe).slice(0, 2))
const latestMeeting = computed(() => meetings.value[0])

// 依現在幾點決定問候語
const hello = computed(() => {
  const hour = Number(MOCK_NOW.split('T')[1].split(':')[0]) // '2026-10-01T13:42' → 13
  if (hour < 11) return '早安'
  if (hour < 18) return '午安'
  return '晚安'
})

// 問候列的兩行字：提醒「今天」社區有什麼事
const greeting = computed(() => {
  // 今天有的公告：已經開始、還沒結束的（假 API 已經把結束的拿掉了）
  const todayNotices = allNotices.value.filter((item) => item.startAt.split('T')[0] <= MOCK_TODAY)
  // 優先提醒與我有關的；沒有的話，提醒社區裡其他地方的
  const notice = todayNotices.find((item) => item.relatedToMe) ?? todayNotices[0]
  if (!notice) return { title: `${hello.value}！`, subtitle: '今天社區一切平安喔！' }
  return { title: `${hello.value}！今天有`, subtitle: `${notice.title}喔！` }
})
</script>

<template>
  <div>
    <AppGreeting v-if="!loading" :title="greeting.title" :subtitle="greeting.subtitle" />
    <Skeleton v-else class="h-[104px] rounded-t-none rounded-b-3xl" />

    <div class="space-y-8 px-5 pt-5">
      <section class="space-y-3">
        <SectionHeader title="我的通報" to="/resident/reports" />
        <Skeleton v-if="loading" class="h-[150px] rounded-xl" />
        <!-- 沒有進行中的通報時，report 是 undefined，卡片會顯示「目前無通報」 -->
        <ReportCard
          v-else
          :report="latestReport"
          :to="latestReport ? `/resident/reports/${latestReport.id}` : ''"
        />
        <!-- as-child：讓 Button 的外觀套在裡面的 RouterLink 上，按下去就是換頁 -->
        <Button as-child class="w-full">
          <RouterLink to="/resident/report">新增通報</RouterLink>
        </Button>
      </section>

      <section class="space-y-3">
        <SectionHeader title="公告與動態" to="/resident/announcements" />
        <template v-if="loading">
          <Skeleton class="h-[150px] rounded-xl" />
          <Skeleton class="h-[150px] rounded-xl" />
        </template>
        <template v-else>
          <NoticeHomeCard
            v-for="notice in homeNotices"
            :key="notice.id"
            :notice="notice"
            to="/resident/announcements"
          />
          <MeetingCard
            v-if="latestMeeting"
            :meeting="latestMeeting"
            :to="`/resident/meetings/${latestMeeting.id}`"
          />
        </template>
      </section>
    </div>
  </div>
</template>
