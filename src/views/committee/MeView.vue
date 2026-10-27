<script setup>
// 管委會端・我的：個人資料、身分、交接與設定（主委、副主委才有）、顯示設定、系統與支援、登出、版本
// 設計稿「管委會端-我的（換屆版）」1241:16255。版面和住戶端的「我的」頁（views/resident/MeView.vue）一致
import { computed, onMounted, ref, watch } from 'vue'
import {
  ArrowLeftRightIcon,
  BellIcon,
  Building2Icon,
  ChevronRightIcon,
  CircleHelpIcon,
  LockIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
  UserRoundIcon,
} from '@lucide/vue'
import HomeTour from '@/components/app/HomeTour.vue'
import MenuItem from '@/components/app/MenuItem.vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HELP_CENTER_URL } from '@/config/links'
import { TOUR_STEPS } from '@/config/tour'
import { getCommunity, getCurrentUser, getTerm } from '@/mocks/api'
// 版本號直接讀專案最外層的 package.json，和住戶端一樣
import { version } from '../../../package.json'

const loading = ref(true)
const user = ref(null) // 我是誰（管委會的身分：displayName 是「李主委」、titleLabel 是「主委」）
const community = ref(null) // 社區基本資料（要顯示社區名稱）
const term = ref(null) // 這一屆管委會：第幾屆、任期到什麼時候

onMounted(async () => {
  const [me, communityInfo, termInfo] = await Promise.all([getCurrentUser('committee'), getCommunity(), getTerm()])
  user.value = me
  community.value = communityInfo
  term.value = termInfo
  loading.value = false
})

// 個人資料卡的第三行：「第 12 屆・任期至 2027/06」
const termText = computed(() => {
  const [year, month] = term.value.endDate.split('-') // '2027-06-30' → ['2027', '06', '30']
  return `第 ${term.value.number} 屆・任期至 ${year}/${month}`
})

// 「交接與設定」只有主委、副主委看得到（docs/permissions.md：換屆交接、社區設定、緊急標示使用紀錄）
// 設計稿寫「主委專用權限」，權限表是主委、副主委都可以，照權限表
const isChairOrVice = computed(() => ['chair', 'viceChair'].includes(user.value?.committeeTitle))

// 「交接與設定」的三列；to 是點了要去的頁面（都還是佔位頁）
// 換屆交接的進度（第幾屆交接中、第幾步）假資料還沒有，先寫一般的說明
const handoverItems = [
  { label: '換屆交接', description: '建立新一屆、移交權限與交接包', icon: ShieldCheckIcon, to: '/committee/me/handover' },
  { label: '社區設定', description: '地點清單與問題分類', icon: Building2Icon, to: '/committee/me/settings' },
  {
    label: '緊急標示使用紀錄',
    description: '事後檢視誰在何時標過「緊急」',
    icon: TriangleAlertIcon,
    to: '/committee/me/urgent-log',
  },
]

// 字體大小：和住戶端用同一個 localStorage 抽屜，兩端選的會一樣
// 目前只有外觀，選了會記住，但不會真的改變文字大小（和住戶端一樣）
const fontSizes = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
]
const FONT_SIZE_KEY = 'hubitat-font-size'
const savedFontSize = localStorage.getItem(FONT_SIZE_KEY)
const fontSize = ref(fontSizes.some((item) => item.value === savedFontSize) ? savedFontSize : 'medium')
watch(fontSize, (value) => localStorage.setItem(FONT_SIZE_KEY, value))

// 「系統與支援」的三列（版本資訊不做成一列，和住戶端一樣放在最下面一行字）
// 使用說明用 href 連到網頁版使用手冊，和住戶端一樣
const supportItems = [
  { label: '通知設定', icon: BellIcon, to: '/committee/me/notifications' },
  { label: '使用說明', icon: CircleHelpIcon, href: HELP_CENTER_URL, tour: 'help' },
  { label: '帳號與安全', icon: LockIcon, to: '/committee/me/account' },
]
</script>

<template>
  <div class="space-y-8 px-5 pt-4">
    <!-- 個人資料：整張卡可以點，連到個人資料（還是佔位頁） -->
    <Skeleton v-if="loading" class="h-[108px] rounded-xl" />
    <RouterLink v-else to="/committee/me/profile" class="flex items-center gap-3.5 rounded-xl bg-card p-4 shadow-card">
      <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted">
        <UserRoundIcon class="size-6" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="type-card-title text-heading">{{ user.displayName }}</p>
        <!-- 管委會端不顯示戶號（2026-10-14 決定），只有社區名稱和任期 -->
        <p class="type-date text-muted-foreground">{{ community.name }}</p>
        <p class="type-date text-muted-foreground">{{ termText }}</p>
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
          <Badge v-else variant="outline">管委會・{{ user.titleLabel }}</Badge>
        </div>
        <Separator />
        <MenuItem title="切換至住戶" to="/resident/home">
          <ArrowLeftRightIcon />
        </MenuItem>
      </div>
    </section>

    <!-- 交接與設定：主委、副主委才看得到 -->
    <section v-if="isChairOrVice" class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="type-title text-heading">交接與設定</h2>
        <Badge variant="outline">主委、副主委權限</Badge>
      </div>
      <div class="rounded-xl bg-card px-4 py-1 shadow-card">
        <template v-for="(item, index) in handoverItems" :key="item.label">
          <Separator v-if="index > 0" />
          <MenuItem :title="item.label" :description="item.description" :to="item.to">
            <component :is="item.icon" />
          </MenuItem>
        </template>
      </div>
    </section>

    <!-- 顯示設定（和住戶端一樣） -->
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

    <!-- 系統與支援（和住戶端一樣） -->
    <section class="space-y-3">
      <SectionHeader title="系統與支援" />
      <div class="rounded-xl bg-card px-4 py-1 shadow-card">
        <template v-for="(item, index) in supportItems" :key="item.label">
          <Separator v-if="index > 0" />
          <MenuItem :title="item.label" :to="item.to" :href="item.href" :data-tour="item.tour"><component :is="item.icon" /></MenuItem>
        </template>
      </div>
    </section>

    <!-- 還沒有登入功能，登出先回到角色選擇頁 -->
    <!-- 淺藍按鈕的字和底線，底色改白色（2026-10-19 013：放在淺色頁面上比較清楚）；按鈕規則的例外，只有登出這顆 -->
    <Button as-child variant="secondary" class="w-full bg-card hover:bg-muted">
      <RouterLink to="/">登出帳號</RouterLink>
    </Button>

    <p class="text-center type-date text-muted-foreground">好彼社區 V{{ version }}</p>

    <!-- 首頁導覽的最後一步在這裡接著亮「使用說明」（只有從首頁導覽過來才會打開，app/HomeTour.vue） -->
    <HomeTour :steps="TOUR_STEPS.committee" storage-key="hubitat-tour-committee" page="me" :ready="!loading" />
  </div>
</template>
