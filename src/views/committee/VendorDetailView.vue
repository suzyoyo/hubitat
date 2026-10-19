<script setup>
// 管委會端・廠商詳細：基本資料、施工表現、聯絡窗口、合約、負責設備、服務紀錄（設計稿 1134:16085）
// 這一版只有「看」；底部的「編輯廠商資料」「變更狀態」之後再做
import { ChevronRightIcon, PhoneCallIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { contractBadge } from '@/components/admin/contractBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate } from '@/lib/date'
import { getContractById, getVendorById } from '@/mocks/api'
import { VENDOR_STATUSES } from '@/mocks/data/vendors'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// 網址是 /committee/vendors/:id
const route = useRoute()

const loading = ref(true)
const vendor = ref(null) // 編號不存在時，假 API 會回傳 undefined
const contract = ref(null) // 目前的合約；沒有合約是 null

onMounted(async () => {
  vendor.value = await getVendorById(route.params.id)
  if (vendor.value?.contractId) contract.value = await getContractById(vendor.value.contractId, 'committee')
  loading.value = false
})

// 合作狀態徽章：合作中、候選、停用都只是分類，用灰色
const statusLabel = computed(() => VENDOR_STATUSES[vendor.value.status].label)

// ── 施工表現 ─────────────────────────────────
const stats = computed(() => vendor.value.stats)
// 保養完成：有約定次數寫「11 / 12 次」，沒有就只寫完成幾次
const maintenanceText = computed(() =>
  stats.value.maintenancePlanned ? ` / ${stats.value.maintenancePlanned} 次` : ' 次',
)

// ── 合約 ───────────────────────────────────
// 合約徽章：規則在 admin/contractBadge.js，合約列表、合約詳情共用
const badge = computed(() => contract.value && contractBadge(contract.value))

const contractRows = computed(() => {
  const item = contract.value
  const rows = [{ label: '合約期間', value: `${formatFullDate(item.startDate)}～${formatFullDate(item.endDate)}` }]
  // 金額只有管委會看得到，假 API 給其他角色時會拿掉
  if (item.amount) rows.push({ label: '合約金額', value: `${item.amount.toLocaleString()} 元／年` })
  rows.push({ label: '服務內容', value: item.service })
  if (item.frequency) rows.push({ label: '承諾頻率', value: item.frequency })
  return rows
})

// 合約檔案總共幾頁
const filePages = computed(() => (contract.value.files ?? []).reduce((sum, file) => sum + file.pages, 0))

// ── 服務紀錄 ─────────────────────────────────
// 先列最新的 4 筆，按「查看全部」才全部列出來
const SHOW_FIRST = 4
const showAllRecords = ref(false)
const shownRecords = computed(() =>
  showAllRecords.value ? vendor.value.serviceRecords : vendor.value.serviceRecords.slice(0, SHOW_FIRST),
)

// 打電話用的連結：tel: 後面放電話號碼（拿掉 -）
function telLink(phone) {
  return `tel:${phone.replaceAll('-', '')}`
}
</script>

<template>
  <div class="space-y-4 px-5 pt-4 pb-5">
    <template v-if="loading">
      <Skeleton class="h-[146px] rounded-xl" />
      <Skeleton class="h-[306px] rounded-xl" />
      <Skeleton class="h-[293px] rounded-xl" />
    </template>

    <!-- 找不到這家廠商 -->
    <Empty v-else-if="!vendor" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這家廠商</EmptyTitle>
      <EmptyDescription class="type-body">可能已經刪除，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink to="/committee/vendors/list">回到廠商名冊</RouterLink>
      </Button>
    </Empty>

    <template v-else>
      <!-- 基本資料 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-start gap-2">
          <h2 class="min-w-0 flex-1 type-card-title text-foreground">{{ vendor.name }}</h2>
          <Badge variant="outline" class="mt-0.5 shrink-0">{{ statusLabel }}</Badge>
        </div>
        <p class="type-date text-muted-foreground">統一編號：{{ vendor.taxId }}</p>
        <div class="space-y-2">
          <p class="type-date text-muted-foreground">處理項目</p>
          <div class="flex flex-wrap gap-1.5">
            <Badge v-for="service in vendor.services" :key="service" variant="outline">{{ service }}</Badge>
          </div>
        </div>
      </section>

      <!-- 施工表現：從案件和設備紀錄算出來的 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-baseline justify-between gap-2">
          <h2 class="type-card-title text-foreground">施工表現</h2>
          <p class="type-date text-muted-foreground">合約期間統計</p>
        </div>
        <div class="space-y-1 rounded-lg bg-brand-subtle p-4">
          <!-- 小標用黑色內文（2026-10-19：原本灰色小字，太像 wireframe） -->
          <p class="type-body text-foreground">平均修復時間</p>
          <!-- 數字是重點，放大到 40px（2026-10-19） -->
          <p class="text-[40px] leading-[48px] font-bold text-foreground">
            {{ stats.averageRepairDays ?? '—' }}
            <span v-if="stats.averageRepairDays !== null" class="type-body-strong">天</span>
          </p>
          <p class="type-date text-muted-foreground">
            {{ stats.repairCount ? `通報 ${stats.repairCount} 件・從通報到完成的平均天數` : '還沒有完成的通報' }}
          </p>
        </div>
        <!-- 兩格的樣子和首頁「交辦進度」「提案與簽核」一樣：白底、品牌藍外框（2026-10-19） -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1 rounded-xl border border-primary bg-card p-3.5">
            <p class="type-body text-foreground">通報件數</p>
            <p class="type-title text-foreground">{{ stats.repairCount }} <span class="type-body-strong">件</span></p>
          </div>
          <div class="space-y-1 rounded-xl border border-primary bg-card p-3.5">
            <p class="type-body text-foreground">保養完成</p>
            <p class="type-title text-foreground">
              {{ stats.maintenanceDone }}<span class="type-body-strong">{{ maintenanceText }}</span>
            </p>
          </div>
        </div>
      </section>

      <!-- 聯絡窗口：一列一位、整列都是打電話的連結，樣子和廠商分頁的「廠商緊急聯絡」一樣（2026-10-19：原本是灰底方塊） -->
      <section class="space-y-1 rounded-xl bg-card p-4 shadow-card">
        <h2 class="pb-2 type-card-title text-foreground">聯絡窗口</h2>
        <template v-for="(contact, index) in vendor.contacts" :key="contact.phone">
          <Separator v-if="index > 0" />
          <a
            :href="telLink(contact.phone)"
            :aria-label="`打電話給${contact.name}，${contact.phone}`"
            class="flex items-center gap-3 py-3"
          >
            <div class="min-w-0 flex-1">
              <p class="flex flex-wrap items-center gap-x-2 type-body-strong text-foreground">
                {{ contact.name }}
                <span v-if="contact.title" class="type-date font-normal text-muted-foreground">{{ contact.title }}</span>
                <Badge v-if="contact.isEmergency" variant="outline">緊急清單</Badge>
              </p>
              <p class="type-date text-muted-foreground">{{ contact.phone }}</p>
            </div>
            <!-- 電話圖示：提示點了會打電話（整張已經是連結，這裡只是圖示） -->
            <span class="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
              <PhoneCallIcon class="size-5" />
            </span>
          </a>
        </template>
      </section>

      <!-- 合約資訊 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-start gap-2">
          <h2 class="min-w-0 flex-1 type-card-title text-foreground">合約資訊</h2>
          <Badge v-if="contract" :variant="badge.variant" class="mt-0.5 shrink-0">{{ badge.text }}</Badge>
          <Badge v-else variant="destructive" class="mt-0.5 shrink-0">無合約</Badge>
        </div>
        <template v-if="contract">
          <div v-for="row in contractRows" :key="row.label" class="flex items-baseline gap-3">
            <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
            <p class="min-w-0 flex-1 text-right type-body-strong text-foreground">{{ row.value }}</p>
          </div>
          <!-- ghost 按鈕（2026-10-19 按鈕規則：不強調的動作）；-mr-3 讓箭頭和卡片內容右邊切齊 -->
          <div v-if="filePages" class="flex justify-end">
            <Button as-child variant="ghost" class="-mr-3">
              <RouterLink :to="`/committee/contracts/${contract.id}`">
                查看合約檔案（{{ filePages }} 頁）
                <ChevronRightIcon class="size-4" />
              </RouterLink>
            </Button>
          </div>
        </template>
        <p v-else class="type-body text-muted-foreground">目前沒有生效中的合約</p>
      </section>

      <!-- 負責設備：連到設備詳情（還是佔位頁） -->
      <section v-if="vendor.equipment.length" class="space-y-1 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-baseline justify-between gap-2 pb-2">
          <h2 class="type-card-title text-foreground">負責設備</h2>
          <p class="type-date text-muted-foreground">點設備看維修歷程</p>
        </div>
        <template v-for="(item, index) in vendor.equipment" :key="item.id">
          <Separator v-if="index > 0" />
          <RouterLink :to="`/committee/equipment/${item.id}`" class="flex items-center gap-3 py-3">
            <div class="min-w-0 flex-1">
              <p class="type-body-strong text-foreground">{{ item.name }}</p>
              <p class="type-date text-muted-foreground">{{ item.spec }}</p>
            </div>
            <ChevronRightIcon class="size-5 shrink-0" />
          </RouterLink>
        </template>
      </section>

      <!-- 服務紀錄：這家廠商在各設備留下的紀錄，新的在前 -->
      <section class="space-y-1 rounded-xl bg-card p-4 shadow-card">
        <h2 class="pb-2 type-card-title text-foreground">服務紀錄</h2>
        <p v-if="!vendor.serviceRecords.length" class="type-body text-muted-foreground">還沒有服務紀錄</p>
        <template v-for="(record, index) in shownRecords" :key="record.id">
          <Separator v-if="index > 0" />
          <div class="flex items-baseline gap-3 py-3">
            <p class="w-[88px] shrink-0 type-date text-muted-foreground">{{ formatFullDate(record.date) }}</p>
            <div class="min-w-0 flex-1">
              <p class="type-body-strong text-foreground">{{ record.title }}</p>
              <p class="type-date text-muted-foreground">標的：{{ record.equipmentName }}</p>
            </div>
          </div>
        </template>
        <!-- 超過 4 筆才有「查看全部」；ghost 按鈕（2026-10-19 按鈕規則） -->
        <div v-if="!showAllRecords && vendor.serviceRecords.length > SHOW_FIRST" class="flex justify-end">
          <Button type="button" variant="ghost" class="-mr-3" @click="showAllRecords = true">
            查看全部 {{ vendor.serviceRecords.length }} 筆紀錄
            <ChevronRightIcon class="size-4" />
          </Button>
        </div>
      </section>
    </template>
  </div>
</template>
