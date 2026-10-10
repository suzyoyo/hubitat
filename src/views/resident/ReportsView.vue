<script setup>
// 住戶端・我的通報：列出我通報過的所有問題，分成「進行中」「已完成」兩個分頁
import { computed, onMounted, ref } from 'vue'
import ReportCard from '@/components/report/ReportCard.vue'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCurrentUser, getMyReports } from '@/mocks/api'

const reports = ref([]) // 我的所有通報（進行中＋已完成）
const currentTab = ref('active') // 目前選到的分頁：'active' 或 'done'

// onMounted：畫面一出現就去拿資料
// 一次把全部通報拿回來，再自己分成兩堆，切換分頁時就不用重新等資料
onMounted(async () => {
  const user = await getCurrentUser('resident')
  reports.value = await getMyReports(user.id)
})

// 兩個分頁的設定與各自的通報
// isOpen 是假 API 給的：true 代表還沒結案
const tabs = computed(() => [
  { value: 'active', label: '進行中', reports: reports.value.filter((item) => item.isOpen) },
  { value: 'done', label: '已完成', reports: reports.value.filter((item) => !item.isOpen) },
])
</script>

<template>
  <!-- v-model：分頁切換時，currentTab 會跟著變 -->
  <Tabs v-model="currentTab" class="gap-4 px-5 pt-4">
    <!-- 整列高 44px（設計稿 33px），長輩比較好按 -->
    <TabsList class="h-11! w-full rounded-xl bg-background p-1">
      <!-- TabsTrigger 與 TabsContent 用相同的 value 配對 -->
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="text-base text-muted-foreground data-active:bg-secondary data-active:text-secondary-foreground"
      >
        {{ tab.label }}
        <!-- 「已完成」旁邊顯示件數；0 件就不顯示 -->
        <Badge v-if="tab.value === 'done' && tab.reports.length">{{ tab.reports.length }}</Badge>
      </TabsTrigger>
    </TabsList>

    <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value" class="space-y-4">
      <!-- 進行中的通報才能編輯；別人通報、我只是按「我也遇到了」的也不能編輯 -->
      <ReportCard
        v-for="report in tab.reports"
        :key="report.id"
        type="full"
        :report="report"
        :to="`/resident/reports/${report.id}`"
        :edit-to="report.isOpen && report.isMine ? `/resident/reports/${report.id}` : ''"
      />
    </TabsContent>
  </Tabs>
</template>
