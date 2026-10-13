<script setup>
// 管委會端・我的待辦：列出所有還沒完成的待辦，可以依類型篩選、換排序
import { computed, onMounted, ref } from 'vue'
import AdminActionCard from '@/components/admin/AdminActionCard.vue'
import FilterSelect from '@/components/common/FilterSelect.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { todoLink } from '@/lib/todo'
import { getCurrentUser, getMyTodos } from '@/mocks/api'

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 我的待辦：getMyTodos() 回傳 items（每一筆待辦）和 total（共幾件）
const todos = ref({ items: [], total: 0 })

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('committee')
  todos.value = await getMyTodos(user.id, 'committee')
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
  const items = type.value === 'all' ? todos.value.items : todos.value.items.filter((todo) => filter.kinds.includes(todo.kind))
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
    <div class="grid grid-cols-2 gap-3">
      <FilterSelect v-model="type" label="類型" :options="TYPE_FILTERS" />
      <FilterSelect v-model="sort" label="排序" :options="SORT_OPTIONS" />
    </div>

    <template v-if="loading">
      <Skeleton v-for="n in 3" :key="n" class="h-[220px] rounded-xl" />
    </template>
    <!-- 沒有任何待辦，或是選的類型剛好沒有 -->
    <div v-else-if="!shownTodos.length" class="rounded-xl bg-card p-4 shadow-card">
      <p class="type-body text-muted-foreground">{{ type === 'all' ? '目前沒有待辦事項' : '沒有這類待辦' }}</p>
    </div>
    <template v-else>
      <p class="type-date text-muted-foreground">共 {{ shownTodos.length }} 個待辦</p>
      <AdminActionCard v-for="todo in shownTodos" :key="todo.id" :todo="todo" :to="todoLink(todo)" />
    </template>
  </div>
</template>
