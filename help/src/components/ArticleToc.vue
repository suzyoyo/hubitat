<script setup>
// 頁內目錄：點了跳到那一段；捲動時標出現在讀到哪一段（左邊直線＋粗體）
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  toc: { type: Array, required: true },
})

const activeId = ref(props.toc[0]?.id)

// 每次捲動都重新算一次現在讀到哪一段：
//   標題已經捲過畫面上方三分之一的，最後一個就是現在這一段
//   捲到頁面最底時，最後一段的標題可能爬不到上方，就直接標最後一段（2026-10-19 修）
function updateActive() {
  if (!props.toc.length) return
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
  if (atBottom) {
    activeId.value = props.toc[props.toc.length - 1].id
    return
  }
  const line = window.innerHeight / 3
  let current = props.toc[0].id
  props.toc.forEach((item) => {
    const el = document.getElementById(item.id)
    if (el && el.getBoundingClientRect().top <= line) current = item.id
  })
  activeId.value = current
}

onMounted(() => {
  updateActive()
  window.addEventListener('scroll', updateActive, { passive: true })
})
// 換文章時（目錄變了）重新算
watch(() => props.toc, () => nextTick(updateActive))
onBeforeUnmount(() => window.removeEventListener('scroll', updateActive))
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
