<script setup>
// 管委會端・通知：頂部鈴鐺點進來（設計稿 1134:17656、空狀態 1134:18244）
// 依今天、昨天、更早分組；點一則就到那筆資料的頁面；第一組右邊有「全部已讀」
// 已讀（2026-10-15）：點進某一則，那一則的紅點消失；按「全部已讀」全部消失，頂部鈴鐺的紅點也跟著消失
// 每一則前面沒有圖示（2026-10-15 suzy 決定拿掉；設計稿有，Figma 要跟著改）
import { computed, onMounted, ref } from 'vue'
import { Empty, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getCurrentUser, getNotifications, markAllNotificationsRead, markNotificationRead } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const loading = ref(true)
const notifications = ref([]) // 全部的通知（新的在前，已經分好組）
const userId = ref('')

onMounted(async () => {
  const user = await getCurrentUser('committee')
  userId.value = user.id
  notifications.value = await getNotifications(user.id, 'committee')
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
  await markAllNotificationsRead(userId.value, 'committee')
}

// 點進某一則：這一則設為已讀（同時連到那筆資料的頁面）
function openItem(item) {
  if (!item.read) markNotificationRead(item.id)
}

// ── 每一則的連結 ────────────────────────
// 資料種類對應到哪一種頁面，例如 { type: 'case', id: 'CASE-1' } → '/committee/cases/CASE-1'
const LINK_PATHS = {
  announcement: 'announcements',
  meeting: 'meetings',
  proposal: 'proposals',
  task: 'tasks',
  contract: 'contracts',
  case: 'cases',
}
function linkOf(item) {
  return `/committee/${LINK_PATHS[item.link.type]}/${item.link.id}`
}
</script>

<template>
  <div class="space-y-4 px-5 pt-4 pb-5">
    <template v-if="loading">
      <Skeleton class="h-[360px] rounded-xl" />
      <Skeleton class="h-[180px] rounded-xl" />
    </template>

    <!-- 沒有通知（或沒有未讀的） -->
    <Empty v-else-if="!groups.length" class="gap-1 pt-16">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="330" class="h-[120px] w-auto" />
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
          <!-- 整列都可以點，到那筆資料的頁面 -->
          <RouterLink :to="linkOf(item)" class="flex items-start gap-3 py-3" @click="openItem(item)">
            <div class="min-w-0 flex-1 space-y-0.5">
              <p class="type-body-strong text-foreground">{{ item.title }}</p>
              <!-- line-clamp-1：內容太長只顯示一行，後面變成… -->
              <p class="line-clamp-1 type-date text-muted-foreground">{{ item.body }}</p>
              <!-- 時間用備註的小字（type-note，14px，2026-10-15 suzy 決定），和內文分出層級 -->
              <p class="type-note text-muted-foreground">{{ item.timeText }}</p>
            </div>
            <!-- 沒讀過的有紅點；aria-label 讓螢幕閱讀器念出「未讀」 -->
            <span v-if="!item.read" class="mt-2 size-2 shrink-0 rounded-full bg-destructive" aria-label="未讀" />
          </RouterLink>
        </template>
      </div>
    </section>
  </div>
</template>
