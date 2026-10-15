<script setup>
// 案件詳情「關聯設備」卡片裡的選擇設備：一個下拉選單（2026-10-15 改）
//   點了展開設備清冊，最上面有搜尋框可以打字篩選（名稱或位置）；選好後再點，一樣展開完整的清冊，不用先刪字
//   選一台就記下來（v-model:draft）；真的存是按頁面底部的「更新現況」
// 選了設備，結案時才會記進這台設備的維修紀錄（docs/case-flow.md）
import { CheckIcon, ChevronDownIcon, SearchIcon } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const props = defineProps({
  // 可以選的設備：getEquipmentList() 回傳的清單（已報廢的頁面會先拿掉）
  devices: { type: Array, required: true },
  // 已經存好的設備：{ name, place }；還沒關聯就是空字串
  current: { type: Object, default: () => ({ name: '', place: '' }) },
})

// 記下來、還沒存的選擇：{ equipmentId, name, place }，沒有就是 null
const draft = defineModel('draft', { type: Object, default: null })

const open = ref(false) // 下拉選單有沒有展開
const search = ref('') // 選單最上面搜尋框的字

// 選單框上顯示的：記下來的，沒有就是存好的
const shownName = computed(() => draft.value?.name ?? props.current.name)

// 名稱或位置有包含搜尋字的設備；沒打字就全部列出來
const matches = computed(() => {
  const word = search.value.trim()
  return props.devices.filter((device) => device.name.includes(word) || device.place.includes(word))
})

// 每次展開都從完整的清冊開始
watch(open, (isOpen) => {
  if (isOpen) search.value = ''
})

// 選一台：記下來、收起選單；選回原本那台就不用記
function pick(device) {
  draft.value = device.name === props.current.name ? null : { equipmentId: device.id, name: device.name, place: device.place }
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <!-- 看起來和輸入框一樣的選單框：左邊是選好的設備（沒選是灰色「選擇設備」），右邊往下的箭頭 -->
      <button
        type="button"
        aria-label="關聯設備"
        class="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-left outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span class="truncate type-body" :class="shownName ? 'text-foreground' : 'text-muted-foreground'">
          {{ shownName || '選擇設備' }}
        </span>
        <ChevronDownIcon class="size-4 shrink-0 text-muted-foreground" />
      </button>
    </PopoverTrigger>

    <!-- 和選單框一樣寬，對齊在正下方（寫法和 DatePicker 一樣） -->
    <PopoverContent class="w-(--reka-popover-trigger-width) gap-2 rounded-xl p-2 shadow-card ring-border">
      <div class="relative">
        <SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="search" aria-label="搜尋設備" placeholder="搜尋設備名稱或位置" autocomplete="off" class="pl-9" />
      </div>
      <!-- 清單：一列一台，名稱下面一行灰字是位置；每列至少 44px 高；太多時可以在框裡上下滑 -->
      <ul v-if="matches.length" role="listbox" aria-label="設備" class="max-h-64 overflow-y-auto">
        <li v-for="device in matches" :key="device.id" role="option" :aria-selected="device.name === shownName">
          <button
            type="button"
            class="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left hover:bg-muted"
            @click="pick(device)"
          >
            <span class="min-w-0 flex-1">
              <span class="block type-body text-foreground">{{ device.name }}</span>
              <span class="block type-date text-muted-foreground">{{ device.place }}</span>
            </span>
            <!-- 目前選的那台打勾（照 Kit 的 Combobox Item：文字＋右邊打勾） -->
            <CheckIcon v-if="device.name === shownName" class="size-4 shrink-0 text-foreground" />
          </button>
        </li>
      </ul>
      <p v-else class="px-3 py-2 type-date text-muted-foreground">清冊裡沒有符合的設備</p>
    </PopoverContent>
  </Popover>
</template>
