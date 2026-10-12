<script setup>
// 住戶端・社區公告：列出社區的公告，分成「與我有關」「社區公告」兩個分頁
import { onMounted, ref } from 'vue'
import NoticeCard from '@/components/notice/NoticeCard.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { getAnnouncements, getCurrentUser } from '@/mocks/api'

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
const notices = ref([]) // 住戶看得到的所有公告（已發布、還沒結束），依開始時間排序

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('resident')
  notices.value = await getAnnouncements(user.id)
  loading.value = false
})
</script>

<template>
  <div class="space-y-4 px-5 pt-4">
    <!-- 載入中：放兩個和卡片差不多高的灰色方塊 -->
    <template v-if="loading">
      <Skeleton class="h-[236px] rounded-xl" />
      <Skeleton class="h-[236px] rounded-xl" />
    </template>
    <!-- 有資料 -->
    <template v-else>
      <NoticeCard v-for="notice in notices" :key="notice.id" :notice="notice" />
    </template>
  </div>
</template>
