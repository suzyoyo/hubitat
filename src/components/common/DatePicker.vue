<script setup>
// 選擇日期：一顆按鈕，點了在下面跳出月曆，點一天就選好、月曆收起來
// 樣子照設計稿「新增交辦」的完成期限（1134:14034）：日曆圖示＋文字的按鈕、「‹ 2026 年 10 月 ›」、星期列、日期格
// Kit 還沒有正式的 Date Picker 元件，這是照設計稿畫面做的
// 用法：
//   <DatePicker id="an-start-date" v-model="form.startDate" />
//   <DatePicker v-model="deadline" placeholder="選擇完成期限（必填）" :min="MOCK_TODAY" />
// 值是 '2026-10-12' 這種字串（和 <input type="date"> 一樣），還沒選是空字串
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatFullDate, weekdayIndex } from '@/lib/date'
import { MOCK_TODAY } from '@/mocks/api'

// 頁面傳的 id 等屬性要放在按鈕上，不要放在最外層
defineOptions({ inheritAttrs: false })

const props = defineProps({
  // 還沒選日期時，按鈕上的文字
  placeholder: { type: String, default: '選擇日期' },
  // 最早、最晚可以選哪一天（'2026-10-01'），不傳就不限制
  min: { type: String, default: '' },
  max: { type: String, default: '' },
})

// 選好的日期，頁面用 v-model 綁定
const value = defineModel({ type: String, default: '' })

// 月曆是開還是關
const open = ref(false)

// 月曆現在顯示哪一個月：{ year: 2026, month: 10 }
const view = ref({ year: 2026, month: 10 })

// 打開月曆時，先跳到「選好的那天」的月份；還沒選就跳到最早可選的那天，或今天
watch(open, (isOpen) => {
  if (!isOpen) return
  const start = value.value || props.min || MOCK_TODAY
  const [year, month] = start.split('-').map(Number)
  view.value = { year, month }
})

// 換到上個月、下個月（跨年會自動進位）
function changeMonth(step) {
  const index = view.value.year * 12 + (view.value.month - 1) + step
  view.value = { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

// 補成兩位數：3 → '03'
function pad(number) {
  return String(number).padStart(2, '0')
}

// 這個月的格子：前面空幾格（1 號是星期幾），接著 1 號到月底
// 每一格是 { date: '2026-10-01', day: 1, disabled, isToday }；空格是 null
const cells = computed(() => {
  const { year, month } = view.value
  const prefix = `${year}-${pad(month)}`
  // Date.UTC 的「下個月第 0 天」就是這個月的最後一天
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const blanks = Array(weekdayIndex(`${prefix}-01`)).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = `${prefix}-${pad(index + 1)}`
    return {
      date,
      day: index + 1,
      // 日期字串可以直接比大小：'2026-09-30' < '2026-10-01'
      disabled: Boolean((props.min && date < props.min) || (props.max && date > props.max)),
      isToday: date === MOCK_TODAY,
    }
  })
  return [...blanks, ...days]
})

// 選一天：記下來、收起月曆
function pick(cell) {
  value.value = cell.date
  open.value = false
}

// 按鈕上的文字：'2026-10-12' → '2026/10/12（一）'
const buttonText = computed(() => {
  if (!value.value) return props.placeholder
  return `${formatFullDate(value.value)}（${'日一二三四五六'[weekdayIndex(value.value)]}）`
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <!-- $attrs：頁面傳的 id、aria-invalid 會放在這顆按鈕上，<Label for="..."> 才對得到 -->
      <Button v-bind="$attrs" type="button" variant="outline" class="w-full">
        <CalendarIcon />
        {{ buttonText }}
      </Button>
    </PopoverTrigger>

    <!-- 月曆和按鈕一樣寬、對齊按鈕的正下方（--reka-popover-trigger-width 是按鈕的寬度） -->
    <PopoverContent class="w-(--reka-popover-trigger-width) gap-2 rounded-xl p-3 shadow-card ring-border">
      <!-- 月份列：上個月、年月、下個月 -->
      <div class="flex items-center justify-between">
        <!-- before 把可以點的範圍補到 44px -->
        <button
          type="button"
          class="relative flex size-7 items-center justify-center rounded-full border border-border before:absolute before:-inset-2"
          aria-label="上個月"
          @click="changeMonth(-1)"
        >
          <ChevronLeftIcon class="size-4" />
        </button>
        <p class="type-body-strong text-foreground">{{ view.year }} 年 {{ view.month }} 月</p>
        <button
          type="button"
          class="relative flex size-7 items-center justify-center rounded-full border border-border before:absolute before:-inset-2"
          aria-label="下個月"
          @click="changeMonth(1)"
        >
          <ChevronRightIcon class="size-4" />
        </button>
      </div>

      <!-- 星期列 -->
      <div class="grid grid-cols-7">
        <p v-for="weekday in '日一二三四五六'" :key="weekday" class="text-center type-date text-muted-foreground">
          {{ weekday }}
        </p>
      </div>

      <!-- 日期格：一排七天 -->
      <div class="grid grid-cols-7">
        <template v-for="(cell, index) in cells" :key="cell ? cell.date : `blank-${index}`">
          <span v-if="!cell" />
          <!-- 選中的是品牌藍底；今天有一圈外框；不能選的變淡 -->
          <button
            v-else
            type="button"
            class="mx-auto flex size-11 items-center justify-center rounded-full type-body disabled:text-muted-foreground disabled:opacity-40"
            :class="[
              cell.date === value ? 'bg-primary font-bold text-primary-foreground' : 'text-foreground',
              cell.isToday && cell.date !== value ? 'ring-1 ring-border ring-inset' : '',
            ]"
            :disabled="cell.disabled"
            :aria-label="formatFullDate(cell.date)"
            :aria-pressed="cell.date === value"
            @click="pick(cell)"
          >
            {{ cell.day }}
          </button>
        </template>
      </div>
    </PopoverContent>
  </Popover>
</template>
