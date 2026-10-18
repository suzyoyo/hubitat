<script setup>
// 管委會端・廠商合約（社區分頁「廠商合約」，設計稿 1134:16307）
// 每家廠商只列目前的那一份合約（歷次合約在合約詳情看）；可以搜尋廠商或服務項目、依狀態篩選
// 這一版只有「看」；「新增合約」要上傳檔案，還沒有假 API，先不放
import { SearchIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import AdminContractCard from '@/components/admin/AdminContractCard.vue'
import FilterChips from '@/components/common/FilterChips.vue'
import SortSelect from '@/components/common/SortSelect.vue'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getContracts, getVendors } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const loading = ref(true)
const contracts = ref([]) // getContracts 已經依到期日排好，快到期的在前
const contacts = ref({}) // 廠商編號 → 第一位聯絡窗口的名字

onMounted(async () => {
  const [contractList, vendorList] = await Promise.all([getContracts('committee'), getVendors()])
  contracts.value = contractList
  contacts.value = Object.fromEntries(vendorList.map((vendor) => [vendor.id, vendor.contacts[0]?.name ?? '']))
  loading.value = false
})

// 狀態：含「全部」4 個選項，用篩選標籤（dev-guide 第 5 節「篩選」）
// 列表只有目前的合約，所以沒有「已到期」
const STATUS_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'expiring', label: '即將到期' },
  { value: 'active', label: '合約內' },
  { value: 'upcoming', label: '尚未生效' },
]
const status = ref('all')

const SORT_OPTIONS = [
  { value: 'end', label: '到期日' },
  { value: 'uploaded', label: '新增日期' },
]
const sort = ref('end')

// 搜尋：比對廠商名稱和服務內容，例如打「電梯」
const keyword = ref('')

const shownContracts = computed(() => {
  const word = keyword.value.trim()
  const items = contracts.value.filter((item) => {
    if (status.value !== 'all' && item.status !== status.value) return false
    if (!word) return true
    return item.vendorName.includes(word) || item.service.includes(word)
  })
  return sort.value === 'uploaded' ? items.toSorted((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)) : items
})
</script>

<template>
  <div class="space-y-4 px-5 pt-4 pb-5">
    <div class="relative">
      <SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="keyword" type="search" aria-label="搜尋合約" placeholder="搜尋廠商或服務項目" class="pl-10" />
    </div>

    <FilterChips v-model="status" :options="STATUS_FILTERS" />
    <!-- 同一行：左邊件數、右邊排序（灰色小字） -->
    <div class="flex items-center justify-between gap-3">
      <p class="type-date text-muted-foreground">{{ loading ? '' : `共 ${shownContracts.length} 份合約` }}</p>
      <SortSelect v-model="sort" :options="SORT_OPTIONS" />
    </div>

    <template v-if="loading">
      <Skeleton v-for="n in 3" :key="n" class="h-[170px] rounded-xl" />
    </template>

    <!-- 沒有符合的合約 -->
    <Empty v-else-if="!shownContracts.length" class="gap-1 pt-6">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">沒有符合的合約</EmptyTitle>
      <EmptyDescription class="type-body">換個關鍵字或狀態試試看。</EmptyDescription>
    </Empty>

    <div v-else class="space-y-3">
      <AdminContractCard
        v-for="item in shownContracts"
        :key="item.id"
        :item="item"
        :contact-name="contacts[item.vendorId]"
        :to="`/committee/contracts/${item.id}`"
      />
    </div>
  </div>
</template>
