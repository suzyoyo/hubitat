<script setup>
// 案件詳情「問題分類」卡片裡的下拉選單（2026-10-17 加）
//   住戶通報時先歸「其他」，受理後在這裡改成正確的分類（docs/case-flow.md 4-1-0）
//   Select 下拉（7 個選項，照 dev-guide「5 個以上用下拉」）；一定有選好的值，所以不標「選填」
//   選了就記下來（v-model:draft）；真的存是按頁面底部的「更新進度」，和其他卡片一樣
//   不放欄位的小標題：卡片標題已經是「問題分類」（2026-10-17 suzy 覺得重複太亂）；
//     標籤留著但看不見（sr-only），螢幕閱讀器還是念得出欄位名稱
//   處理期限原本也放在這張卡片，2026-10-17 先拿掉：要不要讓案件自己有期限，還在和 013 討論
import { computed } from 'vue'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ISSUE_CATEGORIES } from '@/mocks/data/community'

const props = defineProps({
  // 已經存好的分類，例如 'leak'（ISSUE_CATEGORIES 的 key）
  current: { type: String, required: true },
})

// 記下來、還沒存的分類，例如 'leak'；和存好的一樣就是空字串
const draft = defineModel('draft', { type: String, default: '' })

// 下拉選單的選項：{ value: 'leak', label: '漏水' }
const CATEGORY_OPTIONS = Object.entries(ISSUE_CATEGORIES).map(([value, info]) => ({ value, label: info.label }))

// 選單上顯示的：記下來的，沒有就是存好的；選回原本的就不用記
const category = computed({
  get: () => draft.value || props.current,
  set: (value) => {
    draft.value = value === props.current ? '' : value
  },
})
</script>

<template>
  <div>
    <Label for="case-category" class="sr-only">問題分類</Label>
    <Select v-model="category">
      <!-- 外框和「關聯設備」的選單對齊：高 44px、文字左邊空 12px、箭頭和設備選單的箭頭在同一條直線
           SelectTrigger 本身寫了 data-[size=default]:h-8，比 h-11 優先，所以高度也要用 data-[size=default]: 才蓋得過
           字級：ui/select 本身寫了 text-sm（14px），會蓋過 type-body，所以用 type-body!（結尾的 ! 是「一定要用這個」）
           變成 16px，和廠商、設備的輸入框一樣（下面的選項也是） -->
      <SelectTrigger id="case-category" class="w-full bg-card pr-3.5 pl-3 type-body! data-[size=default]:h-11">
        <SelectValue />
      </SelectTrigger>
      <!-- 展開的選單照「關聯設備」的選單（ui/combobox 的 ComboboxList、ComboboxItem，對照 Kit 的 Combobox Item）：
           外框 rounded-xl、四周留 8px、卡片陰影；選項高 44px、rounded-lg，滑過或選到時是灰底、字不變色；
           打勾離右邊 12px（*:first:right-3：SelectItem 的第一個子元素就是放打勾的地方）
           寬度：ui/select 的選項區本身至少和框一樣寬，再加上四周的 8px 就會比框寬 16px，
           所以整個選單定成和框一樣寬（w-(--reka-select-trigger-width)），選項區的最小寬度拿掉（*:data-[position=popper]:min-w-0） -->
      <SelectContent
        class="w-(--reka-select-trigger-width) rounded-xl p-2 shadow-card ring-border *:data-[position=popper]:min-w-0"
      >
        <SelectItem
          v-for="option in CATEGORY_OPTIONS"
          :key="option.value"
          :value="option.value"
          class="min-h-11 rounded-lg py-1.5 pr-10 pl-3 type-body! text-foreground focus:bg-muted focus:text-foreground not-data-[variant=destructive]:focus:**:text-foreground *:first:right-3"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
