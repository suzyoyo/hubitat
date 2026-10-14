<script setup>
// 管委會端的廠商卡（對應 Figma 的 Admin/Vendor Card）
// 第一行廠商名稱＋合約徽章＋›；下面是「處理項目」和每一項的小標籤
import { computed } from 'vue'
import { ChevronRightIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { CONTRACT_STATUSES } from '@/mocks/data/contracts'

const props = defineProps({
  // getVendors() 回傳的其中一筆
  vendor: { type: Object, required: true },
  // 點卡片要連到哪一頁
  to: { type: String, default: '' },
})

// 合約徽章（dev-guide 第 5 節管理端的顏色）
//   沒有合約 → 紅：已經出問題
//   即將到期 → 橘：快到期了，要處理續約
//   尚未生效 → 藍：在等合約開始
//   合約內   → 灰：正常
const contractBadge = computed(() => {
  const status = props.vendor.contractStatus
  if (status === 'none') return { variant: 'destructive', text: '無合約' }
  const variant = { expiring: 'secondary', upcoming: 'default' }[status] ?? 'outline'
  return { variant, text: CONTRACT_STATUSES[status].label }
})
</script>

<template>
  <RouterLink :to="to" class="block space-y-3 rounded-xl bg-card p-4 shadow-card">
    <!-- 第一行：名稱、合約徽章、›（徽章放在箭頭左邊） -->
    <div class="flex items-start gap-2">
      <h3 class="min-w-0 flex-1 type-card-title text-foreground">{{ vendor.name }}</h3>
      <Badge :variant="contractBadge.variant" class="mt-0.5 shrink-0">{{ contractBadge.text }}</Badge>
      <ChevronRightIcon class="mt-1 size-4 shrink-0" />
    </div>
    <div class="space-y-2">
      <p class="type-date text-muted-foreground">處理項目</p>
      <div class="flex flex-wrap gap-1.5">
        <Badge v-for="service in vendor.services" :key="service" variant="outline">{{ service }}</Badge>
      </div>
    </div>
  </RouterLink>
</template>
