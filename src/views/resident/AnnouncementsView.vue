<script setup>
// 住戶端・社區公告：列出社區的公告，分成「與我有關」「社區公告」兩個分頁
import { computed, onMounted, ref, watch } from 'vue'
import NoticeCard from '@/components/notice/NoticeCard.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAnnouncements, getCurrentUser, markAnnouncementsRead } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
const userId = ref('') // 我是誰，記已讀時要用
const notices = ref([]) // 住戶看得到的所有公告（已發布、還沒結束），依開始時間排序
const currentTab = ref('related') // 目前選到的分頁：'related' 或 'all'

// 兩個分頁的設定與各自的公告
// relatedToMe 是假 API 給的：全社區的公告，或影響到我住的那一棟
const tabs = computed(() => [
  // emptyTitle：這個分頁沒有公告時顯示的標題
  {
    value: 'related',
    label: '與我有關',
    emptyTitle: '近期沒有和你有關的公告',
    notices: notices.value.filter((item) => item.relatedToMe),
  },
  {
    value: 'all',
    label: '社區公告',
    emptyTitle: '近期沒有社區公告',
    notices: notices.value,
  },
])

// 某個分頁裡還沒看過的公告有幾則（顯示在分頁名稱旁邊）
function unreadCount(tab) {
  return tab.notices.filter((item) => !item.isRead).length
}

// 把「目前這個分頁」裡還沒看過的公告都記成已讀：打開分頁就算看過了
function markCurrentTabRead() {
  const tab = tabs.value.find((item) => item.value === currentTab.value)
  const unread = tab.notices.filter((item) => !item.isRead)
  if (unread.length === 0) return
  // 先改畫面上的資料，數字馬上消失；再告訴假 API，下次進來才會記得
  // 這裡不用 await：存檔在背景進行就好，不需要讓畫面等它
  for (const item of unread) {
    item.isRead = true
  }
  markAnnouncementsRead(
    userId.value,
    unread.map((item) => item.id),
  )
}

// onMounted：畫面一出現就去拿資料
// 一次把全部公告拿回來，再自己挑出與我有關的，切換分頁時就不用重新等資料
onMounted(async () => {
  const user = await getCurrentUser('resident')
  userId.value = user.id
  notices.value = await getAnnouncements(user.id)
  markCurrentTabRead() // 一進來看到的那個分頁
  loading.value = false
})

// watch：currentTab 一變（切換分頁）就執行後面的函式
watch(currentTab, markCurrentTabRead)
</script>

<template>
  <!-- v-model：分頁切換時，currentTab 會跟著變 -->
  <Tabs v-model="currentTab" class="gap-4 px-5 pt-4">
    <!-- 整列高 44px（設計稿 35px），長輩比較好按 -->
    <TabsList class="h-11! w-full rounded-xl border border-border bg-background p-1">
      <!-- TabsTrigger 與 TabsContent 用相同的 value 配對 -->
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="text-base text-muted-foreground data-active:bg-secondary data-active:text-secondary-foreground"
      >
        {{ tab.label }}
        <!-- 還沒看過的則數；點進那個分頁看過之後，數字就會消失 -->
        <Badge v-if="unreadCount(tab)">{{ unreadCount(tab) }}</Badge>
      </TabsTrigger>
    </TabsList>

    <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value" class="space-y-4">
      <!-- 載入中：放兩個和卡片差不多高的灰色方塊 -->
      <template v-if="loading">
        <Skeleton class="h-[243px] rounded-xl" />
        <Skeleton class="h-[243px] rounded-xl" />
      </template>
      <!-- 沒資料：好彼管家拿著放大鏡，包在一張卡片裡 -->
      <Empty v-else-if="tab.notices.length === 0" class="gap-3 bg-card px-5 py-8 shadow-card">
        <EmptyMedia>
          <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
          <!-- width / height 寫圖檔尺寸，讓瀏覽器先算好比例；實際顯示高度由 h-[84px] 決定 -->
          <img :src="mascotUrl" alt="" width="279" height="240" class="h-[84px] w-auto" />
        </EmptyMedia>
        <EmptyTitle class="type-card-title text-heading">{{ tab.emptyTitle }}</EmptyTitle>
        <EmptyDescription class="type-body">有新公告時好彼管家會通知你。</EmptyDescription>
        <!-- 「與我有關」沒有公告時，帶住戶去看全部的公告 -->
        <Button v-if="tab.value === 'related'" variant="outline" @click="currentTab = 'all'">
          查看社區公告
        </Button>
      </Empty>
      <!-- 有資料 -->
      <template v-else>
        <NoticeCard v-for="notice in tab.notices" :key="notice.id" :notice="notice" />
      </template>
    </TabsContent>
  </Tabs>
</template>
