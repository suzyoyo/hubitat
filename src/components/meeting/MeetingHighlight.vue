<script setup>
// 把一段文字裡搜尋到的字標出來（會議紀錄全文搜尋用）
// parts 是切好的一段一段，例如 [{ text: '原合作' }, { text: '廠商', match: 1 }, { text: '本年度…' }]
//   match 是這一處是全文的第幾處（從 1 開始），沒有 match 就是一般文字
defineProps({
  parts: { type: Array, required: true },
  // 現在跳到第幾處，那一處用比較深的顏色標出來
  current: { type: Number, default: 0 },
})
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <!-- mark：HTML 的「標記文字」。id 讓「上一處／下一處」可以捲到這裡；scroll-mt-40 留空間給頂部列和結果列 -->
    <mark
      v-if="part.match"
      :id="`match-${part.match}`"
      class="scroll-mt-40 rounded-sm text-inherit"
      :class="part.match === current ? 'bg-remind text-white' : 'bg-remind-subtle'"
    >{{ part.text }}</mark>
    <template v-else>{{ part.text }}</template>
  </template>
</template>
