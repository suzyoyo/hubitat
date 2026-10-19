<script setup>
// 文章的操作步驟：所有文章都一次看一步，用「上一步／下一步」切換
//   （2026-10-18 拿掉上方的數字按鈕；2026-10-19 拿掉「一次看全部步驟」，原本整頁列出的文章也改成一步一步看）
//   最後一步：文章有「完成後」段落時，放「看完成後的畫面」按鈕跳過去
import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import { ref, watch } from 'vue'
import StepItem from './StepItem.vue'

const props = defineProps({
  steps: { type: Array, required: true },
  hasResult: { type: Boolean, default: false }, // 文章有沒有「完成後」段落
})

const current = ref(0) // 第幾步（從 0 開始）
const container = ref(null)

// 換到另一篇文章時，回到第 1 步（不然停在第 4 步、新文章只有 3 步會出錯）
watch(() => props.steps, () => {
  current.value = 0
})

function goTo(index) {
  current.value = Math.min(Math.max(index, 0), props.steps.length - 1)
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
        <p class="sr-only" aria-live="polite">第 {{ current + 1 }} 步，共 {{ steps.length }} 步</p>
        <StepItem :step="steps[current]" :number="current + 1" :total="steps.length" />
      </div>

      <!-- 只有一步的文章不用切換按鈕 -->
      <div v-if="steps.length > 1" class="flex items-center justify-between gap-3 px-3 py-3 md:px-5">
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
          v-if="current < steps.length - 1"
          type="button"
          class="flex min-h-11 items-center gap-1 rounded-lg bg-brand-800 px-5 font-bold text-white hover:bg-brand-900"
          @click="goTo(current + 1)"
        >
          下一步
          <ChevronRightIcon class="size-5" aria-hidden="true" />
        </button>
        <a
          v-else-if="hasResult"
          href="#result"
          class="flex min-h-11 items-center gap-1 rounded-lg bg-brand-800 px-5 font-bold text-white hover:bg-brand-900"
        >
          看完成後的畫面
          <ChevronRightIcon class="size-5" aria-hidden="true" />
        </a>
      </div>
    </div>
  </div>
</template>
