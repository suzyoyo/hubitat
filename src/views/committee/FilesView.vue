<script setup>
// 管委會端・社區（底部分頁）：社區檔案的入口（設計稿「管委會端-社區檔案」1134:14720）
// 三組清單：會議與決議、文件庫、設備。需要注意的那幾列右邊有徽章，數字從假資料算出來
// 點進去的頁面都還是佔位頁；搜尋框先連到搜尋頁（也是佔位頁）
import {
  ChevronRightIcon,
  ClipboardListIcon,
  FileTextIcon,
  HistoryIcon,
  ListChecksIcon,
  ScrollTextIcon,
  SearchIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import IconTile from '@/components/common/IconTile.vue'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getContracts, getLegalDocuments, getMeetings, getResolutions } from '@/mocks/api'

const loading = ref(true)
const meetings = ref([])
const notStartedResolutions = ref([])
const legalDocuments = ref([])
const contracts = ref([])

onMounted(async () => {
  const [meetingList, resolutionList, documentList, contractList] = await Promise.all([
    getMeetings('committee'),
    getResolutions('not_started'),
    getLegalDocuments(),
    getContracts('committee'),
  ])
  meetings.value = meetingList
  notStartedResolutions.value = resolutionList
  legalDocuments.value = documentList
  contracts.value = contractList
  loading.value = false
})

// ── 每一列右邊的徽章（dev-guide 第 5 節管理端的顏色）；沒有要注意的就是 null ──
// 會議紀錄：還沒發布給住戶的（待整理、待發布）→ 橘：輪到委員處理
const meetingBadge = computed(() => {
  const count = meetings.value.filter((item) => item.status !== 'published').length
  return count ? { variant: 'secondary', text: `${count} 場待發布` } : null
})
// 決議事項：還沒開始執行的 → 橘
const resolutionBadge = computed(() => {
  const count = notStartedResolutions.value.length
  return count ? { variant: 'secondary', text: `${count} 項未執行` } : null
})
// 法定文件：缺件、已過期 → 紅（已經出問題）；只有快到期 → 橘
const documentBadge = computed(() => {
  const problems = legalDocuments.value.filter((doc) => ['missing', 'expired'].includes(doc.status))
  const expiring = legalDocuments.value.filter((doc) => doc.status === 'expiring')
  const count = problems.length + expiring.length
  if (!count) return null
  return { variant: problems.length ? 'destructive' : 'secondary', text: `${count} 件待處理` }
})
// 廠商合約：30 天內到期 → 橘
const contractBadge = computed(() =>
  contracts.value.some((item) => item.status === 'expiring') ? { variant: 'secondary', text: '即將到期' } : null,
)

// 三組清單；badge 是上面算好的徽章（沒有就不寫）
const groups = computed(() => [
  {
    title: '會議與決議',
    rows: [
      { label: '會議紀錄', icon: UsersIcon, to: '/committee/meetings', badge: meetingBadge.value },
      { label: '決議事項', icon: ListChecksIcon, to: '/committee/resolutions', badge: resolutionBadge.value },
    ],
  },
  {
    title: '文件庫',
    rows: [
      { label: '規約', icon: ScrollTextIcon, to: '/committee/bylaws' },
      { label: '社區規則與慣例', icon: FileTextIcon, to: '/committee/rules' },
      { label: '法定文件', icon: ShieldCheckIcon, to: '/committee/documents', badge: documentBadge.value },
      { label: '廠商合約', icon: FileTextIcon, to: '/committee/contracts', badge: contractBadge.value },
    ],
  },
  {
    title: '設備',
    rows: [
      { label: '設備清冊', icon: ClipboardListIcon, to: '/committee/equipment' },
      { label: '社區時間軸', icon: HistoryIcon, to: '/committee/timeline' },
    ],
  },
])
</script>

<template>
  <div class="space-y-8 px-5 pt-4 pb-5">
    <!-- 搜尋框：點了到搜尋頁（長得像輸入框，其實是連結） -->
    <RouterLink
      to="/committee/search"
      class="flex h-11 items-center gap-2 rounded-lg border border-input bg-card px-3 type-body text-muted-foreground"
    >
      <SearchIcon class="size-5 shrink-0" />
      搜尋案件、會議、文件、合約
    </RouterLink>

    <section v-for="group in groups" :key="group.title" class="space-y-3">
      <h2 class="type-title text-heading">{{ group.title }}</h2>
      <div class="rounded-xl bg-card px-4 py-1 shadow-card">
        <template v-for="(row, index) in group.rows" :key="row.label">
          <Separator v-if="index > 0" />
          <!-- 整列可以點 -->
          <RouterLink :to="row.to" class="flex items-center gap-3 py-3.5">
            <IconTile variant="square">
              <component :is="row.icon" />
            </IconTile>
            <span class="min-w-0 flex-1 type-body-strong text-foreground">{{ row.label }}</span>
            <!-- 徽章要等資料回來才知道；載入中先放一塊灰色的 -->
            <Skeleton v-if="loading && row.badge !== undefined" class="h-[22px] w-16" />
            <Badge v-else-if="row.badge" :variant="row.badge.variant" class="shrink-0">{{ row.badge.text }}</Badge>
            <ChevronRightIcon class="size-5 shrink-0" />
          </RouterLink>
        </template>
      </div>
    </section>
  </div>
</template>
