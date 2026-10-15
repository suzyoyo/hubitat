<script setup>
// 案件詳情「關聯設備」卡片裡的選擇設備：用 Combobox（ui/combobox）做的下拉選單（2026-10-15 改）
//   點了展開設備清冊，最上面的搜尋框可以打字篩選（名稱或位置）；選好後再點，一樣展開完整的清冊，不用先刪字
//   選一台就記下來（v-model:draft）；真的存是按頁面底部的「更新進度」
// 選了設備，結案時才會記進這台設備的維修紀錄（docs/case-flow.md）
import { CheckIcon, ChevronDownIcon, SearchIcon } from '@lucide/vue'
import { computed } from 'vue'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'

const props = defineProps({
  // 可以選的設備：getEquipmentList() 回傳的清單（已報廢的頁面會先拿掉）
  devices: { type: Array, required: true },
  // 已經存好的設備：{ name, place }；還沒關聯就是空字串
  current: { type: Object, default: () => ({ name: '', place: '' }) },
})

// 記下來、還沒存的選擇：{ equipmentId, name, place }，沒有就是 null
const draft = defineModel('draft', { type: Object, default: null })

// 選單框上顯示、清單裡打勾的那台：記下來的，沒有就是存好的
const selected = computed({
  get: () => props.devices.find((device) => device.name === (draft.value?.name ?? props.current.name)),
  // 選一台就記下來；選回原本那台就不用記
  set: (device) => {
    draft.value =
      !device || device.name === props.current.name
        ? null
        : { equipmentId: device.id, name: device.name, place: device.place }
  },
})
</script>

<template>
  <!-- by="id"：用設備編號判斷是不是同一台 -->
  <Combobox v-model="selected" by="id">
    <ComboboxAnchor as-child>
      <ComboboxTrigger as-child>
        <!-- 看起來和輸入框一樣的選單框：左邊是選好的設備（沒選是灰色「選擇設備」），右邊往下的箭頭 -->
        <button
          type="button"
          aria-label="關聯設備"
          class="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-left outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span class="truncate type-body" :class="selected ? 'text-foreground' : 'text-muted-foreground'">
            {{ selected?.name ?? '選擇設備' }}
          </span>
          <ChevronDownIcon class="size-4 shrink-0 text-muted-foreground" />
        </button>
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxList>
      <!-- 搜尋框：Combobox 會照每一項的 text-value（名稱＋位置）篩選 -->
      <div class="relative">
        <SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <ComboboxInput aria-label="搜尋設備" placeholder="搜尋設備名稱或位置" class="pl-9" />
      </div>
      <ComboboxEmpty>清冊裡沒有符合的設備</ComboboxEmpty>
      <ComboboxGroup class="max-h-64 overflow-y-auto">
        <ComboboxItem v-for="device in devices" :key="device.id" :value="device" :text-value="`${device.name} ${device.place}`">
          <span class="min-w-0 flex-1">
            <span class="block type-body text-foreground">{{ device.name }}</span>
            <span class="block type-date text-muted-foreground">{{ device.place }}</span>
          </span>
          <!-- 目前選的那台打勾 -->
          <ComboboxItemIndicator>
            <CheckIcon class="size-4 shrink-0 text-foreground" />
          </ComboboxItemIndicator>
        </ComboboxItem>
      </ComboboxGroup>
    </ComboboxList>
  </Combobox>
</template>
