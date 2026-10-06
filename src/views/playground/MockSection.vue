<script setup>
// 假資料：示範怎麼從假 API 取得資料並顯示（資料在 src/mocks/）
import { onMounted, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate } from '@/lib/date'
import {
  MOCK_TODAY,
  getCommitteeMembers,
  getContracts,
  getCurrentUser,
  getEquipmentList,
  getStaffMembers,
  getVendors,
} from '@/mocks/api'
import { CONTRACT_STATUSES } from '@/mocks/data/contracts'
import { EQUIPMENT_DISPLAY_STATUSES } from '@/mocks/data/equipment'
import { VENDOR_STATUSES } from '@/mocks/data/vendors'

// 畫面要用的資料，一開始都是空的
const loading = ref(true)
const currentUsers = ref([])
const committee = ref([])
const staff = ref([])
const vendors = ref([])
const contracts = ref([])
const equipment = ref([])

// async / await：等資料回來再繼續往下執行
async function loadData() {
  loading.value = true
  // Promise.all：多個請求同時送出，全部回來後一起拿結果（比一個一個等快）
  const [resident, committeeUser, staffUser, committeeList, staffList, vendorList, contractList, equipmentList] =
    await Promise.all([
      getCurrentUser('resident'),
      getCurrentUser('committee'),
      getCurrentUser('staff'),
      getCommitteeMembers(),
      getStaffMembers(),
      getVendors(),
      getContracts('committee'),
      getEquipmentList('committee'),
    ])
  currentUsers.value = [resident, committeeUser, staffUser]
  committee.value = committeeList
  staff.value = staffList
  vendors.value = vendorList
  contracts.value = contractList
  equipment.value = equipmentList
  loading.value = false
}

// onMounted：元件顯示到畫面上之後，自動執行一次
onMounted(loadData)

// 把「距離幾天」轉成文字：7 → 「7 天後」，-11 → 「逾期 11 天」
function daysText(days) {
  if (days === null) return '不需定期保養'
  if (days < 0) return `逾期 ${-days} 天`
  if (days === 0) return '今天'
  return `${days} 天後`
}
</script>

<template>
  <section id="mock" class="scroll-mt-40 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold">假資料</h2>
        <p class="text-xs text-muted-foreground">假裝今天是 {{ formatFullDate(MOCK_TODAY) }}</p>
      </div>
      <Button size="sm" variant="outline" @click="loadData">重新載入</Button>
    </div>

    <!-- 載入中：顯示灰色佔位框 -->
    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-5 w-1/2" />
      <Skeleton class="h-20 w-full" />
      <Skeleton class="h-20 w-full" />
    </div>

    <!-- 載入完成 -->
    <template v-else>
      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">三端目前登入的人 getCurrentUser()</h3>
        <div v-for="user in currentUsers" :key="user.currentRole" class="rounded-lg border bg-card p-3">
          <p class="type-body-strong">{{ user.displayName }}</p>
          <p class="type-date text-muted-foreground">{{ user.currentRole }}・{{ user.titleLabel }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">委員與管理人員</h3>
        <div class="flex flex-wrap gap-2">
          <Badge v-for="member in committee" :key="member.id" variant="secondary">{{ member.shortName }}</Badge>
          <Badge v-for="member in staff" :key="member.id" variant="outline">
            {{ member.titleLabel }} {{ member.displayName }}
          </Badge>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">廠商 getVendors()：{{ vendors.length }} 家</h3>
        <div class="flex flex-wrap gap-2">
          <!-- 用 status 當 key，到 VENDOR_STATUSES 查出要顯示的文字 -->
          <Badge v-for="vendor in vendors" :key="vendor.id" variant="outline">
            {{ vendor.name }}・{{ VENDOR_STATUSES[vendor.status].label }}
          </Badge>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">合約 getContracts()：{{ contracts.length }} 份</h3>
        <div v-for="contract in contracts" :key="contract.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ contract.vendorName }}</p>
            <Badge variant="secondary" class="shrink-0">{{ CONTRACT_STATUSES[contract.status].label }}</Badge>
          </div>
          <p class="type-date text-text-secondary">
            {{ formatFullDate(contract.startDate) }} ～ {{ formatFullDate(contract.endDate) }}
          </p>
          <!-- toLocaleString()：把 92000 顯示成 92,000 -->
          <p class="type-date text-muted-foreground">
            {{ contract.amount.toLocaleString() }} 元／年・{{ daysText(contract.daysLeft) }}到期
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">設備 getEquipmentList()：{{ equipment.length }} 項</h3>
        <div v-for="item in equipment" :key="item.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ item.name }}</p>
            <Badge variant="secondary" class="shrink-0">
              {{ EQUIPMENT_DISPLAY_STATUSES[item.displayStatus].label }}
            </Badge>
          </div>
          <p class="type-date text-text-secondary">{{ item.place }}｜廠商：{{ item.vendorName || '無' }}</p>
          <p class="type-date text-muted-foreground">下次保養：{{ daysText(item.daysToMaintenance) }}</p>
        </div>
      </div>
    </template>
  </section>
</template>
