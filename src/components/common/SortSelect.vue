<script setup>
// 排序用的下拉選單：灰色小字「排序：新增日期 ⌄」，放在列表上方靠右（設計稿手刻的，Kit 沒有這個元件）
// 篩選（選項 5 個以上）用 FilterSelect 的膠囊按鈕；排序一律用這個，兩種一看就分得出來
// 用法：<SortSelect v-model="sort" :options="[{ value: 'created', label: '新增日期' }]" />
import { computed } from 'vue'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

const props = defineProps({
  // 選項清單：value 是程式用的值，label 是畫面上的字
  options: { type: Array, required: true },
})

// 目前選到的值，頁面用 v-model 綁定
const model = defineModel({ type: String, required: true })

const selectedLabel = computed(() => props.options.find((option) => option.value === model.value)?.label ?? '')
</script>

<template>
  <Select v-model="model">
    <!-- 沒有外框、沒有底色，只有字和箭頭；箭頭是深色（設計稿） -->
    <!-- 字 16px 看起來約 24px 高，after 往上下各補 10px、左右各補 8px，可以點的範圍超過 44px -->
    <SelectTrigger
      class="relative h-auto gap-1 border-0 p-0 type-date text-muted-foreground after:absolute after:-inset-x-2 after:-inset-y-2.5 [&_svg]:text-foreground"
    >
      排序：{{ selectedLabel }}
    </SelectTrigger>
    <SelectContent align="end">
      <!-- 選項和 FilterSelect 一樣：44px 高、字 16px -->
      <SelectItem v-for="option in options" :key="option.value" :value="option.value" class="min-h-11 px-3 type-body">
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
