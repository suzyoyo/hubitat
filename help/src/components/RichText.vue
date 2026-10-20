<script setup>
// 顯示文章文字：用「」框起來的字（畫面上的按鈕、欄位名稱）會加粗變深藍
//   https:// 開頭的網址會自動變成連結，在新分頁打開（2026-10-20）；網址遇到空白或中文標點（，。、）就結束
// 不用 v-html，文字裡就算有 < > 也只會當成文字顯示
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
})

// 把「電梯有異音，按「受理」」切成 [一般文字, 按鈕名稱, 一般文字…]；網址也切成單獨一段
const parts = computed(() =>
  props.text.split(/(「[^」]+」|https?:\/\/[^\s，。、）]+)/).filter(Boolean).map((part) => ({
    text: part,
    isLabel: part.startsWith('「') && part.endsWith('」'),
    isLink: /^https?:\/\//.test(part),
  })),
)
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <span v-if="part.isLabel" class="ui-label">{{ part.text }}</span>
    <!-- break-all：網址很長、中間沒有空白，手機上要能在任何地方換行，才不會撐出水平捲軸 -->
    <a v-else-if="part.isLink" :href="part.text" target="_blank" rel="noopener" class="text-link break-all">
      {{ part.text }}<span class="sr-only">（在新分頁開啟）</span>
    </a>
    <template v-else>{{ part.text }}</template>
  </template>
</template>
