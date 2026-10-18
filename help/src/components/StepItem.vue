<script setup>
// 一個操作步驟：「步驟 N」、標題、說明、補充小提示、截圖
//   平板以上：文字在左、截圖在右；手機：上下排列
import { computed } from 'vue'
import { screenshotUrl } from '@/lib/screenshots'
import RichText from './RichText.vue'
import ScreenshotImage from './ScreenshotImage.vue'

const props = defineProps({
  step: { type: Object, required: true },
  number: { type: Number, required: true },
  total: { type: Number, required: true },
  headingId: { type: String, default: undefined },
})

const hasShot = computed(() => props.step.screenshot && screenshotUrl(props.step.screenshot.file))
</script>

<template>
  <div class="grid gap-5" :class="hasShot && 'md:grid-cols-[minmax(0,1fr)_240px] md:items-start lg:grid-cols-[minmax(0,1fr)_260px]'">
    <div class="min-w-0">
      <p class="text-sm font-bold text-brand-800">步驟 {{ number }}<span class="sr-only">，共 {{ total }} 步</span></p>
      <!-- 步驟編號只用上面的「步驟 N」文字，不另外放圓圈（2026-10-18） -->
      <h3 :id="headingId" class="mt-1 text-xl font-bold leading-snug text-brand-900">{{ step.title }}</h3>
      <p class="mt-3"><RichText :text="step.body" /></p>
      <ul v-if="step.tips?.length" class="mt-3 space-y-2">
        <li v-for="tip in step.tips" :key="tip" class="flex gap-2 text-ink-soft">
          <span class="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
          <span><RichText :text="tip" /></span>
        </li>
      </ul>
    </div>
    <ScreenshotImage v-if="hasShot" :shot="step.screenshot" />
  </div>
</template>
