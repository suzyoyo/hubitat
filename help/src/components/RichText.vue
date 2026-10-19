<script setup>
// 顯示文章文字：用「」框起來的字（畫面上的按鈕、欄位名稱）會加粗變深藍
// 不用 v-html，文字裡就算有 < > 也只會當成文字顯示
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
})

// 把「電梯有異音，按「受理」」切成 [一般文字, 按鈕名稱, 一般文字…]
const parts = computed(() =>
  props.text.split(/(「[^」]+」)/).filter(Boolean).map((part) => ({
    text: part,
    isLabel: part.startsWith('「') && part.endsWith('」'),
  })),
)
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <span v-if="part.isLabel" class="ui-label">{{ part.text }}</span>
    <template v-else>{{ part.text }}</template>
  </template>
</template>
