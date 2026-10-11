<script setup>
// 住戶端・通報詳情：看一筆通報的處理進度，也可以補充說明、換照片或撤回
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ReportProgressCard from '@/components/report/ReportProgressCard.vue'
import ReportSummary from '@/components/report/ReportSummary.vue'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { getCurrentUser, getReportById } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// useRoute()：取得目前路由的資訊
// 網址是 /resident/reports/:id，所以 route.params.id 就是這筆通報的編號
const route = useRoute()

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 這一筆通報。找不到時（編號不存在，或是別人的保密通報）假 API 會回傳 undefined
const report = ref(null)

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('resident')
  report.value = await getReportById(route.params.id, user.id)
  loading.value = false
})
</script>

<template>
  <div class="space-y-4 px-5 pt-4">
    <!-- 載入中：兩個和卡片差不多高的灰色方塊 -->
    <template v-if="loading">
      <Skeleton class="h-[88px] rounded-xl" />
      <Skeleton class="h-[280px] rounded-xl" />
    </template>

    <!-- 找不到這筆通報 -->
    <Empty v-else-if="!report" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這筆通報</EmptyTitle>
      <EmptyDescription class="type-body">可能已經撤回，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink to="/resident/reports">回到我的通報</RouterLink>
      </Button>
    </Empty>

    <!-- 有資料 -->
    <template v-else>
      <ReportSummary :report="report" />
      <ReportProgressCard :report="report" />
    </template>
  </div>
</template>
