<script setup>
// 住戶端・通報詳情：看一筆通報的處理進度，也可以補充說明、換照片或撤回
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ReportSummary from '@/components/report/ReportSummary.vue'
import { getCurrentUser, getReportById } from '@/mocks/api'

// useRoute()：取得目前路由的資訊
// 網址是 /resident/reports/:id，所以 route.params.id 就是這筆通報的編號
const route = useRoute()

const report = ref(null) // 這一筆通報；還沒拿到時是 null

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('resident')
  report.value = await getReportById(route.params.id, user.id)
})
</script>

<template>
  <div class="space-y-4 px-5 pt-4">
    <ReportSummary v-if="report" :report="report" />
  </div>
</template>
