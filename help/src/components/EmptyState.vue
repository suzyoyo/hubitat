<script setup>
// 找不到東西時：拿放大鏡的好彼管家＋一句話（＋按鈕放在 slot）
import searching from '@/assets/mascot/searching.png'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col items-center rounded-[var(--radius-card)] bg-white px-6 py-10 text-center shadow-[var(--shadow-card)]">
    <img :src="searching" alt="" class="h-32 w-auto" width="90" height="128" />
    <p class="mt-4 text-xl font-bold text-brand-900">{{ title }}</p>
    <p v-if="description" class="mt-2 max-w-md text-ink-soft">{{ description }}</p>
    <div class="mt-5 flex flex-wrap justify-center gap-2"><slot /></div>
  </div>
</template>
