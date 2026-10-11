<script setup>
// 通報的三步驟進度條（對應 Figma 的 Report/Stepper）：已收到 → 處理中 → 已完成
// 上面一排是圓點和連接線，下面一排是每一步的名稱和日期
// 圓點有三種樣子（對應 Figma 的 Report/Step）：
//   done    走完了：深色底＋勾
//   current 現在在這一步：藍色外框＋中間一個藍點
//   todo    還沒到：灰色外框
import { computed } from 'vue'
import { CheckIcon } from '@lucide/vue'
import { formatDate } from '@/lib/date'

const props = defineProps({
  // 通報的 steps 欄位：三個階段各自的時間，還沒到的階段是 null
  // 例如 { receivedAt: '2026-09-20T08:10', processingAt: '2026-09-25T14:30', doneAt: null }
  steps: { type: Object, required: true },
})

// 把三個階段整理成清單，並算出每一步的圓點要用哪一種樣子
const items = computed(() => {
  const { receivedAt, processingAt, doneAt } = props.steps
  const list = [
    { label: '已收到', at: receivedAt },
    { label: '處理中', at: processingAt },
    { label: '已完成', at: doneAt },
  ]
  // 現在走到第幾步（從 0 開始數）：有完成時間是 2，有處理時間是 1，都沒有是 0
  const currentIndex = doneAt ? 2 : processingAt ? 1 : 0

  return list.map((item, index) => {
    let state = 'todo'
    // 整件事已經完成時，三步都打勾
    if (doneAt || index < currentIndex) state = 'done'
    else if (index === currentIndex) state = 'current'
    return { ...item, state }
  })
})

// 三個名稱的對齊方式：第一個靠左、中間置中、最後一個靠右，才會對到上面的圓點
const alignClass = ['items-start', 'items-center', 'items-end']
</script>

<template>
  <div class="space-y-4">
    <!-- 圓點和連接線 -->
    <div class="flex items-center">
      <!-- template v-for：一次重複「連接線＋圓點」兩個東西，本身不會產生多餘的標籤 -->
      <template v-for="(item, index) in items" :key="item.label">
        <!-- 連接線：放在每個圓點的前面（第一個圓點前面不用）。走到這一步了就是藍色，還沒到是灰色 -->
        <div
          v-if="index > 0"
          class="h-0.5 flex-1"
          :class="item.state === 'todo' ? 'bg-border' : 'bg-primary'"
        />
        <!-- 圓點 -->
        <div
          v-if="item.state === 'done'"
          class="flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-white"
        >
          <CheckIcon class="size-3.5" />
        </div>
        <div
          v-else-if="item.state === 'current'"
          class="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card"
        >
          <div class="size-2.5 rounded-full bg-primary" />
        </div>
        <div v-else class="size-6 shrink-0 rounded-full border-2 border-border bg-card" />
      </template>
    </div>

    <!-- 名稱和日期 -->
    <div class="flex">
      <div
        v-for="(item, index) in items"
        :key="item.label"
        class="flex flex-1 flex-col text-sm leading-5"
        :class="[alignClass[index], item.state === 'todo' ? 'text-muted-foreground' : '']"
      >
        <p class="font-semibold tracking-[0.4px]">{{ item.label }}</p>
        <!-- 還沒到的步驟沒有日期，下面留空 -->
        <p v-if="item.at" class="text-muted-foreground">{{ formatDate(item.at) }}</p>
      </div>
    </div>
  </div>
</template>
