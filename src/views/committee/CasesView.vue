<script setup>
// 管委會端・案件（底部分頁）：列出社區所有案件，可以依狀態、地點、廠商、分類篩選
// 設計稿：列表 1134:16221、狀態下拉 1134:18205、空狀態 1134:18106
import { computed, onMounted, ref } from 'vue'
import AdminCaseCard from '@/components/admin/AdminCaseCard.vue'
import FilterSelect from '@/components/common/FilterSelect.vue'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { getAreas, getCases, getVendors } from '@/mocks/api'
import { CASE_STATUSES } from '@/mocks/data/cases'
import { ISSUE_CATEGORIES } from '@/mocks/data/community'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const loading = ref(true)
const cases = ref([]) // 全部的案件（包含已結案、已取消），篩選在畫面上做
const areas = ref([])
const vendors = ref([])

onMounted(async () => {
  const [caseList, areaList, vendorList] = await Promise.all([getCases({ status: 'all' }), getAreas(), getVendors()])
  cases.value = caseList
  areas.value = areaList
  vendors.value = vendorList
  loading.value = false
})

// ── 篩選 ─────────────────────────────────────
// 四個都是 5 個選項以上，所以都用下拉選單（dev-guide 第 5 節「篩選」）
// 狀態的文字用假資料的對照表；設計稿寫的「待處理、處理中、已處理」和資料的狀態對不起來
// 已受理（accepted）在管理端也顯示「處理中」，所以選單只放一個「處理中」，選了兩種都列出來（2026-10-15）
const STATUS_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'open', label: '未結案' },
  ...Object.entries(CASE_STATUSES)
    .filter(([value]) => value !== 'accepted')
    .map(([value, info]) => ({ value, label: info.label })),
]

// 選單選的狀態，對到資料裡的哪幾種
function matchesStatus(item, value) {
  if (value === 'in_progress') return ['accepted', 'in_progress'].includes(item.status)
  return item.status === value
}
const CATEGORY_OPTIONS = [
  { value: 'all', label: '全部' },
  ...Object.entries(ISSUE_CATEGORIES).map(([value, info]) => ({ value, label: info.label })),
]
const areaOptions = computed(() => [
  { value: 'all', label: '全部' },
  ...areas.value.map((area) => ({ value: area.id, label: area.name })),
])
const vendorOptions = computed(() => [
  { value: 'all', label: '全部' },
  ...vendors.value.map((vendor) => ({ value: vendor.id, label: vendor.name })),
])

// 預設只看還沒結案的
const DEFAULT_FILTERS = { status: 'open', areaId: 'all', vendorId: 'all', category: 'all' }
const status = ref(DEFAULT_FILTERS.status)
const areaId = ref(DEFAULT_FILTERS.areaId)
const vendorId = ref(DEFAULT_FILTERS.vendorId)
const category = ref(DEFAULT_FILTERS.category)

function clearFilters() {
  status.value = DEFAULT_FILTERS.status
  areaId.value = DEFAULT_FILTERS.areaId
  vendorId.value = DEFAULT_FILTERS.vendorId
  category.value = DEFAULT_FILTERS.category
}

// 篩選後要顯示的案件；排序沿用 getCases()：逾期的在前，其他新的在前
const shownCases = computed(() =>
  cases.value.filter((item) => {
    if (status.value === 'open' && !item.isOpen) return false
    if (!['all', 'open'].includes(status.value) && !matchesStatus(item, status.value)) return false
    if (areaId.value !== 'all' && item.areaId !== areaId.value) return false
    if (vendorId.value !== 'all' && item.vendorId !== vendorId.value) return false
    if (category.value !== 'all' && item.category !== category.value) return false
    return true
  }),
)
</script>

<template>
  <div class="space-y-3 px-5 pt-4 pb-5">
    <!-- 四個篩選排成兩排（設計稿是一排四個，放大到 16px 的字之後擠不下） -->
    <div class="grid grid-cols-2 gap-3">
      <FilterSelect v-model="status" label="狀態" :options="STATUS_OPTIONS" />
      <FilterSelect v-model="areaId" label="地點" :options="areaOptions" />
      <FilterSelect v-model="vendorId" label="廠商" :options="vendorOptions" />
      <FilterSelect v-model="category" label="分類" :options="CATEGORY_OPTIONS" />
    </div>

    <template v-if="loading">
      <Skeleton v-for="n in 4" :key="n" class="h-[140px] rounded-xl" />
    </template>

    <!-- 篩選後沒有案件 -->
    <Empty v-else-if="!shownCases.length" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">這個條件下沒有案件</EmptyTitle>
      <EmptyDescription class="type-body">換個條件看看，或直接新增一個案件</EmptyDescription>
      <Button variant="outline" class="mt-4" @click="clearFilters">清除篩選</Button>
    </Empty>

    <template v-else>
      <p class="type-date text-muted-foreground">共 {{ shownCases.length }} 件</p>
      <AdminCaseCard v-for="item in shownCases" :key="item.id" :item="item" :to="`/committee/cases/${item.id}`" />
    </template>
  </div>
</template>
