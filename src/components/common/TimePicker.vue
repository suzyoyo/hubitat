<script setup>
// 選擇時間：一顆按鈕，點了在下面跳出「時」「分」兩欄，和 DatePicker 是一對
// 不用瀏覽器內建的 type="time"：它跳出來的滾輪或清單是手機自己畫的，樣式改不了，每支手機都不一樣
// Kit 和設計稿都還沒有時間選擇器，樣子照 DatePicker 做
// 用法：
//   <TimePicker id="an-start-time" v-model="form.startTime" />
// 值是 '14:30' 這種字串（和 <input type="time"> 一樣），還沒選是空字串
// 先選「時」、再選「分」，選好分鐘就收起來；只選了時，分鐘先當作 00
import { ClockIcon } from '@lucide/vue'
import { computed, nextTick, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// 頁面傳的 id 等屬性要放在按鈕上，不要放在最外層
defineOptions({ inheritAttrs: false })

defineProps({
  // 還沒選時間時，按鈕上的文字
  placeholder: { type: String, default: '選擇時間' },
})

// 選好的時間，頁面用 v-model 綁定
const value = defineModel({ type: String, default: '' })

const open = ref(false)

// 補成兩位數：9 → '09'
function pad(number) {
  return String(number).padStart(2, '0')
}

// 「時」00～23；「分」每 5 分鐘一格（00、05、10…55）
const HOURS = Array.from({ length: 24 }, (_, index) => pad(index))
const MINUTES = Array.from({ length: 12 }, (_, index) => pad(index * 5))

// 現在選的時、分；還沒選是空字串
const hour = computed(() => value.value.split(':')[0] || '')
const minute = computed(() => value.value.split(':')[1] || '')

// 修改既有公告時，分鐘可能不在選項裡（例如 10:23），就把它也放進去，才看得到選中的是哪一格
const minuteOptions = computed(() =>
  minute.value && !MINUTES.includes(minute.value) ? [...MINUTES, minute.value].toSorted() : MINUTES,
)

function pickHour(nextHour) {
  value.value = `${nextHour}:${minute.value || '00'}`
}

function pickMinute(nextMinute) {
  // 還沒選時就先選分鐘：時先用 09（上午九點）
  value.value = `${hour.value || '09'}:${nextMinute}`
  open.value = false
}

// 打開時，兩欄都捲到選中的那一格（格子太多放不下，不捲的話要自己往下找）
const hourList = ref(null)
const minuteList = ref(null)
watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  for (const list of [hourList.value, minuteList.value]) {
    const selected = list?.querySelector('[aria-pressed="true"]')
    // 只捲這一欄，讓選中的那格在中間（不用 scrollIntoView，它會連整個頁面一起捲）
    if (selected) list.scrollTop = selected.offsetTop - list.clientHeight / 2 + selected.offsetHeight / 2
  }
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <!-- $attrs：頁面傳的 id、aria-invalid 會放在這顆按鈕上，<Label for="..."> 才對得到 -->
      <Button v-bind="$attrs" type="button" variant="outline" class="w-full">
        <ClockIcon />
        {{ value || placeholder }}
      </Button>
    </PopoverTrigger>

    <!-- 和按鈕一樣寬；按鈕只有半寬時至少 200px，兩欄才放得下 -->
    <PopoverContent class="w-(--reka-popover-trigger-width) min-w-[200px] gap-2 rounded-xl p-3 shadow-card ring-border">
      <div class="grid grid-cols-2 gap-2">
        <p class="text-center type-date text-muted-foreground">時</p>
        <p class="text-center type-date text-muted-foreground">分</p>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <!-- 「時」：24 格、「分」：12 格，超過的往下捲 -->
        <!-- relative：讓 offsetTop 從這一欄的頂端算起 -->
        <div ref="hourList" class="relative max-h-[220px] space-y-1 overflow-y-auto">
          <button
            v-for="option in HOURS"
            :key="option"
            type="button"
            class="flex h-11 w-full items-center justify-center rounded-lg type-body"
            :class="option === hour ? 'bg-primary font-bold text-primary-foreground' : 'text-foreground'"
            :aria-label="`${Number(option)} 點`"
            :aria-pressed="option === hour"
            @click="pickHour(option)"
          >
            {{ option }}
          </button>
        </div>
        <div ref="minuteList" class="relative max-h-[220px] space-y-1 overflow-y-auto">
          <button
            v-for="option in minuteOptions"
            :key="option"
            type="button"
            class="flex h-11 w-full items-center justify-center rounded-lg type-body"
            :class="option === minute ? 'bg-primary font-bold text-primary-foreground' : 'text-foreground'"
            :aria-label="`${Number(option)} 分`"
            :aria-pressed="option === minute"
            @click="pickMinute(option)"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
