<script setup>
// 管委會端・設備詳情（設計稿 1134:16556）：位置與狀態、合約提醒、設備資訊、保養、維修史
// 案件詳情「關聯設備」的「查看設備」、廠商詳細的「負責設備」都連到這裡
// 案件結案時，有關聯設備的會在這台設備的維修史多一筆（case-flow 4-7），點了回到那件案件
// 這一版只有「看」；「新增一筆紀錄」「編輯設備資料」「標記為已報廢」之後再做（還沒有假 API）
import { ChevronRightIcon } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { equipmentStatusBadge } from '@/components/admin/equipmentStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate } from '@/lib/date'
import { getContractById, getEquipmentById, getVendorById } from '@/mocks/api'
import { MAINTENANCE_CYCLES } from '@/mocks/data/equipment'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const SHOW_FIRST = 5 // 維修史先列幾筆，其他按「查看全部」

// 網址是 /committee/equipment/:id
const route = useRoute()

const loading = ref(true)
const device = ref(null) // 這台設備；編號不存在時是 undefined
const contract = ref(null) // 負責廠商目前的合約；沒有就是 null
const showAllRecords = ref(false)

async function load() {
  if (!route.params.id) return // 正要離開這一頁，不用拿
  loading.value = true
  device.value = await getEquipmentById(route.params.id, 'committee')
  const vendor = device.value?.vendorId ? await getVendorById(device.value.vendorId) : null
  contract.value = vendor?.contractId ? await getContractById(vendor.contractId, 'committee') : null
  showAllRecords.value = false
  loading.value = false
}
// 從一台設備連到另一台時，Vue 會沿用同一個頁面，所以看網址有沒有變
watch(() => route.params.id, load, { immediate: true })

// 狀態徽章：規則在 admin/equipmentStatusBadge.js，設備清冊共用
const statusBadge = computed(() => equipmentStatusBadge(device.value))

// 位置：A 棟 › A 棟 1 樓機房（範圍 › 安裝位置）
const locationText = computed(() => `${device.value.areaName} › ${device.value.place}`)

// 合約提醒：負責廠商的合約會在下次保養前到期（設計稿的提醒框）
const contractAlert = computed(() => {
  const next = device.value.nextMaintenanceAt
  if (!contract.value || !next || contract.value.endDate >= next) return ''
  return `負責廠商的合約（${formatFullDate(contract.value.endDate)} 到期）將在下次保養（${formatFullDate(next)}）前到期，請確認是否續約。`
})

// ── 設備資訊 ─────────────────────────────────
const infoRows = computed(() => {
  const item = device.value
  const rows = [
    { label: '安裝日期', value: `${formatFullDate(item.installedAt)}（已使用 ${item.yearsInUse} 年）` },
    { label: '保固到期日', value: `${formatFullDate(item.warrantyUntil)}（${item.inWarranty ? '保固中' : '已過保固'}）` },
    { label: '負責廠商', value: item.vendorName || '沒有負責廠商' },
  ]
  if (item.spec) rows.splice(0, 0, { label: '規格', value: item.spec })
  return rows
})

// ── 保養 ───────────────────────────────────
const hasMaintenance = computed(() => Boolean(device.value.cycle))
// 保養徽章：逾期紅、7 天內橘、其他灰
const maintenanceBadge = computed(() => {
  const days = device.value.daysToMaintenance
  if (days === null) return null
  if (days < 0) return { variant: 'destructive', text: `逾期 ${-days} 天` }
  if (days === 0) return { variant: 'secondary', text: '今天' }
  return { variant: device.value.displayStatus === 'due_soon' ? 'secondary' : 'outline', text: `再 ${days} 天` }
})
const maintenanceRows = computed(() => {
  const item = device.value
  return [
    { label: '保養週期', value: MAINTENANCE_CYCLES[item.cycle].label },
    { label: '上次保養', value: formatFullDate(item.lastMaintainedAt) },
    { label: '下次保養', value: formatFullDate(item.nextMaintenanceAt) },
  ]
})

// ── 維修史 ─────────────────────────────────
const RECORD_TYPES = { maintenance: '保養', repair: '維修' }
const shownRecords = computed(() =>
  showAllRecords.value ? device.value.records : device.value.records.slice(0, SHOW_FIRST),
)
</script>

<template>
  <div class="space-y-4 px-5 pt-4 pb-5">
    <template v-if="loading">
      <Skeleton class="h-[60px] rounded-xl" />
      <Skeleton class="h-[160px] rounded-xl" />
      <Skeleton class="h-[160px] rounded-xl" />
      <Skeleton class="h-[240px] rounded-xl" />
    </template>

    <!-- 找不到這台設備 -->
    <Empty v-else-if="!device" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這台設備</EmptyTitle>
      <EmptyDescription class="type-body">可能已經刪除，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink to="/committee/files">回到社區</RouterLink>
      </Button>
    </Empty>

    <template v-else>
      <!-- 名稱、位置、狀態（設計稿的名稱在頂部列；頂部列的標題是固定的「設備詳情」，所以名稱放這裡） -->
      <section class="space-y-1">
        <div class="flex items-start gap-2">
          <h2 class="min-w-0 flex-1 type-card-title text-foreground">{{ device.name }}</h2>
          <Badge :variant="statusBadge.variant" class="mt-0.5 shrink-0">{{ statusBadge.text }}</Badge>
        </div>
        <p class="type-date text-muted-foreground">{{ locationText }}</p>
      </section>

      <!-- 合約提醒：合約會在下次保養前到期才出現 -->
      <section v-if="contractAlert" class="space-y-2 rounded-xl border bg-card p-4">
        <p class="type-body text-foreground">{{ contractAlert }}</p>
        <!-- 合約詳情還是佔位頁 -->
        <RouterLink
          :to="`/committee/contracts/${contract.id}`"
          class="flex min-h-11 items-center justify-end gap-1 type-link text-foreground"
        >
          查看合約
          <ChevronRightIcon class="size-4" />
        </RouterLink>
      </section>

      <!-- 設備資訊 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">設備資訊</h2>
        <div v-for="row in infoRows" :key="row.label" class="flex items-baseline gap-3">
          <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
          <p class="min-w-0 flex-1 text-right type-body-strong text-foreground">{{ row.value }}</p>
        </div>
      </section>

      <!-- 保養：不需要定期保養的設備不顯示 -->
      <section v-if="hasMaintenance" class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-start gap-2">
          <h2 class="min-w-0 flex-1 type-card-title text-foreground">保養</h2>
          <Badge v-if="maintenanceBadge" :variant="maintenanceBadge.variant" class="mt-0.5 shrink-0">
            {{ maintenanceBadge.text }}
          </Badge>
        </div>
        <div v-for="row in maintenanceRows" :key="row.label" class="flex items-baseline gap-3">
          <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
          <p class="min-w-0 flex-1 text-right type-body-strong text-foreground">{{ row.value }}</p>
        </div>
      </section>

      <!-- 維修史：保養和維修紀錄，新的在前；從案件來的維修可以點回那件案件 -->
      <section class="space-y-1 rounded-xl bg-card p-4 shadow-card">
        <h2 class="pb-2 type-card-title text-foreground">維修史</h2>
        <p v-if="!device.records.length" class="type-body text-muted-foreground">還沒有紀錄</p>
        <template v-for="(record, index) in shownRecords" :key="record.id">
          <Separator v-if="index > 0" />
          <div class="space-y-0.5 py-3">
            <p class="type-date text-muted-foreground">{{ formatFullDate(record.date) }}</p>
            <div class="flex items-start gap-2">
              <p class="min-w-0 flex-1 type-body-strong text-foreground">{{ record.title }}</p>
              <Badge variant="outline" class="mt-0.5 shrink-0">{{ RECORD_TYPES[record.type] }}</Badge>
            </div>
            <!-- 廠商、費用（費用只有管委會看得到，假 API 給其他角色時會拿掉） -->
            <p class="type-date text-muted-foreground">
              {{ record.vendorName || '沒有廠商' }}<template v-if="record.cost">・{{ record.cost.toLocaleString() }} 元</template>
            </p>
            <RouterLink
              v-if="record.caseId"
              :to="`/committee/cases/${record.caseId}`"
              class="flex min-h-11 items-center justify-end gap-1 type-link text-foreground"
            >
              查看案件
              <ChevronRightIcon class="size-4" />
            </RouterLink>
          </div>
        </template>
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
      </section>
    </template>
  </div>
</template>
