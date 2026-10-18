<script setup>
// 頁內目錄：點了跳到那一段；捲動時標出現在讀到哪一段（左邊直線＋粗體）
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  toc: { type: Array, required: true },
})

const activeId = ref(props.toc[0]?.id)
let observer = null

function observe() {
  observer?.disconnect()
  // 標題進到畫面上方三分之一時，算是讀到那一段
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
      if (visible.length) activeId.value = visible[0].target.id
    },
    { rootMargin: '-80px 0px -66% 0px' },
  )
  props.toc.forEach((item) => {
    const el = document.getElementById(item.id)
    if (el) observer.observe(el)
  })
}

onMounted(observe)
watch(() => props.toc, () => requestAnimationFrame(observe))
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <!-- 畫面上不寫「本頁目錄」，名稱只給螢幕閱讀器念 -->
  <nav aria-label="本頁目錄">
    <ul class="space-y-0.5 border-l-2 border-line">
      <li v-for="item in toc" :key="item.id">
        <a
          :href="`#${item.id}`"
          class="-ml-0.5 flex min-h-11 items-center border-l-[3px] py-1.5 pl-3 leading-snug"
          :class="
            activeId === item.id
              ? 'border-brand-800 font-bold text-brand-900'
              : 'border-transparent text-ink-soft hover:text-brand-900'
          "
          :aria-current="activeId === item.id ? 'location' : undefined"
          @click="activeId = item.id"
        >
          {{ item.title }}
        </a>
      </li>
    </ul>
  </nav>
</template>
