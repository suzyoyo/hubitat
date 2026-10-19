<script setup>
// 一個操作步驟：「步驟 N」、標題、說明、補充小提示、截圖
//   平板以上：文字在左、截圖在右；手機：上下排列
//   step.done：最後的「完成」頁，不寫「步驟 N」，只有大標題「完成了！」；沒有截圖時，截圖的位置放開心的好彼管家
import { computed } from 'vue'
import { MASCOTS } from '@/lib/mascots'
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
      <!-- 「步驟 N」用灰色（2026-10-19 從深藍改來） -->
      <p v-if="!step.done" class="text-sm font-bold text-ink-soft">步驟 {{ number }}<span class="sr-only">，共 {{ total }} 步</span></p>
      <!-- 步驟編號只用上面的「步驟 N」文字，不另外放圓圈（2026-10-18） -->
      <h3 :id="headingId" :class="!step.done && 'mt-1'" class="text-xl font-bold leading-snug text-brand-900">{{ step.title }}</h3>
      <!-- 標題和說明之間 16px（2026-10-19 從 12px 拉高一點） -->
      <p class="mt-4"><RichText :text="step.body" /></p>
      <ul v-if="step.tips?.length" class="mt-3 space-y-2">
        <li v-for="tip in step.tips" :key="tip" class="flex gap-2 text-ink-soft">
          <span class="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
          <span><RichText :text="tip" /></span>
        </li>
      </ul>
    </div>
    <ScreenshotImage v-if="hasShot" :shot="step.screenshot" />
    <img v-else-if="step.done" :src="MASCOTS.happy" alt="" class="h-28 w-auto justify-self-center md:h-32" />
  </div>
</template>
