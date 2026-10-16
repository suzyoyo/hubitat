<script setup>
// 設備的一列（Kit：Admin/Equipment Row）：左邊類別圖示、名稱＋狀態徽章、位置｜廠商，右邊 ›
// 整列可以點，連到設備詳情
// 設計稿左邊是設備照片；假資料沒有照片，先放類別的圖示
import {
  ArrowDownUpIcon,
  CctvIcon,
  ChevronRightIcon,
  DropletIcon,
  FlameIcon,
  LightbulbIcon,
  WavesIcon,
  ZapIcon,
} from '@lucide/vue'
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { equipmentStatusBadge } from './equipmentStatusBadge'

const props = defineProps({
  // getEquipmentList() 回傳的一筆
  item: { type: Object, required: true },
  // 連到哪裡，例如 /committee/equipment/e-001
  to: { type: String, required: true },
})

// 設備類別 → 圖示（類別在 mocks/data/equipment.js 的 EQUIPMENT_CATEGORIES）
const CATEGORY_ICONS = {
  elevator: ArrowDownUpIcon,
  fire: FlameIcon,
  water: DropletIcon,
  power: ZapIcon,
  lighting: LightbulbIcon,
  security: CctvIcon,
  pool: WavesIcon,
}

const badge = computed(() => equipmentStatusBadge(props.item))
const detail = computed(() => {
  const vendor = props.item.vendorName ? `廠商：${props.item.vendorName}` : '沒有負責廠商'
  return `${props.item.place}｜${vendor}`
})
</script>

<template>
  <RouterLink :to="to" class="flex items-center gap-3 rounded-xl bg-card p-3 shadow-card">
    <span class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
      <component :is="CATEGORY_ICONS[item.category]" class="size-7" />
    </span>
    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex items-start gap-2">
        <p class="min-w-0 flex-1 type-body-strong text-foreground">{{ item.name }}</p>
        <Badge :variant="badge.variant" class="shrink-0">{{ badge.text }}</Badge>
      </div>
      <p class="type-date text-muted-foreground">{{ detail }}</p>
    </div>
    <ChevronRightIcon class="size-5 shrink-0" />
  </RouterLink>
</template>
