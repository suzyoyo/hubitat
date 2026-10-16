<script setup>
// 合約卡（Kit：Admin/Contract Card）：廠商名稱＋狀態徽章、合約期間、合約金額、負責窗口，右下「查看詳情 ›」
// 整張卡可以點，連到合約詳情
// 合約金額只有管委會看得到：假 API 給管理人員時沒有 amount，這一列就不顯示
import { ChevronRightIcon } from '@lucide/vue'
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { formatFullDate } from '@/lib/date'
import { contractBadge } from './contractBadge'

const props = defineProps({
  // getContracts() 回傳的一筆
  item: { type: Object, required: true },
  // 負責窗口的名字（從廠商資料來）；沒有就不顯示
  contactName: { type: String, default: '' },
  // 連到哪裡，例如 /committee/contracts/ct-001
  to: { type: String, required: true },
})

const badge = computed(() => contractBadge(props.item))
const rows = computed(() => {
  const list = [{ label: '合約期間', value: `${formatFullDate(props.item.startDate)}～${formatFullDate(props.item.endDate)}` }]
  if (props.item.amount) list.push({ label: '合約金額', value: `${props.item.amount.toLocaleString()} 元／年` })
  return list
})
</script>

<template>
  <RouterLink :to="to" class="block space-y-3 rounded-xl bg-card p-4 shadow-card">
    <div class="flex items-start gap-2">
      <h3 class="min-w-0 flex-1 type-card-title text-foreground">{{ item.vendorName }}</h3>
      <Badge :variant="badge.variant" class="mt-0.5 shrink-0">{{ badge.text }}</Badge>
    </div>
    <div v-for="row in rows" :key="row.label" class="flex items-baseline gap-3">
      <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
      <p class="min-w-0 flex-1 text-right type-body-strong text-foreground">{{ row.value }}</p>
    </div>
    <p v-if="contactName" class="type-date text-muted-foreground">負責窗口：{{ contactName }}</p>
    <!-- 只是提示「可以點」，整張卡本身就是連結 -->
    <p class="flex items-center justify-end gap-1 type-link text-foreground">
      查看詳情
      <ChevronRightIcon class="size-4" />
    </p>
  </RouterLink>
</template>
