<script setup>
// 篩選標籤：一排膠囊形按鈕，選一個（Kit 是 Button Small 膠囊形：沒選中是外框、選中是藍底）
// 規則見 docs/dev-guide.md 第 5 節「篩選」：選項 4 個以內用這個，5 個以上用 FilterSelect
// 用法：<FilterChips v-model="filter" :options="[{ value: 'all', label: '全部' }]" />
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

defineProps({
  // 選項清單：value 是程式用的值，label 是畫面上的字
  options: { type: Array, required: true },
})

// 目前選到的值，頁面用 v-model 綁定
const model = defineModel({ type: String, required: true })

// toggle-group 的單選模式，點已經選中的那一個會變成「什麼都沒選」（值是空的）
// 篩選一定要選一個，所以沒有值的時候不更新，維持原本的選擇
function select(value) {
  if (value) model.value = value
}
</script>

<template>
  <!-- spacing="2"：標籤之間留 8px，不黏在一起 -->
  <ToggleGroup type="single" :spacing="2" :model-value="model" @update:model-value="select">
    <!-- 看起來 32px 高（toggle 預設 h-8），after 往上下各補 6px，可以點的範圍是 44px -->
    <!-- type-button：字和一般按鈕一樣 14px -->
    <ToggleGroupItem
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      class="relative rounded-full border border-input bg-card px-4 type-button text-foreground after:absolute after:inset-x-0 after:-inset-y-1.5 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary"
    >
      {{ option.label }}
    </ToggleGroupItem>
  </ToggleGroup>
</template>
