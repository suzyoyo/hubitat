<script setup>
// 篩選、排序用的下拉選單（Kit 是 Button Small 膠囊形＋⌄，選單照 Combobox 頁的選項）
// 規則見 docs/dev-guide.md 第 5 節「篩選」：選項 5 個以上用這個，4 個以內用 FilterChips
// 用法：<FilterSelect v-model="sort" label="排序" :options="[{ value: 'due', label: '到期日' }]" />
import { computed } from 'vue'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

const props = defineProps({
  // 按鈕上冒號前面的字，例如「類型」→ 按鈕顯示「類型：全部」
  label: { type: String, required: true },
  // 選項清單：value 是程式用的值，label 是畫面上的字
  options: { type: Array, required: true },
})

// 目前選到的值，頁面用 v-model 綁定
const model = defineModel({ type: String, required: true })

// 按鈕上顯示的目前選項文字
const selectedLabel = computed(() => props.options.find((option) => option.value === model.value)?.label ?? '')
</script>

<template>
  <Select v-model="model">
    <!-- 看起來 32px 高（h-8），after 往上下各補 6px，可以點的範圍是 44px -->
    <!-- type-button：字和一般按鈕一樣 14px，不要用 xs 的 12px -->
    <SelectTrigger
      class="relative h-8 w-full justify-center gap-1 rounded-full bg-card px-4 type-button text-foreground after:absolute after:inset-x-0 after:-inset-y-1.5"
    >
      {{ label }}：{{ selectedLabel }}
    </SelectTrigger>
    <SelectContent>
      <!-- 選項放大到 44px 高、字 16px（Kit 的選項是 28px、14px） -->
      <SelectItem v-for="option in options" :key="option.value" :value="option.value" class="min-h-11 px-3 type-body">
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
