<script setup>
// 住戶端・我的：個人資料、身分、顯示設定、系統與支援、登出
import { computed, onMounted, ref, watch } from 'vue'
import {
  ArrowLeftRightIcon,
  BellIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  InfoIcon,
  LockIcon,
  UserRoundIcon,
} from '@lucide/vue'
import MenuItem from '@/components/app/MenuItem.vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCommunity, getCurrentUser, getMyTodos } from '@/mocks/api'

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
const user = ref(null) // 我是誰
const community = ref(null) // 社區基本資料（要顯示社區名稱）
const todoTotal = ref(0) // 我在管委會那邊有幾件待辦（不是委員就是 0）

// 我是不是委員：是的話才有「切換至管委會」
const isCommittee = computed(() => user.value?.roles.includes('committee'))
// 「切換至管委會」下面的說明；沒有待辦就不顯示
const switchHint = computed(() => (todoTotal.value ? `有 ${todoTotal.value} 件事等你處理` : ''))

// 字體大小：目前只有外觀，選了會記住，但不會真的改變文字大小
const fontSizes = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
]
// localStorage：瀏覽器幫每個網站留的小抽屜，重新整理或關掉網頁後東西還在
// 一開始先看抽屜裡有沒有上次選的；沒有（或放了看不懂的值）就用「中」
const FONT_SIZE_KEY = 'hubitat-font-size'
const savedFontSize = localStorage.getItem(FONT_SIZE_KEY)
const fontSize = ref(fontSizes.some((item) => item.value === savedFontSize) ? savedFontSize : 'medium')
// watch：fontSize 一改變，就把新的值存進抽屜
watch(fontSize, (value) => localStorage.setItem(FONT_SIZE_KEY, value))

// 「系統與支援」的四列；to 是點了要去的頁面（都還是佔位頁）
const supportItems = [
  { label: '通知設定', icon: BellIcon, to: '/resident/me/notifications' },
  { label: '使用說明', icon: CircleHelpIcon, to: '/resident/me/help' },
  { label: '帳號與安全', icon: LockIcon, to: '/resident/me/account' },
  { label: '版本資訊', icon: InfoIcon, to: '/resident/me/version' },
]

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  // Promise.all：兩種資料同時去拿，全部回來才往下走
  const [me, communityInfo] = await Promise.all([getCurrentUser('resident'), getCommunity()])
  user.value = me
  community.value = communityInfo
  // 委員才有待辦；待辦要用管委會的身分去拿
  if (isCommittee.value) {
    const todos = await getMyTodos(me.id, 'committee')
    todoTotal.value = todos.total
  }
  loading.value = false
})
</script>

<template>
  <div class="space-y-8 px-5 pt-4">
    <!-- 個人資料 -->
    <Skeleton v-if="loading" class="h-[108px] rounded-xl" />
    <!-- 整張卡可以點，連到個人資料（還是佔位頁） -->
    <RouterLink
      v-else
      to="/resident/me/profile"
      class="flex items-center gap-3.5 rounded-xl bg-card p-4 shadow-card"
    >
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
    </RouterLink>

    <!-- 身分 -->
    <section class="space-y-3">
      <SectionHeader title="身分" />
      <div class="rounded-xl bg-card px-4 py-1 shadow-card">
        <div class="flex items-center justify-between py-3.5">
          <p class="type-body-strong">目前身分</p>
          <!-- 身分只是分類，用灰色徽章 -->
          <Badge variant="outline">住戶</Badge>
        </div>
        <Separator v-if="loading || isCommittee" />
        <!-- 載入中還不知道是不是委員，先放一塊灰色的 -->
        <Skeleton v-if="loading" class="my-3.5 h-11" />
        <MenuItem
          v-else-if="isCommittee"
          title="切換至管委會"
          :description="switchHint"
          to="/committee/home"
        >
          <ArrowLeftRightIcon />
        </MenuItem>
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
          <MenuItem :title="item.label" :to="item.to"><component :is="item.icon" /></MenuItem>
        </template>
      </div>
    </section>

    <!-- 還沒有登入功能，登出先回到角色選擇頁 -->
    <!-- as-child：讓 Button 的外觀套在裡面的 RouterLink 上，按下去就是換頁 -->
    <Button as-child variant="outline" class="w-full">
      <RouterLink to="/">登出帳號</RouterLink>
    </Button>
  </div>
</template>
