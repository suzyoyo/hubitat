<script setup>
// 管理人員端・我的：個人資料、身分、顯示設定、系統與支援、登出、版本（設計稿「管理人員-我的」1492:16250）
// 版面和管委會端的「我的」（views/committee/MeView.vue）一致，少了「交接與設定」（管理人員沒有這些權限）
import { computed, onMounted, ref, watch } from 'vue'
import { ArrowLeftRightIcon, BellIcon, ChevronRightIcon, CircleHelpIcon, LockIcon, UserRoundIcon } from '@lucide/vue'
import MenuItem from '@/components/app/MenuItem.vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HELP_CENTER_URL } from '@/config/links'
import { getCommunity, getCurrentUser } from '@/mocks/api'
// 版本號直接讀專案最外層的 package.json，和其他兩端一樣
import { version } from '../../../package.json'

const loading = ref(true)
const user = ref(null) // 我是誰（管理人員的身分：displayName 是「張管理員」、titleLabel 是「管理員」）
const community = ref(null) // 社區基本資料（要顯示社區名稱）

onMounted(async () => {
  const [me, communityInfo] = await Promise.all([getCurrentUser('staff'), getCommunity()])
  user.value = me
  community.value = communityInfo
  loading.value = false
})

// 「切換至住戶」：設計稿寫「管理人員有綁定戶號才顯示」。假資料的管理人員都沒有戶號，所以目前看不到
const hasUnit = computed(() => Boolean(user.value?.building && user.value?.unit))

// 字體大小：和其他兩端用同一個 localStorage 抽屜，選的會一樣
// 目前只有外觀，選了會記住，但不會真的改變文字大小
const fontSizes = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
]
const FONT_SIZE_KEY = 'hubitat-font-size'
const savedFontSize = localStorage.getItem(FONT_SIZE_KEY)
const fontSize = ref(fontSizes.some((item) => item.value === savedFontSize) ? savedFontSize : 'medium')
watch(fontSize, (value) => localStorage.setItem(FONT_SIZE_KEY, value))

// 「系統與支援」的三列；設計稿還有「版本資訊」一列，照住戶端的決定改成最下面一行灰字
// 使用說明用 href 連到網頁版使用手冊，和住戶端一樣
const supportItems = [
  { label: '通知設定', icon: BellIcon, to: '/staff/me/notifications' },
  { label: '使用說明', icon: CircleHelpIcon, href: HELP_CENTER_URL },
  { label: '帳號與安全', icon: LockIcon, to: '/staff/me/account' },
]
</script>

<template>
  <div class="space-y-8 px-5 pt-4 pb-5">
    <!-- 個人資料：整張卡可以點，連到個人資料（還是佔位頁） -->
    <Skeleton v-if="loading" class="h-[108px] rounded-xl" />
    <RouterLink v-else to="/staff/me/profile" class="flex items-center gap-3.5 rounded-xl bg-card p-4 shadow-card">
      <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted">
        <UserRoundIcon class="size-6" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="type-card-title text-heading">{{ user.displayName }}</p>
        <p class="type-date text-muted-foreground">{{ community.name }}</p>
        <p class="type-date text-muted-foreground">管理人員・{{ user.titleLabel }}</p>
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
          <Skeleton v-if="loading" class="h-[22px] w-24" />
          <Badge v-else variant="outline">管理人員・{{ user.titleLabel }}</Badge>
        </div>
        <template v-if="hasUnit">
          <Separator />
          <MenuItem title="切換至住戶" to="/resident/home">
            <ArrowLeftRightIcon />
          </MenuItem>
        </template>
      </div>
    </section>

    <!-- 顯示設定（和其他兩端一樣） -->
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
          <Separator v-if="index > 0" />
          <MenuItem :title="item.label" :to="item.to" :href="item.href"><component :is="item.icon" /></MenuItem>
        </template>
      </div>
    </section>

    <!-- 還沒有登入功能，登出先回到角色選擇頁 -->
    <!-- 淺藍按鈕的字和底線，底色改白色（2026-10-19 013：放在淺色頁面上比較清楚）；按鈕規則的例外，只有登出這顆 -->
    <Button as-child variant="secondary" class="w-full bg-card hover:bg-muted">
      <RouterLink to="/">登出帳號</RouterLink>
    </Button>

    <p class="text-center type-date text-muted-foreground">好彼社區 V{{ version }}</p>
  </div>
</template>
