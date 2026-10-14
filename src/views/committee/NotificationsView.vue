<script setup>
// 管委會端・通知：頂部鈴鐺點進來（設計稿 1134:17656、空狀態 1134:18244）
// 「全部／未讀」分頁，依今天、昨天、更早分組；點一則就到那筆資料的頁面
// 這一版只有「看」：「全部已讀」、點了變已讀要新的假 API，之後再做
import { CalendarIcon, CircleCheckIcon, FileTextIcon, MegaphoneIcon, MessageSquareIcon, TriangleAlertIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import IconTile from '@/components/common/IconTile.vue'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCurrentUser, getNotifications } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const loading = ref(true)
const notifications = ref([]) // 全部的通知（新的在前，已經分好組）

onMounted(async () => {
  const user = await getCurrentUser('committee')
  notifications.value = await getNotifications(user.id, 'committee')
  loading.value = false
})

// ── 分頁 ─────────────────────────────────────
const tab = ref('all') // 'all' 全部 / 'unread' 未讀
const TABS = [
  { value: 'all', label: '全部' },
  { value: 'unread', label: '未讀' },
]

// 依假 API 給的 group 分成幾組；沒有通知的組不顯示
const GROUPS = [
  { value: 'today', label: '今天' },
  { value: 'yesterday', label: '昨天' },
  { value: 'earlier', label: '更早' },
]
const groups = computed(() => {
  const shown = tab.value === 'unread' ? notifications.value.filter((item) => !item.read) : notifications.value
  return GROUPS.map((group) => ({ ...group, items: shown.filter((item) => item.group === group.value) })).filter(
    (group) => group.items.length,
  )
})

// ── 每一則的圖示和連結 ────────────────────────
// 依通知連到的資料種類決定圖示（設計稿：公告大聲公、提案文件、交辦打勾、合約日曆、案件警告）
const ICONS = {
  announcement: MegaphoneIcon,
  meeting: MessageSquareIcon,
  proposal: FileTextIcon,
  task: CircleCheckIcon,
  contract: CalendarIcon,
  case: TriangleAlertIcon,
}

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
    <!-- 全部／未讀（樣式和「我的待辦」的分頁一樣） -->
    <Tabs v-model="tab">
      <TabsList class="h-11! w-full rounded-xl border border-border bg-background p-1">
        <!-- before:…：按鈕看起來大約 35px 高，用看不見的 before 往上下各補 8px，可以點的範圍超過 44px -->
        <TabsTrigger
          v-for="item in TABS"
          :key="item.value"
          :value="item.value"
          class="text-base text-muted-foreground before:absolute before:inset-x-0 before:-inset-y-2 data-active:bg-secondary data-active:text-secondary-foreground"
        >
          {{ item.label }}
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <template v-if="loading">
      <Skeleton class="h-[360px] rounded-xl" />
      <Skeleton class="h-[180px] rounded-xl" />
    </template>

    <!-- 沒有通知（或沒有未讀的） -->
    <Empty v-else-if="!groups.length" class="gap-1 pt-16">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">目前沒有新通知</EmptyTitle>
      <EmptyDescription class="type-body">有新案件、審核或到期提醒時，好彼管家會第一時間告訴你</EmptyDescription>
    </Empty>

    <!-- 每一組：組名（今天、昨天、更早）＋一張卡片 -->
    <section v-for="group in groups" v-else :key="group.value" class="space-y-2">
      <h2 class="type-date text-muted-foreground">{{ group.label }}</h2>
      <div class="rounded-xl bg-card px-4 py-1 shadow-card">
        <template v-for="(item, index) in group.items" :key="item.id">
          <Separator v-if="index > 0" />
          <!-- 整列都可以點，到那筆資料的頁面 -->
          <RouterLink :to="linkOf(item)" class="flex items-start gap-3 py-3">
            <IconTile variant="square">
              <component :is="ICONS[item.link.type]" />
            </IconTile>
            <div class="min-w-0 flex-1 space-y-0.5">
              <p class="type-body-strong text-foreground">{{ item.title }}</p>
              <!-- line-clamp-1：內容太長只顯示一行，後面變成… -->
              <p class="line-clamp-1 type-date text-muted-foreground">{{ item.body }}</p>
              <p class="type-date text-muted-foreground">{{ item.timeText }}</p>
            </div>
            <!-- 沒讀過的有紅點；aria-label 讓螢幕閱讀器念出「未讀」 -->
            <span v-if="!item.read" class="mt-2 size-2 shrink-0 rounded-full bg-destructive" aria-label="未讀" />
          </RouterLink>
        </template>
      </div>
    </section>
  </div>
</template>
