<script setup>
// 管理人員端・我的待辦（設計稿 1487:15535）：「未完成」「已完成」兩個分頁，可以依類型篩選；未完成可以換排序
// 寫法和管委會端的「我的待辦」一樣（views/committee/TodosView.vue），差別：
//   身分換成管理人員、網址換成 /staff
//   類型只有 4 個（全部、案件、交辦給我的、需補資料），照篩選規則用篩選標籤（FilterChips）
//   設計稿還有「快到期文件」，但管理人員的待辦沒有這一種（合約、文件到期是提醒管委會的），先不放
import { computed, onMounted, ref } from 'vue'
import AdminActionCard from '@/components/admin/AdminActionCard.vue'
import FilterChips from '@/components/common/FilterChips.vue'
import SortSelect from '@/components/common/SortSelect.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { todoLink } from '@/lib/todo'
import { getCurrentUser, getMyDoneTodos, getMyTodos } from '@/mocks/api'

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 我的待辦：getMyTodos() 回傳 items（每一筆待辦）和 total（共幾件）
const todos = ref({ items: [], total: 0 })
// 最近完成的事：假 API 只給最近 30 天（DONE_TODO_DAYS）完成的，更早的不列。這是內部規則，畫面上不寫出來（2026-10-15 suzy 決定）
const doneTodos = ref([])

// 現在看哪個分頁：'open' 未完成 / 'done' 已完成
const tab = ref('open')
const TABS = [
  { value: 'open', label: '未完成' },
  { value: 'done', label: '已完成' },
]

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('staff')
  // Promise.all：兩種資料同時拿
  const [openList, doneList] = await Promise.all([getMyTodos(user.id, 'staff'), getMyDoneTodos(user.id, 'staff')])
  todos.value = openList
  doneTodos.value = doneList
  loading.value = false
})

// 類型篩選：畫面上的選項，對應到假資料的待辦種類（kinds）
//   「案件」包含新通報（待受理）、處理中；已完成分頁裡結案的案件是 to_verify
//   選項固定，不管有沒有這類待辦都列出來（dev-guide 第 5 節「篩選」）
const TYPE_FILTERS = [
  { value: 'all', label: '全部', kinds: [] },
  { value: 'case', label: '案件', kinds: ['new_case', 'in_progress', 'to_verify', 'waiting'] },
  { value: 'task', label: '交辦給我的', kinds: ['assigned', 'waiting'] },
  { value: 'incomplete', label: '需補資料', kinds: ['incomplete'] },
]
const type = ref('all')

// 預設到期日，可以換建立日期（2026-10-16）
//   沒有「緊急優先」：只有公告能標示緊急，待辦不會有緊急的
//   首頁只放最新的 2 張；點進全部待辦才照到期日排
const SORT_OPTIONS = [
  { value: 'due', label: '到期日' },
  { value: 'created', label: '建立日期' },
]
const sort = ref('due')

// 待辦點了去哪裡：todoLink() 是管委會端的網址，換成管理人員端的（和管理人員首頁一樣）
function staffTodoLink(todo) {
  return todoLink(todo).replace(/^\/committee/, '/staff')
}

// 篩選＋排序後要顯示的待辦
const shownTodos = computed(() => {
  const filter = TYPE_FILTERS.find((item) => item.value === type.value)
  const source = tab.value === 'done' ? doneTodos.value : todos.value.items
  const items = type.value === 'all' ? source : source.filter((todo) => filter.kinds.includes(todo.kind))
  // 已完成的固定新的在前（getMyDoneTodos() 已經排好），不用排序選單
  if (tab.value === 'done') return items
  // getMyTodos() 本來就照到期日排好了
  if (sort.value === 'created') {
    // 新建立的排前面；沒有建立日期的（快到期的合約、文件）排最後
    return items.toSorted((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  }
  return items
})
</script>

<template>
  <div class="space-y-3 px-5 pt-4 pb-5">
    <!-- 未完成／已完成（樣式和住戶端「社區公告」的分頁一樣） -->
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

    <!-- 類型：4 個選項，用篩選標籤 -->
    <FilterChips v-model="type" :options="TYPE_FILTERS" />

    <!-- 同一行：左邊件數、右邊排序（灰色小字）。只有「未完成」有這一行：
         已完成固定新的在前，不用排序；件數也不寫（以前寫「最近 30 天完成 N 件」，2026-10-15 拿掉） -->
    <div v-if="tab === 'open'" class="flex min-h-11 items-center justify-between gap-3">
      <p class="type-date text-muted-foreground">
        <template v-if="!loading">共 {{ shownTodos.length }} 件待辦</template>
      </p>
      <SortSelect v-model="sort" :options="SORT_OPTIONS" />
    </div>

    <template v-if="loading">
      <Skeleton v-for="n in 3" :key="n" class="h-[220px] rounded-xl" />
    </template>
    <!-- 沒有任何待辦，或是選的類型剛好沒有 -->
    <div v-else-if="!shownTodos.length" class="rounded-xl bg-card p-4 shadow-card">
      <p v-if="tab === 'done'" class="type-body text-muted-foreground">目前沒有已完成的事</p>
      <p v-else class="type-body text-muted-foreground">{{ type === 'all' ? '目前沒有待辦事項' : '沒有這類待辦' }}</p>
    </div>
    <template v-else>
      <AdminActionCard v-for="todo in shownTodos" :key="todo.id" :todo="todo" :to="staffTodoLink(todo)" />
    </template>
  </div>
</template>
