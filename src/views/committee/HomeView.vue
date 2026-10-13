<script setup>
// 管委會端・首頁：問候列、我的待辦、捷徑、住戶意見、公告與動態
import { ChevronRightIcon, CircleCheckIcon, FileTextIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import AdminNoticeCard from '@/components/admin/AdminNoticeCard.vue'
import AdminTodoCard from '@/components/admin/AdminTodoCard.vue'
import AppGreeting from '@/components/app/AppGreeting.vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import IconTile from '@/components/common/IconTile.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { todoLink } from '@/lib/todo'
import {
  MOCK_NOW,
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

// 依現在幾點決定問候語
const hello = computed(() => {
  const hour = Number(MOCK_NOW.split('T')[1].split(':')[0]) // '2026-10-01T13:42' → 13
  if (hour < 11) return '早安'
  if (hour < 18) return '午安'
  return '晚安'
})

// 問候列的兩行字：提醒今天有幾件待辦
const greeting = computed(() => {
  // 設計稿沒畫沒有待辦的樣子，先用這句
  if (todos.value.total === 0) return { title: `${hello.value}！`, subtitle: '今天沒有待辦事項喔！' }
  return { title: `${hello.value}！今天有`, subtitle: `${todos.value.total} 件待辦事項喔！` }
})

// 首頁只放最前面的 2 筆待辦，其餘的按「查看全部待辦事項」
const homeTodos = computed(() => todos.value.items.slice(0, 2))

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
      <section class="space-y-3">
        <!-- 標題右邊是件數徽章，不是「看全部」，所以不用 SectionHeader -->
        <div class="flex items-center justify-between">
          <h2 class="type-title text-heading">我的待辦</h2>
          <Badge v-if="!loading && todos.total" variant="secondary">待處理 {{ todos.total }} 件</Badge>
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
        <Button as-child class="w-full">
          <RouterLink to="/committee/todos">查看全部待辦事項</RouterLink>
        </Button>
      </section>

      <div class="grid grid-cols-2 gap-3">
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
  </div>
</template>
