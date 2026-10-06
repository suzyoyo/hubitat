<script setup>
// 佔位頁：畫面還沒做之前，先顯示頁面名稱，確認換頁正常
import { ConstructionIcon } from '@lucide/vue'
import { useRoute } from 'vue-router'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

// useRoute()：取得目前路由的資訊；meta.title 是在 router/index.js 設定的
const route = useRoute()
</script>

<template>
  <div class="p-5">
    <Empty class="border">
      <EmptyHeader>
        <EmptyMedia variant="icon"><ConstructionIcon /></EmptyMedia>
        <EmptyTitle>{{ route.meta.title }}</EmptyTitle>
        <EmptyDescription>這一頁還沒製作，目前網址：{{ route.path }}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  </div>
</template>
