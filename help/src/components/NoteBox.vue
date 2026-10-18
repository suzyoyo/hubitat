<script setup>
// 提示框
//   tone：'tip' 小提示（藍）、'warning' 注意（橘）、'done' 完成（藍）
//   mascot：要不要放好彼管家（只用在複雜操作的注意事項、完成提示，不要每個框都放）
import { CircleCheckIcon, LightbulbIcon, TriangleAlertIcon } from '@lucide/vue'
import happy from '@app/assets/mascot/happy.png'
import thinking from '@app/assets/mascot/thinking.png'

defineProps({
  tone: { type: String, default: 'tip' },
  title: { type: String, default: '' },
  mascot: { type: Boolean, default: false },
})

const styles = {
  tip: { box: 'bg-brand-50 border-brand-100', icon: LightbulbIcon, iconColor: 'text-brand-800', img: thinking },
  warning: { box: 'bg-orange-50 border-orange-200', icon: TriangleAlertIcon, iconColor: 'text-orange-800', img: thinking },
  done: { box: 'bg-brand-50 border-brand-100', icon: CircleCheckIcon, iconColor: 'text-brand-800', img: happy },
}
</script>

<template>
  <!-- items-center：文字只有一兩行時，和好彼管家上下置中，不會黏在上面 -->
  <div class="flex items-center gap-4 rounded-[var(--radius-card)] border p-4 md:p-5" :class="styles[tone].box">
    <img v-if="mascot" :src="styles[tone].img" alt="" class="hidden h-24 w-auto shrink-0 sm:block" width="68" height="96" />
    <div class="min-w-0 flex-1">
      <p v-if="title" class="flex items-center gap-2 font-bold text-brand-950">
        <component :is="styles[tone].icon" class="size-5 shrink-0" :class="styles[tone].iconColor" aria-hidden="true" />
        {{ title }}
      </p>
      <div :class="title && 'mt-2'"><slot /></div>
    </div>
  </div>
</template>
