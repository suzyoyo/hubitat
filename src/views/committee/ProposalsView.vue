<script setup>
// 管委會端・提案與簽核：列出所有提案，可以篩選「等我簽核」「已通過」「已否決」
import { computed, onMounted, ref } from 'vue'
import { ChevronRightIcon, InfoIcon, PlusIcon } from '@lucide/vue'
import FilterChips from '@/components/common/FilterChips.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/date'
import { getCurrentUser, getProposals } from '@/mocks/api'
import { PROPOSAL_STATUSES } from '@/mocks/data/proposals'

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
const proposals = ref([]) // 所有提案，新的在前

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('committee')
  proposals.value = await getProposals(user.id)
  loading.value = false
})

// 篩選：4 個選項，用篩選標籤（dev-guide 第 5 節「篩選」）
const FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'mine', label: '等我簽核' },
  { value: 'passed', label: '已通過' },
  { value: 'rejected', label: '已否決' },
]
const filter = ref('all')

const shownProposals = computed(() => {
  if (filter.value === 'all') return proposals.value
  if (filter.value === 'mine') return proposals.value.filter((item) => item.needsMySign)
  return proposals.value.filter((item) => item.status === filter.value)
})

// 狀態徽章（管理端的顏色規則）
//   等我簽核 → 橘，順便寫剩幾天；簽核中（我簽了、等別人）→ 藍；已通過、已否決 → 灰
function statusBadge(item) {
  if (item.needsMySign) {
    const days = item.daysLeft
    const left = days > 0 ? `剩 ${days} 天` : days === 0 ? '今日截止' : '已截止'
    return { text: `等我簽核・${left}`, variant: 'secondary' }
  }
  if (item.status === 'signing') return { text: PROPOSAL_STATUSES.signing.label, variant: 'default' }
  return { text: PROPOSAL_STATUSES[item.status].label, variant: 'outline' }
}

// 簽核進度：還在簽是「已簽 2/5」；簽完多寫結果，例如「已簽 5/5・同意 5」
function progressText(item) {
  const signed = `已簽 ${item.signedCount}/${item.totalCount}`
  if (item.status === 'signing') return signed
  // 同意／不同意的提案：tally 是 { agree, disagree }
  if (item.kind === 'approve') {
    const parts = [`同意 ${item.tally.agree}`]
    if (item.tally.disagree) parts.push(`不同意 ${item.tally.disagree}`)
    return `${signed}・${parts.join('・')}`
  }
  // 選項式的提案：tally 是每個選項的票數，寫最多票的那一個
  const top = item.tally.toSorted((a, b) => b.count - a.count)[0]
  return `${signed}・${top.name} ${top.count} 票`
}

// 我的意見：簽過才有，例如「我已簽：同意」
function myOpinionText(item) {
  const decision = item.mySignature.decision
  if (item.kind === 'approve') return `我已簽：${decision === 'agree' ? '同意' : '不同意'}`
  const option = item.options.find((entry) => entry.key === decision)
  return `我已簽：${option ? option.name : decision}`
}

// 卡片裡的資訊列；沒簽過就沒有「我的意見」
function rows(item) {
  const list = [
    { label: '發起人', value: item.proposerLabel },
    { label: '簽核進度', value: progressText(item) },
  ]
  if (item.mySignature) list.push({ label: '我的意見', value: myOpinionText(item) })
  list.push({ label: '簽核截止', value: formatDate(item.deadline) })
  return list
}
</script>

<template>
  <div class="space-y-4 px-5 pt-4 pb-5">
    <Alert>
      <InfoIcon />
      <AlertTitle>法定效力說明</AlertTitle>
      <AlertDescription>逐一簽核僅為委員意見紀錄，不等於開會表決。需執行之提案仍送管委會決議。</AlertDescription>
    </Alert>

    <Button as-child class="w-full">
      <RouterLink to="/committee/proposals/new">
        <PlusIcon />
        新增提案
      </RouterLink>
    </Button>

    <FilterChips v-model="filter" :options="FILTERS" />

    <template v-if="loading">
      <Skeleton v-for="n in 3" :key="n" class="h-[200px] rounded-xl" />
    </template>
    <div v-else-if="!shownProposals.length" class="rounded-xl bg-card p-4 shadow-card">
      <p class="type-body text-muted-foreground">沒有這類提案</p>
    </div>
    <!-- 整張卡可以點，右下角的「前往簽核 ›」「查看詳情 ›」只是提示（和我的待辦一樣） -->
    <RouterLink
      v-for="item in shownProposals"
      v-else
      :key="item.id"
      :to="`/committee/proposals/${item.id}`"
      class="block space-y-3 rounded-xl bg-card p-4 shadow-card"
    >
      <div class="flex items-start gap-2">
        <h3 class="min-w-0 flex-1 type-card-title text-foreground">{{ item.title }}</h3>
        <Badge :variant="statusBadge(item).variant" class="mt-0.5">{{ statusBadge(item).text }}</Badge>
      </div>
      <div v-for="row in rows(item)" :key="row.label" class="flex items-baseline gap-4">
        <p class="w-16 shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
        <p class="min-w-0 flex-1 type-body text-foreground">{{ row.value }}</p>
      </div>
      <p class="flex items-center justify-end gap-1 type-link text-foreground">
        {{ item.needsMySign ? '前往簽核' : '查看詳情' }}
        <ChevronRightIcon class="size-4" />
      </p>
    </RouterLink>
  </div>
</template>
