<script setup>
// 住戶端・我的通報：列出我通報過的所有問題
import { onMounted, ref } from 'vue'
import ReportCard from '@/components/report/ReportCard.vue'
import { getCurrentUser, getMyReports } from '@/mocks/api'

const reports = ref([]) // 我的所有通報

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('resident')
  reports.value = await getMyReports(user.id)
})
</script>

<template>
  <div class="space-y-4 px-5 pt-4">
    <!-- 進行中的通報才能編輯；別人通報、我只是按「我也遇到了」的也不能編輯 -->
    <ReportCard
      v-for="report in reports"
      :key="report.id"
      type="full"
      :report="report"
      :to="`/resident/reports/${report.id}`"
      :edit-to="report.isOpen && report.isMine ? `/resident/reports/${report.id}` : ''"
    />
  </div>
</template>
