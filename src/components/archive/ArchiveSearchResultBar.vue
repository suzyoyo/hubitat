<script setup>
// 內文搜尋結果列（對應 Figma 的 Archive/Search Result Bar）：「第 1／2 處符合「廠商」」＋上一處／下一處
import { ChevronDownIcon, ChevronUpIcon } from '@lucide/vue'

defineProps({
  keyword: { type: String, required: true }, // 搜尋的字
  current: { type: Number, required: true }, // 現在在第幾處，從 1 開始
  total: { type: Number, required: true }, // 一共幾處
})

// prev：按了上一處；next：按了下一處
defineEmits(['prev', 'next'])
</script>

<template>
  <div class="flex items-center gap-1 rounded-xl bg-secondary py-1 pr-1 pl-4">
    <!-- aria-live：數字變的時候，螢幕閱讀器會念出來 -->
    <p class="min-w-0 flex-1 truncate type-body-strong text-secondary-foreground" aria-live="polite">
      第 {{ current }}／{{ total }} 處符合「{{ keyword }}」
    </p>
    <button
      type="button"
      aria-label="上一處"
      class="flex size-11 shrink-0 items-center justify-center rounded-full"
      @click="$emit('prev')"
    >
      <ChevronUpIcon class="size-5" />
    </button>
    <button
      type="button"
      aria-label="下一處"
      class="flex size-11 shrink-0 items-center justify-center rounded-full"
      @click="$emit('next')"
    >
      <ChevronDownIcon class="size-5" />
    </button>
  </div>
</template>
