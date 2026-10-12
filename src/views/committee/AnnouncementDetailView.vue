<script setup>
// 管委會端・公告詳情：一則公告的時間、地點、內容說明與發布紀錄
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { getAnnouncementById } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// useRoute()：取得目前路由的資訊
// 網址是 /committee/announcements/:id，所以 route.params.id 就是這則公告的編號
const route = useRoute()

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 這一則公告。編號不存在時，假 API 會回傳 undefined
const announcement = ref(null)

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  announcement.value = await getAnnouncementById(route.params.id, 'committee')
  loading.value = false
})
</script>

<template>
  <div class="space-y-4 px-5 pt-4">
    <!-- 載入中：三個和卡片差不多高的灰色方塊 -->
    <template v-if="loading">
      <Skeleton class="h-[200px] rounded-xl" />
      <Skeleton class="h-[120px] rounded-xl" />
      <Skeleton class="h-[150px] rounded-xl" />
    </template>

    <!-- 找不到這則公告 -->
    <Empty v-else-if="!announcement" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這則公告</EmptyTitle>
      <EmptyDescription class="type-body">可能已經刪除，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink to="/committee/home">回到首頁</RouterLink>
      </Button>
    </Empty>

    <!-- 有資料：卡片在第 3、4 步做，先顯示標題確認資料拿到了 -->
    <p v-else class="type-card-title">{{ announcement.title }}</p>
  </div>
</template>
