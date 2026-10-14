<script setup>
// 新增通報・第 2 步：確認是否重複（住戶端、管委會端的新增通報共用）
// 列出同一個地點、還沒處理完的通報。是同一個問題就按「我也遇到了」，不用再通報一次
import FeedbackHaobiTip from '@/components/feedback/FeedbackHaobiTip.vue'
import ReportSimilarCard from '@/components/report/ReportSimilarCard.vue'

defineProps({
  // getSimilarReports() 回傳的相似通報
  reports: { type: Array, required: true },
  // 正在送出「我也遇到了」的那一筆通報的編號；沒有在送就是空字串
  supportingId: { type: String, default: '' },
})

// support：按了某一筆的「我也遇到了」，會把那筆通報傳出去
defineEmits(['support'])
</script>

<template>
  <div class="space-y-4">
    <FeedbackHaobiTip title="最近有人通報過，看看是不是同一個問題？" />
    <!-- 有一筆正在送出時，全部的按鈕都先不能按 -->
    <ReportSimilarCard
      v-for="report in reports"
      :key="report.id"
      :report="report"
      :pending="supportingId !== ''"
      @support="$emit('support', $event)"
    />
  </div>
</template>
