<script setup>
// 管委會端・交辦進度：列出我交辦出去的事，看每一件做到哪裡，可以依狀態篩選
import { computed, onMounted, ref } from 'vue'
import { ChevronRightIcon, PlusIcon } from '@lucide/vue'
import FilterSelect from '@/components/common/FilterSelect.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate, formatTime } from '@/lib/date'
import { getCurrentUser, getTasks } from '@/mocks/api'
import { TASK_DISPLAY_STATUSES } from '@/mocks/data/tasks'

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 我交辦出去的事（包含已結案的，切換篩選時不用再拿一次）
const tasks = ref([])

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('committee')
  // 這頁看的是「我交辦給別人的」，所以用 assignerId（交辦人）；「交辦給我的」在我的待辦
  tasks.value = await getTasks({ assignerId: user.id, status: 'all' })
  loading.value = false
})

// 狀態篩選：value 對應假 API 的 displayStatus
//   5 個選項，照 dev-guide 第 5 節「篩選」用下拉選單（設計稿是篩選標籤）
//   選項固定，不管有沒有這個狀態的交辦都列出來
const STATUS_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'reported', label: '待我確認' },
  { value: 'overdue', label: '已逾期' },
  { value: 'in_progress', label: '進行中' },
  { value: 'done', label: '已完成' },
]
const status = ref('all')

// 篩選後要顯示的交辦（假 API 已經照期限排好了）
const shownTasks = computed(() => {
  if (status.value === 'all') return tasks.value
  return tasks.value.filter((task) => task.displayStatus === status.value)
})

// 還沒結案的件數：放在篩選下面當總覽，不跟著篩選變
const openCount = computed(() => tasks.value.filter((task) => task.isOpen).length)

// 狀態徽章的顏色（dev-guide 第 5 節，管理端那張表）
//   已逾期 → 紅：已經出問題；待確認 → 橘：輪到我（交辦人）確認
//   進行中 → 藍：在等對方做；已完成、已撤回 → 灰
const STATUS_VARIANTS = {
  overdue: 'destructive',
  reported: 'secondary',
  in_progress: 'default',
  done: 'outline',
  withdrawn: 'outline',
}

// 徽章文字：已逾期改成顯示逾期幾天；待確認寫成「待我確認」，看的人是交辦人，讓他知道輪到自己
//   其他用對照表的文字
function statusText(task) {
  if (task.displayStatus === 'overdue') return `逾期 ${-task.daysLeft} 天`
  if (task.displayStatus === 'reported') return '待我確認'
  return TASK_DISPLAY_STATUSES[task.displayStatus].label
}

// '2026-09-30T18:00' → '2026/09/30 18:00'（管委會端的日期有年份）
function dateText(value) {
  return `${formatFullDate(value)} ${formatTime(value)}`
}
</script>

<template>
  <div class="space-y-3 px-5 pt-4 pb-5">
    <!-- 新增交辦的頁面還沒做，先連到佔位頁 -->
    <Button as-child class="w-full">
      <RouterLink to="/committee/tasks/new"><PlusIcon />新增交辦</RouterLink>
    </Button>
    <FilterSelect v-model="status" label="狀態" :options="STATUS_FILTERS" />

    <template v-if="loading">
      <Skeleton v-for="n in 3" :key="n" class="h-[180px] rounded-xl" />
    </template>
    <template v-else>
      <div>
        <h2 class="type-card-title text-foreground">共 {{ openCount }} 件未結案</h2>
        <p class="type-date text-muted-foreground">依到期日由近至遠排列</p>
      </div>
      <!-- 沒有任何交辦，或是選的狀態剛好沒有 -->
      <div v-if="!shownTasks.length" class="rounded-xl bg-card p-4 shadow-card">
        <p class="type-body text-muted-foreground">{{ status === 'all' ? '目前沒有交辦事項' : '沒有這個狀態的交辦' }}</p>
      </div>
      <!-- 交辦卡：Kit 沒有這個元件，只有這頁用，先直接寫在頁面裡 -->
      <!-- 整張卡是連結；確認完成、退回、撤回這些動作放在交辦詳情頁 -->
      <template v-else>
        <RouterLink
          v-for="task in shownTasks"
          :key="task.id"
          :to="`/committee/tasks/${task.id}`"
          class="block space-y-3 rounded-xl bg-card p-4 shadow-card"
        >
          <div class="flex items-center gap-1.5">
            <p class="min-w-0 flex-1 type-date text-muted-foreground">#{{ task.id }}</p>
            <Badge :variant="STATUS_VARIANTS[task.displayStatus]">{{ statusText(task) }}</Badge>
          </div>
          <h3 class="type-card-title text-foreground">{{ task.title }}</h3>
          <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt class="type-body text-muted-foreground">指派對象</dt>
            <dd class="type-body text-foreground">{{ task.assigneeLabel }}</dd>
            <dt class="type-body text-muted-foreground">完成期限</dt>
            <dd class="type-body text-foreground">{{ dateText(task.deadline) }}</dd>
          </dl>
          <p v-if="task.report" class="type-date text-muted-foreground">對方已於 {{ formatFullDate(task.report.at) }} 回報完成</p>
          <!-- 只是提示「可以點」，整張卡本身就是連結 -->
          <p class="flex items-center justify-end gap-1 type-link text-foreground">
            查看詳情
            <ChevronRightIcon class="size-4" />
          </p>
        </RouterLink>
      </template>
    </template>
  </div>
</template>
