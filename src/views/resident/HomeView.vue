<script setup>
// 住戶端首頁：問候列、我的通報、公告與動態
import { computed, onMounted, ref } from 'vue'
import AppGreeting from '@/components/app/AppGreeting.vue'
import HomeTour from '@/components/app/HomeTour.vue'
import NotificationReminder from '@/components/feedback/NotificationReminder.vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import MeetingCard from '@/components/meeting/MeetingCard.vue'
import NoticeDetailDialog from '@/components/notice/NoticeDetailDialog.vue'
import NoticeHomeCard from '@/components/notice/NoticeHomeCard.vue'
import ReportCard from '@/components/report/ReportCard.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { greetingWord } from '@/lib/date'
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

// 公告詳情彈窗：detailNotice 是要顯示哪一則，detailOpen 是彈窗開還是關
const detailNotice = ref(null)
const detailOpen = ref(false)

// 點公告卡片時：記下是哪一則，然後打開彈窗
function openDetail(notice) {
  detailNotice.value = notice
  detailOpen.value = true
}

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
// 首頁放最新通報的那一筆（照通報時間，2026-10-16 和 013 定的）；getMyReports 是照最後更新時間排的
//   時間一樣時改比案件編號（|| 的意思：前面比出來是 0 就改用後面的比）：
//   假資料裡新送出的通報時間都是固定的 MOCK_NOW，連送兩筆時間會一樣；編號新的比較大（-001 → -002）
const latestReport = computed(
  () => reports.value.toSorted((a, b) => b.submittedAt.localeCompare(a.submittedAt) || b.id.localeCompare(a.id))[0],
)
// 公告只放「與我有關」的（全社區的，或影響到我住的那一棟）
const homeNotices = computed(() => allNotices.value.filter((item) => item.relatedToMe).slice(0, 2))
const latestMeeting = computed(() => meetings.value[0])

// 第一次進首頁的導覽：target 對到畫面上的 data-tour（鈴鐺在 AppHeader、分頁 tab-○○ 和「通報」在 BottomNav）
const TOUR_STEPS = [
  // 用敘述的口氣，講清楚這裡能做什麼、看得到什麼（2026-10-22 013）
  { target: 'bell', text: '有新通知時，鈴鐺上會出現紅點，點選可以查看所有通知。' },
  { target: 'new-report', text: '社區有問題時，按這兩個按鈕都可以通報。', place: 'above' }, // 放下面會蓋到右下角的「通報」
  { target: 'notices', text: '社區的公告和活動會列在這裡，點選「看全部」可以查看所有公告。', merge: true },
  { target: 'tab-home', text: '「首頁」可以看到你通報的處理進度和最新公告。' },
  { target: 'tab-files', text: '「社區」可以查看管委會報告、社區規約和設備的維修紀錄。' },
  { target: 'tab-me', text: '「我的」可以查看你的留言，調整字體大小和通知設定。' },
]

// 依現在幾點決定問候語：早安、午安或晚安（規則在 src/lib/date.js，三端的首頁共用）
const hello = greetingWord(MOCK_NOW)

// 問候列的兩行字：提醒「今天」社區有什麼事
const greeting = computed(() => {
  // 今天有的公告：已經開始、還沒結束的（假 API 已經把結束的拿掉了）
  const todayNotices = allNotices.value.filter((item) => item.startAt.split('T')[0] <= MOCK_TODAY)
  // 優先提醒與我有關的；沒有的話，提醒社區裡其他地方的
  const notice = todayNotices.find((item) => item.relatedToMe) ?? todayNotices[0]
  if (!notice) return { title: `${hello}！`, subtitle: '今天社區一切平安喔！' }
  return { title: `${hello}！今天有`, subtitle: `${notice.title}喔！` }
})
</script>

<template>
  <div>
    <AppGreeting v-if="!loading" :title="greeting.title" :subtitle="greeting.subtitle" />
    <Skeleton v-else class="h-[104px] rounded-t-none rounded-b-3xl" />

    <div class="space-y-8 px-5 pt-5">
      <!-- 還沒開通知就一直提醒，但不擋（2026-10-18 013） -->
      <NotificationReminder />

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
        <!-- 品牌輔色（紅 500，和右下角「通報」按鈕同色，2026-10-18 013）：只有這一顆，不另外做按鈕樣式 -->
        <Button as-child data-tour="new-report" class="w-full bg-warning text-white inset-shadow-[0_-1px_0_var(--warning-strong)] [a]:hover:bg-warning/80">
          <RouterLink to="/resident/reports/new">新增通報</RouterLink>
        </Button>
      </section>

      <section class="space-y-3">
        <SectionHeader title="公告與動態" to="/resident/announcements" data-tour="notices" />
        <template v-if="loading">
          <Skeleton class="h-[150px] rounded-xl" />
          <Skeleton class="h-[150px] rounded-xl" />
        </template>
        <template v-else>
          <!-- 導覽只亮標題和第一張卡片 -->
          <NoticeHomeCard
            v-for="(notice, i) in homeNotices"
            :key="notice.id"
            :notice="notice"
            :data-tour="i === 0 ? 'notices' : undefined"
            @detail="openDetail"
          />
          <MeetingCard
            v-if="latestMeeting"
            :meeting="latestMeeting"
            :to="`/resident/meetings/${latestMeeting.id}`"
          />
        </template>
      </section>
    </div>

    <!-- 公告詳情彈窗：平常看不到，detailOpen 變成 true 才會出現 -->
    <NoticeDetailDialog v-model:open="detailOpen" :notice="detailNotice" />

    <HomeTour :steps="TOUR_STEPS" storage-key="hubitat-tour-resident" :ready="!loading" />
  </div>
</template>
