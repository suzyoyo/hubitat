<script setup>
// 管委會端・首頁：問候列、我的待辦、捷徑、住戶意見、公告與動態
import { ChevronRightIcon, CircleCheckIcon, FileTextIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import AdminNoticeCard from '@/components/admin/AdminNoticeCard.vue'
import AdminTodoCard from '@/components/admin/AdminTodoCard.vue'
import AppGreeting from '@/components/app/AppGreeting.vue'
import HomeTour from '@/components/app/HomeTour.vue'
import NotificationReminder from '@/components/feedback/NotificationReminder.vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import IconTile from '@/components/common/IconTile.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { TOUR_STEPS } from '@/config/tour'
import { greetingWord } from '@/lib/date'
import { newestTodos, todoLink } from '@/lib/todo'
import {
  mockNow,
  getCurrentUser,
  getManagedAnnouncements,
  getMyTodos,
  getResidentOpinions,
} from '@/mocks/api'

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 我的待辦：getMyTodos() 回傳 items（每一筆待辦）和 total（共幾件）
const todos = ref({ items: [], total: 0 })
const opinions = ref([]) // 還沒回覆的住戶意見
const announcements = ref([]) // 已發布的公告

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('committee')
  // Promise.all：三種資料同時去拿，全部回來才往下走，比一個一個等來得快
  const [todoList, opinionList, announcementList] = await Promise.all([
    getMyTodos(user.id, 'committee'),
    getResidentOpinions(true),
    getManagedAnnouncements('published'),
  ])
  todos.value = todoList
  opinions.value = opinionList
  // 已經結束的公告不放首頁；照開始時間排，進行中的會在最前面
  announcements.value = announcementList
    .filter((item) => !item.hasEnded)
    .toSorted((a, b) => a.startAt.localeCompare(b.startAt))
  loading.value = false
})

// 依現在幾點決定問候語：早安、午安或晚安（規則在 src/lib/date.js，三端的首頁共用）
const hello = greetingWord(mockNow())

// 問候列的兩行字：提醒今天有幾件待辦
const greeting = computed(() => {
  // 設計稿沒畫沒有待辦的樣子，先用這句
  if (todos.value.total === 0) return { title: `${hello}！`, subtitle: '今天沒有待辦事項喔！' }
  return { title: `${hello}！今天有`, subtitle: `${todos.value.total} 件待辦事項喔！` }
})

// 首頁只放最前面的 2 筆待辦，其餘的按標題右邊的「查看 N 件待辦」
// 首頁只放最新的 2 張（建立時間新的在前，規則在 src/lib/todo.js）；全部待辦頁才照到期日排
const homeTodos = computed(() => newestTodos(todos.value.items))

// 捷徑方塊：不是 Kit 元件，直接寫在頁面裡
const shortcuts = [
  { title: '交辦進度', icon: CircleCheckIcon, to: '/committee/tasks' },
  { title: '提案與簽核', icon: FileTextIcon, to: '/committee/proposals' },
]
</script>

<template>
  <div>
    <AppGreeting v-if="!loading" :title="greeting.title" :subtitle="greeting.subtitle" />
    <Skeleton v-else class="h-[104px] rounded-t-none rounded-b-3xl" />

    <div class="space-y-8 px-5 pt-5">
      <!-- 還沒開通知就一直提醒，但不擋（2026-10-18 013） -->
      <NotificationReminder />

      <section class="space-y-3" data-tour="todos">
        <div class="flex items-center justify-between">
          <h2 class="type-title text-heading">我的待辦</h2>
          <!-- 「查看 N 件待辦 ›」（2026-10-15 suzy 改：拿掉件數徽章和下面的「查看全部待辦事項」按鈕，管理人員首頁也一樣）
               樣式和「看全部 ›」一樣（SectionHeader），只是文字不同，所以這裡照著寫一份。
               h-11 是 44px 的可點擊範圍；-my-1 讓這一列的高度維持 36px -->
          <!-- 箭頭尖和卡片右邊對齊（2026-10-18）：-mr-2.5 抵掉按鈕左右各 10px 的點擊範圍，
               箭頭的 -mr-1.5 抵掉 icon 本身右邊約 6px 的透明空白。只是往外推、沒有裁掉，外層不要加 overflow-hidden -->
          <RouterLink
            v-if="!loading && todos.total"
            to="/committee/todos"
            class="-my-1 -mr-2.5 flex h-11 items-center gap-1 rounded-lg px-2.5 type-link tracking-[0.4px] text-heading"
          >
            查看 {{ todos.total }} 件待辦
            <ChevronRightIcon class="-mr-1.5 size-4" />
          </RouterLink>
        </div>
        <template v-if="loading">
          <Skeleton v-for="n in 2" :key="n" class="h-[124px] rounded-xl" />
        </template>
        <!-- 設計稿沒畫沒有待辦的樣子 -->
        <div v-else-if="!homeTodos.length" class="rounded-xl bg-card p-4 shadow-card">
          <p class="type-body text-muted-foreground">目前沒有待辦事項</p>
        </div>
        <template v-else>
          <AdminTodoCard v-for="todo in homeTodos" :key="todo.id" :todo="todo" :to="todoLink(todo)" />
        </template>
      </section>

      <div class="grid grid-cols-2 gap-3" data-tour="shortcuts">
        <RouterLink
          v-for="shortcut in shortcuts"
          :key="shortcut.to"
          :to="shortcut.to"
          class="space-y-3 rounded-xl border border-primary bg-card p-3.5"
        >
          <div class="flex items-center justify-between">
            <IconTile>
              <component :is="shortcut.icon" />
            </IconTile>
            <ChevronRightIcon class="size-3.5 text-muted-foreground" />
          </div>
          <p class="type-body-strong text-foreground">{{ shortcut.title }}</p>
        </RouterLink>
      </div>

      <section class="space-y-3">
        <SectionHeader title="住戶意見" to="/committee/opinions" />
        <Skeleton v-if="loading" class="h-[122px] rounded-xl" />
        <div v-else-if="!opinions.length" class="rounded-xl bg-card p-4 shadow-card">
          <p class="type-body text-muted-foreground">目前沒有待回覆的意見</p>
        </div>
        <!-- 橫向捲動：-mx-5 px-5 讓卡片可以捲到螢幕邊緣，pb-1 留空間給卡片陰影，scrollbar-width:none 隱藏捲軸 -->
        <div v-else class="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          <AdminNoticeCard
            v-for="opinion in opinions"
            :key="opinion.id"
            :opinion="opinion"
            :to="`/committee/meetings/${opinion.meetingId}`"
          />
        </div>
      </section>

      <section class="space-y-3 pb-5">
        <SectionHeader title="公告與動態" to="/committee/announcements" />
        <Skeleton v-if="loading" class="h-[178px] rounded-xl" />
        <div v-else-if="!announcements.length" class="rounded-xl bg-card p-4 shadow-card">
          <p class="type-body text-muted-foreground">目前沒有公告</p>
        </div>
        <div v-else class="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          <AdminNoticeCard
            v-for="announcement in announcements"
            :key="announcement.id"
            :announcement="announcement"
            :to="`/committee/announcements/${announcement.id}`"
          />
        </div>
      </section>
    </div>

    <HomeTour :steps="TOUR_STEPS.committee" storage-key="hubitat-tour-committee" :ready="!loading" />
  </div>
</template>
