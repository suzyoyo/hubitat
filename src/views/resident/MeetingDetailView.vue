<script setup>
// 住戶端・會議紀錄：看一場會議的重點摘要和全文記錄（全文已經遮蔽個資）
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { DownloadIcon } from '@lucide/vue'
import MeetingHead from '@/components/meeting/MeetingHead.vue'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCurrentUser, getMeetingById } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// 網址是 /resident/meetings/:id，所以 route.params.id 就是這場會議的編號
const route = useRoute()

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 這場會議。找不到時（編號不存在，或是還沒發布給住戶）假 API 會回傳 undefined
const meeting = ref(null)
const currentTab = ref('summary') // 目前選到的分頁：'summary' 重點摘要 / 'full' 全文記錄

// 兩個分頁
const tabs = [
  { value: 'summary', label: '重點摘要' },
  { value: 'full', label: '全文記錄' },
]

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('resident')
  meeting.value = await getMeetingById(route.params.id, 'resident', user.id)
  loading.value = false
})

// 下載會議紀錄：下載的是管委會遮蔽過個資的版本
// 假資料沒有真的檔案，先跳提示
function download() {
  toast.success('已開始下載', { description: `${meeting.value.title}.pdf` })
}
</script>

<template>
  <div class="space-y-6 px-5 pt-4 pb-8">
    <!-- 載入中 -->
    <template v-if="loading">
      <Skeleton class="h-[110px] rounded-xl" />
      <Skeleton class="h-11 rounded-lg" />
      <Skeleton class="h-[300px] rounded-xl" />
    </template>

    <!-- 找不到這場會議 -->
    <Empty v-else-if="!meeting" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這份會議紀錄</EmptyTitle>
      <EmptyDescription class="type-body">可能還沒公開，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink to="/resident/home">回到首頁</RouterLink>
      </Button>
    </Empty>

    <!-- 有資料 -->
    <template v-else>
      <div class="space-y-4">
        <MeetingHead :meeting="meeting" />
        <Button variant="outline" class="w-full" @click="download">
          <DownloadIcon />
          下載會議紀錄（PDF）
        </Button>
      </div>

      <!-- v-model：分頁切換時，currentTab 會跟著變 -->
      <Tabs v-model="currentTab" class="gap-4">
        <TabsList class="h-11! w-full rounded-xl border border-border bg-background p-1">
          <!-- before:…：按鈕看起來大約 35px 高，用看不見的 before 往上下各補 8px，可以點的範圍超過 44px -->
          <TabsTrigger
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            class="text-base text-muted-foreground before:absolute before:inset-x-0 before:-inset-y-2 data-active:bg-secondary data-active:text-secondary-foreground"
          >
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>

        <!-- 兩個分頁的內容：下一步再做 -->
        <TabsContent value="summary">
          <p class="type-body text-muted-foreground">重點摘要（下一步做）</p>
        </TabsContent>
        <TabsContent value="full">
          <p class="type-body text-muted-foreground">全文記錄（之後做）</p>
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>
