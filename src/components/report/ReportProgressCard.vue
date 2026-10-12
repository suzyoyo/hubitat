<script setup>
// 「處理進度」卡片（對應 Figma 的 Report/Progress Card）
// 上面是三步驟進度條，下面是處理紀錄（由舊到新，最新的一筆是深色）
import { Separator } from '@/components/ui/separator'
import ReportRecord from './ReportRecord.vue'
import ReportStepper from './ReportStepper.vue'

defineProps({
  // getReportById() 回傳的通報，會用到 steps（三個階段的時間）和 timeline（處理紀錄）
  report: { type: Object, required: true },
})
</script>

<template>
  <article class="space-y-4 rounded-xl bg-card p-4 shadow-card">
    <h2 class="type-greeting">處理進度</h2>
    <ReportStepper :steps="report.steps" />
    <!-- 還沒有任何處理紀錄時，分隔線和列表都不顯示 -->
    <template v-if="report.timeline.length">
      <Separator />
      <div class="space-y-2">
        <!-- index 是第幾筆（從 0 開始）；最後一筆就是最新的 -->
        <ReportRecord
          v-for="(record, index) in report.timeline"
          :key="record.at"
          :record="record"
          :latest="index === report.timeline.length - 1"
        />
      </div>
    </template>
  </article>
</template>
