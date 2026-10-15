<script setup>
// 案件詳情「關聯設備」卡片裡的選擇設備：Combobox（ui/combobox，2026-10-15 改）
//   照 shadcn 的 Combobox「Basic」＋「Clear Button」：框本身就是輸入框，點了往下展開設備清冊，在框裡打字就篩選（名稱或位置）
//   右邊 ✕ 清掉打的字、箭頭展開或收起；選好的那台打勾
//   選好後再點，框上的字會整段選起來，直接打字就是重新搜尋，不用先刪字
//   選一台就記下來（v-model:draft）；真的存是按頁面底部的「更新進度」
// 選了設備，結案時才會記進這台設備的維修紀錄（docs/case-flow.md）
import { CheckIcon, ChevronDownIcon, XIcon } from '@lucide/vue'
import { computed } from 'vue'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxCancel,
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

// 框上顯示、清單裡打勾的那台：記下來的，沒有就是存好的
const selected = computed({
  get: () => props.devices.find((device) => device.name === (draft.value?.name ?? props.current.name)),
  // 選一台就記下來；選回原本那台就不用記
  set: (device) => {
    if (!device) return // 按 ✕ 只是清掉打的字，不是取消關聯
    draft.value =
      device.name === props.current.name ? null : { equipmentId: device.id, name: device.name, place: device.place }
  },
})

// 點進框裡時，把框上的字整段選起來，直接打字就會取代掉
function selectAll(event) {
  event.target.select()
}
</script>

<template>
  <!-- by="id"：用設備編號判斷是不是同一台；open-on-click：點框就展開 -->
  <Combobox v-model="selected" by="id" open-on-click>
    <!-- 外框看起來和輸入框一樣；點進去時外框有藍色光暈 -->
    <ComboboxAnchor
      class="relative flex h-11 w-full items-center rounded-lg border border-input bg-card focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
    >
      <ComboboxInput
        :display-value="(device) => device?.name ?? ''"
        aria-label="關聯設備"
        placeholder="選擇或搜尋設備"
        class="h-full border-0 bg-transparent pr-20 focus-visible:ring-0"
        @focus="selectAll"
      />
      <!-- ✕：清掉框裡打的字（框裡有字才有用）；按鈕看起來 28px，可以點的範圍補到 44px -->
      <ComboboxCancel
        aria-label="清除"
        class="absolute right-10 flex size-7 items-center justify-center rounded-full text-muted-foreground before:absolute before:-inset-2"
      >
        <XIcon class="size-4" />
      </ComboboxCancel>
      <ComboboxTrigger
        aria-label="展開設備清單"
        class="absolute right-2 flex size-7 items-center justify-center text-muted-foreground before:absolute before:-inset-2"
      >
        <ChevronDownIcon class="size-4" />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxList>
      <ComboboxEmpty>清冊裡沒有符合的設備</ComboboxEmpty>
      <ComboboxGroup class="max-h-64 overflow-y-auto">
        <!-- text-value：打字時用名稱＋位置來比對 -->
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
