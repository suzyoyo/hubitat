<script setup>
// 住戶端・我的留言：我在各場會議紀錄留給管委會的話，和管委會的回覆
import { computed, onMounted, ref } from 'vue'
import CommentThread from '@/components/comment/CommentThread.vue'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCurrentUser, getMyComments } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
const comments = ref([]) // 我的留言，新的在前（假 API 已經排好）
const currentTab = ref('all') // 目前選到的分頁：'all' 全部 / 'pending' 待回覆

onMounted(async () => {
  const user = await getCurrentUser('resident')
  comments.value = await getMyComments(user.id)
  loading.value = false
})

// 兩個分頁，各自要顯示的留言和空狀態的文字
const tabs = computed(() => [
  {
    value: 'all',
    label: '全部',
    comments: comments.value,
    emptyTitle: '還沒有留言',
    emptyText: '看會議紀錄時，可以隨時向管委會提問',
  },
  {
    value: 'pending',
    label: '待回覆',
    comments: comments.value.filter((item) => !item.isReplied),
    emptyTitle: '沒有等待回覆的留言',
    emptyText: '管委會回覆的留言，都在「全部」裡',
  },
])

// 「待回覆」分頁上的數字：還沒回覆的有幾則（0 則就不顯示）
const pendingCount = computed(() => tabs.value[1].comments.length)
</script>

<template>
  <Tabs v-model="currentTab" class="gap-4 px-5 pt-4 pb-8">
    <!-- 分頁的寫法和「社區公告」一樣：整列高 44px，按鈕用 before 把可以點的範圍補到 44px 以上 -->
    <TabsList class="h-11! w-full rounded-xl border border-border bg-background p-1">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="text-base text-muted-foreground before:absolute before:inset-x-0 before:-inset-y-2 data-active:bg-secondary data-active:text-secondary-foreground"
      >
        {{ tab.label }}
        <Badge v-if="tab.value === 'pending' && pendingCount">{{ pendingCount }}</Badge>
      </TabsTrigger>
    </TabsList>

    <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value" class="space-y-4">
      <!-- 載入中：放兩個和卡片差不多高的灰色方塊 -->
      <template v-if="loading">
        <Skeleton class="h-[250px] rounded-xl" />
        <Skeleton class="h-[200px] rounded-xl" />
      </template>
      <!-- 沒有留言：好彼管家拿著放大鏡 -->
      <Empty v-else-if="tab.comments.length === 0" class="gap-3 pt-10">
        <EmptyMedia>
          <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
          <img :src="mascotUrl" alt="" width="233" height="229" class="h-[94px] w-auto" />
        </EmptyMedia>
        <!-- 結尾的 ! 是「一定要用這個」：ui/empty 本身有 text-sm 的預設字級，不加會被蓋掉變成 14px -->
        <EmptyTitle class="type-card-title! text-heading">{{ tab.emptyTitle }}</EmptyTitle>
        <EmptyDescription class="type-date">{{ tab.emptyText }}</EmptyDescription>
      </Empty>
      <!-- 有留言：一則一張卡片 -->
      <template v-else>
        <CommentThread v-for="comment in tab.comments" :key="comment.id" :comment="comment" />
      </template>
    </TabsContent>
  </Tabs>
</template>
