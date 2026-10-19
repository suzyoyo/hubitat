<script setup>
// 搜尋結果裡，把符合搜尋字的地方用黃色底標出來（<mark>，螢幕閱讀器也知道是標示）
// 不用 v-html：把文字切成一段一段，符合的那段放進 <mark>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  words: { type: Array, default: () => [] }, // 要標示的字，例如 ['通報']
})

// 正規表示式裡有特殊意義的符號要先跳脫，例如搜尋「(」不會出錯
const escape = (word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const parts = computed(() => {
  const words = props.words.filter(Boolean)
  if (words.length === 0) return [{ text: props.text, match: false }]
  const pattern = new RegExp(`(${words.map(escape).join('|')})`, 'gi')
  return props.text
    .split(pattern)
    .filter(Boolean)
    .map((text) => ({ text, match: words.some((w) => w.toLowerCase() === text.toLowerCase()) }))
})
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <mark v-if="part.match" class="rounded-sm bg-[#ffe9a8] px-0.5 text-inherit">{{ part.text }}</mark>
    <template v-else>{{ part.text }}</template>
  </template>
</template>
