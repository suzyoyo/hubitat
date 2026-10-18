<script setup>
// 管委會端・設備清冊（社區分頁「設備清冊」，設計稿 1134:16415、狀態下拉 1449:28680）
// 搜尋設備名稱、位置或廠商；依狀態、地點篩選（地點是 2026-10-16 013 加的，設計稿沒有）；點一列到設備詳情
// 這一版只有「看」；「新增設備」還沒有假 API，先不放
import { SearchIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import AdminEquipmentRow from '@/components/admin/AdminEquipmentRow.vue'
import FilterSelect from '@/components/common/FilterSelect.vue'
import SortSelect from '@/components/common/SortSelect.vue'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getEquipmentList } from '@/mocks/api'
import { EQUIPMENT_DISPLAY_STATUSES } from '@/mocks/data/equipment'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const loading = ref(true)
const devices = ref([]) // getEquipmentList 已經把需要處理的排在前面

onMounted(async () => {
  devices.value = await getEquipmentList('committee')
  loading.value = false
})

// 狀態：含「全部」7 個選項，用下拉選單（dev-guide 第 5 節「篩選」），順序照設計稿
const STATUS_FILTERS = [
  { value: 'all', label: '全部' },
  ...['needs_repair', 'repairing', 'overdue', 'due_soon', 'normal', 'retired'].map((value) => ({
    value,
    label: value === 'normal' ? '正常' : EQUIPMENT_DISPLAY_STATUSES[value].label,
  })),
]
const status = ref('all')

// 地點：用設備資料裡有的範圍做選項，照範圍的編號排（A 棟、B 棟、C 棟在前，再來是中庭、停車場、泳池）
const areaOptions = computed(() => {
  const names = new Map(devices.value.map((item) => [item.areaId, item.areaName]))
  const list = [...names].map(([value, label]) => ({ value, label }))
  return [{ value: 'all', label: '全部' }, ...list.toSorted((a, b) => a.value.localeCompare(b.value))]
})
const area = ref('all')

const SORT_OPTIONS = [
  { value: 'status', label: '需要處理的在前' },
  { value: 'maintenance', label: '保養日由近至遠' },
]
const sort = ref('status')

// 搜尋：比對設備名稱、位置、廠商，例如打「電梯」「B1」「大同」
const keyword = ref('')

const shownDevices = computed(() => {
  const word = keyword.value.trim()
  const items = devices.value.filter((item) => {
    if (status.value !== 'all' && item.displayStatus !== status.value) return false
    if (area.value !== 'all' && item.areaId !== area.value) return false
    if (!word) return true
    return [item.name, item.place, item.vendorName].some((text) => text?.includes(word))
  })
  if (sort.value !== 'maintenance') return items
  // 保養日由近至遠；不需要定期保養的排最後
  return items.toSorted((a, b) => {
    if (!a.nextMaintenanceAt) return 1
    if (!b.nextMaintenanceAt) return -1
    return a.nextMaintenanceAt.localeCompare(b.nextMaintenanceAt)
  })
})
</script>

<template>
  <div class="space-y-4 px-5 pt-4 pb-5">
    <div class="relative">
      <SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="keyword" type="search" aria-label="搜尋設備" placeholder="搜尋設備名稱、位置或廠商" class="pl-10" />
    </div>

    <!-- 兩個下拉選單平分一行 -->
    <div class="flex gap-2 *:flex-1">
      <FilterSelect v-model="status" label="狀態" :options="STATUS_FILTERS" />
      <FilterSelect v-model="area" label="地點" :options="areaOptions" />
    </div>
    <!-- 同一行：左邊件數、右邊排序（灰色小字） -->
    <div class="flex items-center justify-between gap-3">
      <p class="type-date text-muted-foreground">{{ loading ? '' : `共 ${shownDevices.length} 項` }}</p>
      <SortSelect v-model="sort" :options="SORT_OPTIONS" />
    </div>

    <template v-if="loading">
      <Skeleton v-for="n in 4" :key="n" class="h-[88px] rounded-xl" />
    </template>

    <!-- 沒有符合的設備 -->
    <Empty v-else-if="!shownDevices.length" class="gap-1 pt-6">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">沒有符合的設備</EmptyTitle>
      <EmptyDescription class="type-body">換個關鍵字或狀態試試看。</EmptyDescription>
    </Empty>

    <div v-else class="space-y-3">
      <AdminEquipmentRow v-for="item in shownDevices" :key="item.id" :item="item" :to="`/committee/equipment/${item.id}`" />
    </div>
  </div>
</template>
