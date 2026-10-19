<script setup>
// 住戶端・通知：頂部鈴鐺點進來
// 樣式沿用管委會端的通知頁（views/committee/NotificationsView.vue）：依今天、昨天、更早分組，
// 第一組右邊有「全部已讀」，每一則沒有圖示，時間用 14px 小字
// 已讀：點進某一則，那一則的紅點消失；按「全部已讀」全部消失，頂部鈴鐺的紅點也跟著消失
// 點了去哪裡（住戶端沒有公告詳情頁）：
//   公告 → 在這一頁打開公告詳情彈窗（和首頁、社區公告頁同一個彈窗）
//   通報 → 通報詳情
//   會議 → 「我的留言」：住戶收到的會議通知都是「管委會回覆了你的留言」
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import NoticeDetailDialog from '@/components/notice/NoticeDetailDialog.vue'
import { Empty, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getAnnouncementById,
  getCurrentUser,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const router = useRouter()

const loading = ref(true)
const notifications = ref([]) // 全部的通知（新的在前，已經分好組）
const userId = ref('')

onMounted(async () => {
  const user = await getCurrentUser('resident')
  userId.value = user.id
  notifications.value = await getNotifications(user.id, 'resident')
  loading.value = false
})

// 依假 API 給的 group 分成幾組；沒有通知的組不顯示
const GROUPS = [
  { value: 'today', label: '今天' },
  { value: 'yesterday', label: '昨天' },
  { value: 'earlier', label: '更早' },
]
const groups = computed(() =>
  GROUPS.map((group) => ({ ...group, items: notifications.value.filter((item) => item.group === group.value) })).filter(
    (group) => group.items.length,
  ),
)

// 還有沒有沒讀的；都讀過了就不顯示「全部已讀」
const hasUnread = computed(() => notifications.value.some((item) => !item.read))

// 全部已讀：畫面上先變成已讀，再告訴假 API 記下來
async function markAllRead() {
  notifications.value = notifications.value.map((item) => ({ ...item, read: true }))
  await markAllNotificationsRead(userId.value, 'resident')
}

// 公告詳情彈窗：detailNotice 是要顯示哪一則，detailOpen 是彈窗開還是關
const detailNotice = ref(null)
const detailOpen = ref(false)

// 點某一則：先設為已讀（畫面上的紅點馬上消失），再看是哪一種去對的地方
async function openItem(item) {
  if (!item.read) {
    item.read = true
    markNotificationRead(item.id)
  }
  const { type, id } = item.link
  if (type === 'case') router.push(`/resident/reports/${id}`)
  if (type === 'meeting') router.push('/resident/me/comments')
  if (type === 'announcement') {
    const notice = await getAnnouncementById(id, 'resident')
    // 已經撤回的公告住戶看不到，跳個提示就好
    if (!notice || notice.status !== 'published') {
      toast('這則公告已經撤回了')
      return
    }
    detailNotice.value = notice
    detailOpen.value = true
  }
}
</script>

<template>
  <div class="space-y-4 px-5 pt-4 pb-5">
    <template v-if="loading">
      <Skeleton class="h-[360px] rounded-xl" />
      <Skeleton class="h-[180px] rounded-xl" />
    </template>

    <!-- 沒有通知 -->
    <Empty v-else-if="!groups.length" class="gap-1 pt-16">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">目前沒有通知</EmptyTitle>
    </Empty>

    <!-- 每一組：組名（今天、昨天、更早）＋一張卡片 -->
    <section v-for="(group, groupIndex) in groups" v-else :key="group.value" class="space-y-2">
      <div class="flex min-h-11 items-center justify-between gap-3">
        <h2 class="type-date text-muted-foreground">{{ group.label }}</h2>
        <!-- 第一組的右邊；after 把可以點的範圍補到 44px -->
        <button
          v-if="groupIndex === 0 && hasUnread"
          type="button"
          class="relative type-link text-foreground after:absolute after:-inset-x-2 after:-inset-y-2.5"
          @click="markAllRead"
        >
          全部已讀
        </button>
      </div>
      <div class="rounded-xl bg-card px-4 py-1 shadow-card">
        <template v-for="(item, index) in group.items" :key="item.id">
          <Separator v-if="index > 0" />
          <!-- 整列都可以點；公告是打開彈窗、其他是換頁，所以用 button 自己決定去哪裡 -->
          <button type="button" class="flex w-full items-start gap-3 py-3 text-left" @click="openItem(item)">
            <div class="min-w-0 flex-1 space-y-0.5">
              <p class="type-body-strong text-foreground">{{ item.title }}</p>
              <!-- line-clamp-1：內容太長只顯示一行，後面變成… -->
              <p class="line-clamp-1 type-date text-muted-foreground">{{ item.body }}</p>
              <!-- 時間用備註的小字（type-note，14px），和管委會端一樣 -->
              <p class="type-note text-muted-foreground">{{ item.timeText }}</p>
            </div>
            <!-- 沒讀過的有紅點；aria-label 讓螢幕閱讀器念出「未讀」 -->
            <span v-if="!item.read" class="mt-2 size-2 shrink-0 rounded-full bg-destructive" aria-label="未讀" />
          </button>
        </template>
      </div>
    </section>

    <!-- 公告詳情彈窗：點了公告的通知才會打開 -->
    <NoticeDetailDialog v-model:open="detailOpen" :notice="detailNotice" />
  </div>
</template>
