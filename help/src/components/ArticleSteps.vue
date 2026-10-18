<script setup>
// 文章的操作步驟
//   一般文章：所有步驟由上往下列出
//   walkthrough（逐步教學，用在比較長的流程）：一次看一步，只用「上一步／下一步」切換（2026-10-18 拿掉上方的數字按鈕）；
//     也可以按「一次看全部步驟」改回整頁列出，方便捲動或列印
import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import { ref } from 'vue'
import StepItem from './StepItem.vue'

const props = defineProps({
  steps: { type: Array, required: true },
  walkthrough: { type: Boolean, default: false },
})

const showAll = ref(!props.walkthrough)
const current = ref(0) // 第幾步（從 0 開始）
const container = ref(null)

function goTo(index) {
  current.value = Math.min(Math.max(index, 0), props.steps.length - 1)
  // 手機上步驟比較長：切換後如果步驟的開頭已經捲出畫面，捲回來
  const top = container.value?.getBoundingClientRect().top ?? 0
  if (top < 72) container.value.scrollIntoView({ block: 'start' })
}
</script>

<template>
  <div ref="container" class="scroll-mt-24">
    <!-- 逐步教學的切換開關 -->
    <div v-if="walkthrough" class="mb-5 flex flex-wrap items-center justify-between gap-2">
      <p class="font-medium text-ink-soft">共 {{ steps.length }} 個步驟</p>
      <div class="flex flex-wrap items-center gap-2">
        <!-- 目前的閱讀模式；切換時螢幕閱讀器會念出新的模式（aria-live） -->
        <p class="rounded-full bg-brand-50 px-3 py-1 text-[15px] font-medium text-brand-900" aria-live="polite">
          目前：{{ showAll ? '完整步驟' : '逐步閱讀' }}
        </p>
        <button
          type="button"
          class="min-h-11 rounded-lg px-3 font-bold text-brand-800 underline-offset-4 hover:bg-brand-50 hover:underline"
          @click="showAll = !showAll"
        >
          {{ showAll ? '改成一步一步看' : '一次看全部步驟' }}
        </button>
      </div>
    </div>

    <!-- 全部列出 -->
    <ol v-if="showAll" class="space-y-6">
      <li
        v-for="(step, index) in steps"
        :key="step.title"
        class="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] md:p-6"
      >
        <StepItem :step="step" :number="index + 1" :total="steps.length" />
      </li>
    </ol>

    <!-- 一步一步看 -->
    <div v-else class="rounded-[var(--radius-card)] border border-brand-100 bg-white shadow-[var(--shadow-card)]">
      <div class="p-5 md:p-6">
        <!-- 螢幕閱讀器會念出現在是第幾步 -->
        <p class="sr-only" aria-live="polite">第 {{ current + 1 }} 步，共 {{ steps.length }} 步</p>
        <StepItem :step="steps[current]" :number="current + 1" :total="steps.length" />
      </div>

      <div class="flex items-center justify-between gap-3 border-t border-line px-3 py-3 md:px-5">
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
          v-else
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
