<script setup>
// 住戶端・我的：個人資料、身分、顯示設定、系統與支援、登出
import { onMounted, ref } from 'vue'
import {
  ArrowLeftRightIcon,
  BellIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  InfoIcon,
  LockIcon,
  UserRoundIcon,
} from '@lucide/vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCommunity, getCurrentUser } from '@/mocks/api'

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
const user = ref(null) // 我是誰
const community = ref(null) // 社區基本資料（要顯示社區名稱）

// 字體大小：目前只有外觀，選了不會真的改變文字大小
const fontSizes = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
]
const fontSize = ref('medium')

// 「系統與支援」的四列
const supportItems = [
  { label: '通知設定', icon: BellIcon },
  { label: '使用說明', icon: CircleHelpIcon },
  { label: '帳號與安全', icon: LockIcon },
  { label: '版本資訊', icon: InfoIcon },
]

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  // Promise.all：兩種資料同時去拿，全部回來才往下走
  const [me, communityInfo] = await Promise.all([getCurrentUser('resident'), getCommunity()])
  user.value = me
  community.value = communityInfo
  loading.value = false
})
</script>

<template>
  <div class="space-y-8 px-5 pt-4">
    <!-- 個人資料 -->
    <Skeleton v-if="loading" class="h-[108px] rounded-xl" />
    <div v-else class="flex items-center gap-3.5 rounded-xl bg-card p-4 shadow-card">
      <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted">
        <UserRoundIcon class="size-6" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="type-card-title text-heading">{{ user.name }}</p>
        <!-- 社區名稱和戶號分成兩行，放在同一行手機上會折行 -->
        <p class="type-date text-muted-foreground">{{ community.name }}</p>
        <p class="type-date text-muted-foreground">{{ user.building }} 棟 {{ user.unit }}</p>
      </div>
      <ChevronRightIcon class="size-5 shrink-0" />
    </div>

    <!-- 身分 -->
    <section class="space-y-3">
      <SectionHeader title="身分" />
      <div class="rounded-xl bg-card px-4 py-1 shadow-card">
        <div class="flex items-center justify-between py-3.5">
          <p class="type-body-strong">目前身分</p>
          <!-- 身分只是分類，用灰色徽章 -->
          <Badge variant="outline">住戶</Badge>
        </div>
        <Separator />
        <div class="flex items-center gap-3 py-3.5">
          <ArrowLeftRightIcon class="size-5 shrink-0" />
          <p class="flex-1 type-body">切換至管委會</p>
          <ChevronRightIcon class="size-5 shrink-0" />
        </div>
      </div>
    </section>

    <!-- 顯示設定 -->
    <section class="space-y-3">
      <SectionHeader title="顯示設定" />
      <div class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-center justify-between">
          <p class="type-body-strong">字體大小</p>
          <p class="type-date text-muted-foreground">
            目前：{{ fontSizes.find((item) => item.value === fontSize).label }}
          </p>
        </div>
        <!-- 只借用 Tabs 的外觀來當「三選一」，沒有對應的分頁內容 -->
        <Tabs v-model="fontSize">
          <TabsList class="h-11! w-full rounded-xl border bg-background p-1">
            <TabsTrigger
              v-for="item in fontSizes"
              :key="item.value"
              :value="item.value"
              class="text-base text-muted-foreground before:absolute before:inset-x-0 before:-inset-y-2 data-active:bg-secondary data-active:text-secondary-foreground"
            >
              {{ item.label }}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <p class="type-date text-muted-foreground">調整後，所有頁面的文字大小會一起改變。</p>
      </div>
    </section>

    <!-- 系統與支援 -->
    <section class="space-y-3">
      <SectionHeader title="系統與支援" />
      <div class="rounded-xl bg-card px-4 py-1 shadow-card">
        <template v-for="(item, index) in supportItems" :key="item.label">
          <!-- 第一列上面不用分隔線 -->
          <Separator v-if="index > 0" />
          <div class="flex items-center gap-3 py-3.5">
            <component :is="item.icon" class="size-5 shrink-0" />
            <p class="flex-1 type-body">{{ item.label }}</p>
            <ChevronRightIcon class="size-5 shrink-0" />
          </div>
        </template>
      </div>
    </section>

    <Button variant="outline" class="w-full">登出帳號</Button>
  </div>
</template>
