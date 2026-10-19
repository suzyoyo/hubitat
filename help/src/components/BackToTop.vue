<script setup>
// 返回頂部：往下捲超過一個畫面高才出現
import { ArrowUpIcon } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const show = ref(false)

function onScroll() {
  show.value = window.scrollY > window.innerHeight
}

function toTop() {
  window.scrollTo({ top: 0 })
  // 焦點也回到最上面，鍵盤使用者不會迷路
  document.getElementById('main')?.focus({ preventScroll: true })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <button
    v-show="show"
    type="button"
    class="fixed bottom-5 right-4 z-30 flex h-12 items-center gap-1.5 rounded-full bg-brand-800 pl-4 pr-5 font-bold text-white shadow-lg hover:bg-brand-900 md:bottom-8 md:right-8"
    @click="toTop"
  >
    <ArrowUpIcon class="size-5" aria-hidden="true" />
    回頂端
  </button>
</template>
