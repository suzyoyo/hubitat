<script setup>
// 管委會端・廠商名冊：依合作狀態列出廠商，可以搜尋遇到的問題或廠商名稱（設計稿 1134:16003）
// 這一版只有「看」；「新增廠商」先連到佔位頁
import { PlusIcon, SearchIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import AdminVendorCard from '@/components/admin/AdminVendorCard.vue'
import FilterChips from '@/components/common/FilterChips.vue'
import SortSelect from '@/components/common/SortSelect.vue'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getVendors } from '@/mocks/api'
import { VENDOR_STATUSES } from '@/mocks/data/vendors'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const loading = ref(true)
const vendors = ref([]) // 全部的廠商（getVendors 已經依新增日期排好，新的在前）

onMounted(async () => {
  vendors.value = await getVendors()
  loading.value = false
})

// 合作狀態：3 個選項，用篩選標籤（dev-guide 第 5 節「篩選」）；設計稿沒有「全部」
const STATUS_FILTERS = Object.entries(VENDOR_STATUSES).map(([value, info]) => ({ value, label: info.label }))
const status = ref('active')

const SORT_OPTIONS = [
  { value: 'created', label: '新增日期' },
  { value: 'name', label: '名稱' },
]
const sort = ref('created')

// 搜尋：比對廠商名稱和處理項目，例如打「漏水」會找到處理項目有漏水的廠商
const keyword = ref('')

const shownVendors = computed(() => {
  const word = keyword.value.trim()
  const items = vendors.value.filter((vendor) => {
    if (vendor.status !== status.value) return false
    if (!word) return true
    return vendor.name.includes(word) || vendor.services.some((service) => service.includes(word))
  })
  // localeCompare(…, 'zh-Hant')：用中文的順序排名稱
  return sort.value === 'name' ? items.toSorted((a, b) => a.name.localeCompare(b.name, 'zh-Hant')) : items
})
</script>

<template>
  <div class="space-y-4 px-5 pt-4 pb-5">
    <div class="relative">
      <SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        v-model="keyword"
        type="search"
        aria-label="搜尋廠商"
        placeholder="遇到的問題或廠商，例如：漏水"
        class="pl-10"
      />
    </div>

    <Button as-child class="w-full">
      <RouterLink to="/committee/vendors/new">
        <PlusIcon />
        新增廠商
      </RouterLink>
    </Button>

    <FilterChips v-model="status" :options="STATUS_FILTERS" />
    <!-- 同一行：左邊件數、右邊排序（灰色小字） -->
    <div class="flex items-center justify-between gap-3">
      <p class="type-date text-muted-foreground">{{ loading ? '' : `共 ${shownVendors.length} 家廠商` }}</p>
      <SortSelect v-model="sort" :options="SORT_OPTIONS" />
    </div>

    <template v-if="loading">
      <Skeleton v-for="n in 3" :key="n" class="h-[130px] rounded-xl" />
    </template>

    <Empty v-else-if="!shownVendors.length" class="gap-1 pt-6">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">沒有符合的廠商</EmptyTitle>
      <EmptyDescription class="type-body">換個關鍵字，或看看其他合作狀態</EmptyDescription>
    </Empty>

    <template v-else>
      <AdminVendorCard
        v-for="vendor in shownVendors"
        :key="vendor.id"
        :vendor="vendor"
        :to="`/committee/vendors/${vendor.id}`"
      />
    </template>
  </div>
</template>
