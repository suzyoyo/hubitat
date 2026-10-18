<script setup>
// 管理人員端・首頁：問候列、我的待辦（前 2 筆）、公告與動態（設計稿 1483:15339）
// 版面和管委會首頁一樣，只是沒有捷徑方塊和住戶意見；卡片元件也沿用管委會的
import { ChevronRightIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import AdminNoticeCard from '@/components/admin/AdminNoticeCard.vue'
import AdminTodoCard from '@/components/admin/AdminTodoCard.vue'
import AppGreeting from '@/components/app/AppGreeting.vue'
import NotificationReminder from '@/components/feedback/NotificationReminder.vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { greetingWord } from '@/lib/date'
import { newestTodos, todoLink } from '@/lib/todo'
import { MOCK_NOW, getCurrentUser, getManagedAnnouncements, getMyTodos } from '@/mocks/api'

const loading = ref(true)
const userName = ref('') // 問候語裡的名字，例如「張管理員」
// 我的待辦：getMyTodos() 回傳 items（每一筆待辦）和 total（共幾件）
const todos = ref({ items: [], total: 0 })
const announcements = ref([]) // 已發布、還沒結束的公告

onMounted(async () => {
  const user = await getCurrentUser('staff')
  userName.value = user.name
  // Promise.all：兩種資料同時去拿
  const [todoList, announcementList] = await Promise.all([
    getMyTodos(user.id, 'staff'),
    getManagedAnnouncements('published'),
  ])
  todos.value = todoList
  // 已經結束的公告不放首頁；照開始時間排，進行中的會在最前面（和管委會首頁一樣）
  announcements.value = announcementList
    .filter((item) => !item.hasEnded)
    .toSorted((a, b) => a.startAt.localeCompare(b.startAt))
  loading.value = false
})

// 早安、午安或晚安（規則在 src/lib/date.js，三端的首頁共用）
const hello = greetingWord(MOCK_NOW)

// 問候列的兩行字。設計稿有寫名字：「早安，王小姐！今天有」「7 件待辦事項喔！」
const greeting = computed(() => {
  if (todos.value.total === 0) return { title: `${hello}，${userName.value}！`, subtitle: '今天沒有待辦事項喔！' }
  return { title: `${hello}，${userName.value}！今天有`, subtitle: `${todos.value.total} 件待辦事項喔！` }
})

// 首頁只放最前面的 2 筆待辦，其餘的按「查看全部待辦事項」
// 首頁只放最新的 2 張（建立時間新的在前，規則在 src/lib/todo.js）；全部待辦頁才照到期日排
const homeTodos = computed(() => newestTodos(todos.value.items))

// 待辦點了去哪裡：todoLink() 是管委會端的網址，換成管理人員端的
//   例如 '/committee/cases/CASE-1' → '/staff/cases/CASE-1'
function staffTodoLink(todo) {
  return todoLink(todo).replace(/^\/committee/, '/staff')
}
</script>

<template>
  <div>
    <AppGreeting v-if="!loading" :title="greeting.title" :subtitle="greeting.subtitle" />
    <Skeleton v-else class="h-[104px] rounded-t-none rounded-b-3xl" />

    <div class="space-y-8 px-5 pt-5">
      <!-- 還沒開通知就一直提醒，但不擋（2026-10-18 013） -->
      <NotificationReminder />

      <section class="space-y-3">
        <!-- 標題右邊是「查看 N 件待辦 ›」（2026-10-15 suzy 改：拿掉件數徽章和下面的「查看全部待辦事項」按鈕）
             樣式和下面「公告與動態」的「看全部 ›」一樣（SectionHeader），只是文字不同，所以這裡照著寫一份 -->
        <div class="flex items-center justify-between">
          <h2 class="type-title text-heading">我的待辦</h2>
          <!-- h-11 是 44px 的可點擊範圍；-my-1 讓這一列的高度維持 36px（和 SectionHeader 一樣） -->
          <RouterLink
            v-if="!loading && todos.total"
            to="/staff/todos"
            class="-my-1 flex h-11 items-center gap-1 rounded-lg px-2.5 type-link tracking-[0.4px] text-heading"
          >
            查看 {{ todos.total }} 件待辦
            <ChevronRightIcon class="size-4" />
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
          <AdminTodoCard v-for="todo in homeTodos" :key="todo.id" :todo="todo" :to="staffTodoLink(todo)" />
        </template>
      </section>

      <section class="space-y-3 pb-5">
        <SectionHeader title="公告與動態" to="/staff/announcements" />
        <Skeleton v-if="loading" class="h-[178px] rounded-xl" />
        <div v-else-if="!announcements.length" class="rounded-xl bg-card p-4 shadow-card">
          <p class="type-body text-muted-foreground">目前沒有公告</p>
        </div>
        <!-- 橫向捲動：-mx-5 px-5 讓卡片可以捲到螢幕邊緣，pb-1 留空間給卡片陰影，scrollbar-width:none 隱藏捲軸 -->
        <div v-else class="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          <AdminNoticeCard
            v-for="announcement in announcements"
            :key="announcement.id"
            :announcement="announcement"
            :to="`/staff/announcements/${announcement.id}`"
          />
        </div>
      </section>
    </div>
  </div>
</template>
