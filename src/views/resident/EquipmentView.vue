<script setup>
// 住戶端・設備與維修史（「社區」分頁 → 設備與維修史）
// 設計稿：1089:15277。同一頁上面是設備清冊（可以捲動），點一台，下面顯示那台的資訊和維修史
// 住戶只看「能不能用」：待維修、維修中都顯示「維修中」，其他是「正常使用中」；
// 保養逾期、將到期是管理端要處理的事，不給住戶看；已報廢的設備不列（2026-10-16 suzy 決定）
// 費用只有管委會看得到（假 API 傳 'resident' 會拿掉）；維修史不能點，住戶看不到別人的案件
import { ArrowDownUpIcon, CctvIcon, ChevronRightIcon, DropletIcon, FlameIcon, LightbulbIcon, SearchIcon, WavesIcon, ZapIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import ArchiveHistoryRecord from '@/components/archive/ArchiveHistoryRecord.vue'
import FilterSelect from '@/components/common/FilterSelect.vue'
import { Badge } from '@/components/ui/badge'
import BottomCta from '@/components/app/BottomCta.vue'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate } from '@/lib/date'
import { getEquipmentList } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// 設備類別 → 圖示（和 admin/AdminEquipmentRow.vue 一樣）
const CATEGORY_ICONS = {
  elevator: ArrowDownUpIcon,
  fire: FlameIcon,
  water: DropletIcon,
  power: ZapIcon,
  lighting: LightbulbIcon,
  security: CctvIcon,
  pool: WavesIcon,
}
const RECORD_TYPES = { maintenance: '保養', repair: '維修' }
const SHOW_FIRST = 5 // 維修史先列幾筆，其他按「查看全部」

const loading = ref(true)
const devices = ref([])
const selectedId = ref('') // 目前選到的設備
const showAllRecords = ref(false)

// 點清冊的一台：換成那台，維修史收回只列 5 筆
function select(id) {
  selectedId.value = id
  showAllRecords.value = false
}

onMounted(async () => {
  const list = await getEquipmentList('resident')
  // 已報廢的不列；照設備編號排（和資料的順序一樣），不照「需要處理的在前」（那是管理端的排法）
  devices.value = list.filter((item) => item.status !== 'retired').toSorted((a, b) => a.id.localeCompare(b.id))
  loading.value = false
})

// 住戶看到的狀態：待維修、維修中 → 維修中（紅：今天會影響你）；其他 → 正常使用中（灰）
function isRepairing(item) {
  return ['needs_repair', 'repairing'].includes(item.displayStatus)
}

// 區域：用設備資料裡有的範圍做選項
const areaOptions = computed(() => {
  const names = new Map(devices.value.map((item) => [item.areaId, item.areaName]))
  const list = [...names].map(([value, label]) => ({ value, label }))
  return [{ value: 'all', label: '全部' }, ...list.toSorted((a, b) => a.value.localeCompare(b.value))]
})
const area = ref('all')

// 搜尋：比對設備名稱、位置、廠商
const keyword = ref('')

const shownDevices = computed(() => {
  const word = keyword.value.trim()
  return devices.value.filter((item) => {
    if (area.value !== 'all' && item.areaId !== area.value) return false
    if (!word) return true
    return [item.name, item.place, item.vendorName].some((text) => text?.includes(word))
  })
})

// 選到的設備：選的那台被篩掉的話，改顯示清單的第一台
const device = computed(
  () => shownDevices.value.find((item) => item.id === selectedId.value) ?? shownDevices.value[0],
)

const shownRecords = computed(() =>
  showAllRecords.value ? device.value.records : device.value.records.slice(0, SHOW_FIRST),
)

// 四格資訊：安裝位置、保固期限、負責廠商、最近保養
const tiles = computed(() => {
  const item = device.value
  const [year, month] = item.warrantyUntil.split('-')
  // 最近保養：有定期保養的用上次保養日；沒有的找最近一筆保養紀錄
  const lastMaintenance = item.lastMaintainedAt ?? item.records.find((record) => record.type === 'maintenance')?.date
  return [
    { label: '安裝位置', lines: [item.place] },
    { label: '保固期限', lines: [`至 ${year}/${month}`, item.inWarranty ? '（保固中）' : '（已過保固）'] },
    { label: '負責廠商', lines: [item.vendorName || '沒有負責廠商'] },
    {
      label: '最近保養',
      lines: lastMaintenance ? [formatFullDate(lastMaintenance), item.cycle ? '定期保養' : ''] : ['還沒有紀錄'],
    },
  ]
})
</script>

<template>
  <!-- pb-28：底部有固定的按鈕區，留空間給它 -->
  <div class="space-y-4 px-5 pt-4 pb-28">
    <div class="relative">
      <SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="keyword" type="search" aria-label="搜尋設備" placeholder="搜尋設備名稱或關鍵字" class="pl-10" />
    </div>

    <!-- 設計稿的下拉選單寬 180px，不佔滿一行 -->
    <div class="w-[180px]">
      <FilterSelect v-model="area" label="區域" :options="areaOptions" />
    </div>

    <template v-if="loading">
      <Skeleton class="h-[320px] rounded-xl" />
      <Skeleton class="h-[400px] rounded-xl" />
    </template>

    <!-- 沒有符合的設備 -->
    <Empty v-else-if="!shownDevices.length" class="gap-1 pt-6">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">沒有符合的設備</EmptyTitle>
      <EmptyDescription class="type-body">換個關鍵字或區域試試看。</EmptyDescription>
    </Empty>

    <template v-else>
      <!-- 設備清冊：清單固定高度、裡面自己捲動；選到的那台是淺藍底 -->
      <section class="space-y-3 pt-2">
        <div class="flex items-center gap-2">
          <h2 class="min-w-0 flex-1 type-card-title text-foreground">設備清冊</h2>
          <p class="shrink-0 type-note text-muted-foreground">共 {{ shownDevices.length }} 項</p>
        </div>
        <div class="flex max-h-[288px] flex-col gap-px overflow-y-auto rounded-xl border border-input bg-input">
          <button
            v-for="item in shownDevices"
            :key="item.id"
            type="button"
            :aria-pressed="item.id === device.id"
            class="flex min-h-16 shrink-0 items-center gap-2.5 px-3 py-2.5 text-left"
            :class="item.id === device.id ? 'bg-secondary' : 'bg-card'"
            @click="select(item.id)"
          >
            <component :is="CATEGORY_ICONS[item.category]" class="size-5 shrink-0 text-foreground" />
            <span class="min-w-0 flex-1">
              <span class="block type-body-strong text-foreground">{{ item.name }}</span>
              <span class="block type-date text-muted-foreground">{{ item.place }}</span>
            </span>
            <Badge v-if="isRepairing(item)" variant="destructive" class="shrink-0">維修中</Badge>
          </button>
        </div>
      </section>

      <!-- 選到的設備 -->
      <section class="space-y-4 pt-2">
        <div class="flex items-start gap-2">
          <h2 class="min-w-0 flex-1 type-card-title text-foreground">{{ device.name }}</h2>
          <Badge :variant="isRepairing(device) ? 'destructive' : 'outline'" class="mt-0.5 shrink-0">
            {{ isRepairing(device) ? '維修中' : '正常使用中' }}
          </Badge>
        </div>

        <!-- 四格資訊，兩格一行 -->
        <div class="grid grid-cols-2 gap-2">
          <div v-for="tile in tiles" :key="tile.label" class="space-y-1 rounded-xl bg-card p-3 shadow-card">
            <p class="type-note text-muted-foreground">{{ tile.label }}</p>
            <p v-for="line in tile.lines.filter(Boolean)" :key="line" class="type-body-strong text-foreground">
              {{ line }}
            </p>
          </div>
        </div>

        <h3 class="type-card-title text-foreground">維修史</h3>
        <p v-if="!device.records.length" class="type-body text-muted-foreground">還沒有紀錄</p>
        <div v-else class="space-y-3">
          <ArchiveHistoryRecord
            v-for="record in shownRecords"
            :key="record.id"
            :date="record.date"
            :title="record.title"
            :label="RECORD_TYPES[record.type]"
          />
          <!-- 超過 5 筆才有「查看全部」 -->
          <button
            v-if="!showAllRecords && device.records.length > SHOW_FIRST"
            type="button"
            class="flex min-h-11 w-full items-center justify-end gap-1 type-link text-foreground"
            @click="showAllRecords = true"
          >
            查看全部（{{ device.records.length }} 筆）
            <ChevronRightIcon class="size-4" />
          </button>
        </div>
      </section>

      <!-- 設備有問題就去通報：網址帶設備編號，新增通報會先填好地點、類型和設備名稱
           2026-10-19 從卡片裡的淺藍按鈕改成底部固定的主要按鈕 -->
      <BottomCta>
        <Button as-child>
          <RouterLink :to="`/resident/reports/new?equipment=${device.id}`">新增通報</RouterLink>
        </Button>
      </BottomCta>
    </template>
  </div>
</template>
