<script setup>
// 管委會端・我的待辦：「未完成」「已完成」兩個分頁，可以依類型篩選；未完成可以換排序
// 已完成是最近 30 天我完成的事（getMyDoneTodos），2026-10-14 照設計稿補上
import { computed, onMounted, ref } from 'vue'
import AdminActionCard from '@/components/admin/AdminActionCard.vue'
import FilterSelect from '@/components/common/FilterSelect.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { todoLink } from '@/lib/todo'
import { DONE_TODO_DAYS, getCurrentUser, getMyDoneTodos, getMyTodos } from '@/mocks/api'

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 我的待辦：getMyTodos() 回傳 items（每一筆待辦）和 total（共幾件）
const todos = ref({ items: [], total: 0 })
// 最近完成的事
const doneTodos = ref([])

// 現在看哪個分頁：'open' 未完成 / 'done' 已完成
const tab = ref('open')
const TABS = [
  { value: 'open', label: '未完成' },
  { value: 'done', label: '已完成' },
]

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('committee')
  // Promise.all：兩種資料同時拿
  const [openList, doneList] = await Promise.all([getMyTodos(user.id, 'committee'), getMyDoneTodos(user.id, 'committee')])
  todos.value = openList
  doneTodos.value = doneList
  loading.value = false
})

// 類型篩選：畫面上的選項，對應到假資料的待辦種類（kinds）
//   「交辦」包含交辦給我的＋待我確認；「待簽核」包含提案簽核＋公告審核
//   選項固定，不管有沒有這類待辦都列出來（dev-guide 第 5 節「篩選」）
const TYPE_FILTERS = [
  { value: 'all', label: '全部', kinds: [] },
  { value: 'case', label: '案件', kinds: ['my_case'] },
  { value: 'task', label: '交辦', kinds: ['assigned', 'confirm'] },
  { value: 'incomplete', label: '需補資料', kinds: ['incomplete'] },
  { value: 'expiring', label: '快到期文件', kinds: ['expiring'] },
  { value: 'sign', label: '待簽核', kinds: ['sign', 'review'] },
]
const type = ref('all')

const SORT_OPTIONS = [
  { value: 'due', label: '到期日' },
  { value: 'urgent', label: '緊急優先' },
  { value: 'created', label: '建立日期' },
]
const sort = ref('due')

// 篩選＋排序後要顯示的待辦
const shownTodos = computed(() => {
  const filter = TYPE_FILTERS.find((item) => item.value === type.value)
  const source = tab.value === 'done' ? doneTodos.value : todos.value.items
  const items = type.value === 'all' ? source : source.filter((todo) => filter.kinds.includes(todo.kind))
  // 已完成的固定新的在前（getMyDoneTodos() 已經排好），不用排序選單
  if (tab.value === 'done') return items
  // getMyTodos() 本來就照到期日排好了
  if (sort.value === 'urgent') {
    // 緊急的排前面，其他維持到期日的順序
    return items.toSorted((a, b) => Number(b.isUrgent) - Number(a.isUrgent))
  }
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

    <div class="grid grid-cols-2 gap-3">
      <FilterSelect v-model="type" label="類型" :options="TYPE_FILTERS" />
      <!-- 已完成固定新的在前，不用排序 -->
      <FilterSelect v-if="tab === 'open'" v-model="sort" label="排序" :options="SORT_OPTIONS" />
    </div>

    <template v-if="loading">
      <Skeleton v-for="n in 3" :key="n" class="h-[220px] rounded-xl" />
    </template>
    <!-- 沒有任何待辦，或是選的類型剛好沒有 -->
    <div v-else-if="!shownTodos.length" class="rounded-xl bg-card p-4 shadow-card">
      <p v-if="tab === 'done'" class="type-body text-muted-foreground">最近 {{ DONE_TODO_DAYS }} 天沒有完成的事</p>
      <p v-else class="type-body text-muted-foreground">{{ type === 'all' ? '目前沒有待辦事項' : '沒有這類待辦' }}</p>
    </div>
    <template v-else>
      <p class="type-date text-muted-foreground">
        {{ tab === 'done' ? `最近 ${DONE_TODO_DAYS} 天完成 ${shownTodos.length} 件` : `共 ${shownTodos.length} 件待辦` }}
      </p>
      <AdminActionCard v-for="todo in shownTodos" :key="todo.id" :todo="todo" :to="todoLink(todo)" />
    </template>
  </div>
</template>
