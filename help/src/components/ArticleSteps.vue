<script setup>
// 文章的操作步驟：所有文章都一次看一步，用「上一步／下一步」切換
//   （2026-10-18 拿掉上方的數字按鈕；2026-10-19 拿掉「一次看全部步驟」，原本整頁列出的文章也改成一步一步看）
//   最後一頁的右下角是「回到第 1 步」
//   文章有 result（完成後）時，最後一步之後多一頁「完成」，按「下一步」就看得到（2026-10-19 起；
//   原本「完成後」是步驟下面的另一個段落，最後一步放「看完成後的畫面」按鈕跳過去）
import { ChevronLeftIcon, ChevronRightIcon, RotateCcwIcon } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import StepItem from './StepItem.vue'

const props = defineProps({
  steps: { type: Array, required: true },
  result: { type: String, default: '' }, // 完成後會看到什麼（文章的 result）
  resultScreenshot: { type: Object, default: null }, // 完成後的截圖（文章的 resultScreenshot，選填）
})

const current = ref(0) // 第幾頁（從 0 開始）

// 要一頁一頁看的內容：操作步驟，有 result 的話最後再加一頁「完成」
const pages = computed(() => {
  if (!props.result) return props.steps
  return [...props.steps, { done: true, title: '完成了！', body: props.result, screenshot: props.resultScreenshot }]
})
const container = ref(null)

// 換到另一篇文章時，回到第 1 步（不然停在第 4 步、新文章只有 3 步會出錯）
watch(() => props.steps, () => {
  current.value = 0
})

function goTo(index) {
  current.value = Math.min(Math.max(index, 0), pages.value.length - 1)
  // 手機上步驟比較長：切換後如果步驟的開頭已經捲出畫面，捲回來
  const top = container.value?.getBoundingClientRect().top ?? 0
  if (top < 72) container.value.scrollIntoView({ block: 'start' })
}
</script>

<template>
  <div ref="container" class="scroll-mt-24">
    <div class="rounded-[var(--radius-card)] border border-brand-100 bg-white shadow-[var(--shadow-card)]">
      <div class="p-5 md:p-6">
        <!-- 螢幕閱讀器會念出現在是第幾步 -->
        <p class="sr-only" aria-live="polite">{{ pages[current].done ? '完成' : `第 ${current + 1} 步，共 ${steps.length} 步` }}</p>
        <StepItem :step="pages[current]" :number="current + 1" :total="steps.length" />
      </div>

      <!-- 只有一頁的文章不用切換按鈕 -->
      <div v-if="pages.length > 1" class="flex items-center justify-between gap-3 px-3 py-3 md:px-5">
        <button
          type="button"
          class="flex min-h-11 items-center gap-1 rounded-lg px-3 font-bold text-brand-800 hover:bg-brand-50 disabled:invisible"
          :disabled="current === 0"
          @click="goTo(current - 1)"
        >
          <ChevronLeftIcon class="size-5" aria-hidden="true" />
          上一步
        </button>
        <button
          v-if="current < pages.length - 1"
          type="button"
          class="flex min-h-11 items-center gap-1 rounded-lg bg-brand-800 px-5 font-bold text-white hover:bg-brand-900"
          @click="goTo(current + 1)"
        >
          下一步
          <ChevronRightIcon class="size-5" aria-hidden="true" />
        </button>
        <!-- 最後一頁：放「回到第 1 步」，想從頭再看一次不用一直按「上一步」（2026-10-19 加） -->
        <button
          v-else
          type="button"
          class="flex min-h-11 items-center gap-1 rounded-lg bg-brand-50 px-5 font-bold text-brand-900 hover:bg-brand-100"
          @click="goTo(0)"
        >
          <RotateCcwIcon class="size-5" aria-hidden="true" />
          回到第 1 步
        </button>
      </div>
    </div>
  </div>
</template>
