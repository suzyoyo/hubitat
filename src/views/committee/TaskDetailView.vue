<script setup>
// 管委會端、管理人員端共用・交辦詳情：一件交辦的內容、期限和處理紀錄
//   交辦人看到「確認完成、退回、撤回」；被交辦的人（例如管理人員）看到「回報完成」（之後加）
//   設計稿沒有這一頁，版型借用管委會端的公告詳情（node 1134:17718）
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomCta from '@/components/app/BottomCta.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { formatFullDate, formatTime } from '@/lib/date'
import { taskStatusBadge } from '@/lib/task'
import {
  MOCK_NOW,
  confirmTask,
  getCurrentUser,
  getTaskById,
  markNewTaskNotificationRead,
  returnTask,
  withdrawTask,
} from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// 網址是 /committee/tasks/:id 或 /staff/tasks/:id，所以 route.params.id 就是這件交辦的編號
// route.meta.roleId 是目前在哪一端，用來決定「我是誰」
const route = useRoute()

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 這一件交辦。編號不存在時，假 API 會回傳 undefined
const task = ref(null)
const userId = ref('') // 我是誰，按按鈕時要用

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const [user, item] = await Promise.all([getCurrentUser(route.meta.roleId), getTaskById(route.params.id)])
  userId.value = user.id
  task.value = item
  loading.value = false
  // 被交辦的人打開了，「新的交辦」通知就算看過（待辦不再把它排最前面）；其他通知不動
  if (item?.assigneeId === user.id) markNewTaskNotificationRead(user.id, route.meta.roleId, item.id)
})

const statusBadge = computed(() => taskStatusBadge(task.value))

// 底部要放哪些按鈕：只有交辦人看得到
//   待確認 → 退回說明、確認完成；進行中（含已逾期）→ 撤回交辦；已完成、已撤回 → 沒有按鈕
const isMine = computed(() => task.value?.assignerId === userId.value)
const canConfirm = computed(() => isMine.value && task.value.status === 'reported')
const canWithdraw = computed(() => isMine.value && task.value.status === 'in_progress')

// pending：動作還在路上時是 true，按鈕先不能按，避免連按兩次
const pending = ref(false)

// 動作做完後重新拿一次資料，畫面上的狀態和處理紀錄才會更新
async function reload() {
  task.value = await getTaskById(route.params.id)
}

// 確認完成：不用填東西，直接確認
async function confirm() {
  pending.value = true
  const ok = await confirmTask(task.value.id, userId.value)
  pending.value = false
  if (!ok) {
    toast.error('確認失敗', { description: '這件交辦的狀態已經變了，請重新整理。' })
    return
  }
  toast.success('已確認完成')
  await reload()
}

// ── 退回、撤回的彈窗 ─────────────────────────────
// 兩個彈窗長得差不多（都要填原因），所以共用一個，用 dialogMode 切換
//   'return' 退回說明 / 'withdraw' 撤回交辦
const dialogOpen = ref(false)
const dialogMode = ref('return')
// 原因最多幾個字（和交辦內容一樣）
const REASON_MAX = 200
const reason = ref('')
// 新的完成期限，格式和資料一樣：'2026-10-05T18:00'
const newDeadline = ref('')

// 原本的期限是不是已經過了；過了的話，退回時一定要給新期限，不然對方一被退回就逾期
// 沒有期限的不算過了（期限是選填）
const deadlinePassed = computed(() => Boolean(task.value.deadline) && task.value.deadline <= MOCK_NOW)

function openDialog(mode) {
  dialogMode.value = mode
  // 每次打開都清掉上次填的
  reason.value = ''
  newDeadline.value = ''
  dialogOpen.value = true
}

// 「確認」按鈕能不能按：原因必填；退回時期限已過，新期限也必填
const canSubmit = computed(() => {
  if (!reason.value.trim() || pending.value) return false
  if (dialogMode.value === 'return' && deadlinePassed.value && !newDeadline.value) return false
  return true
})

async function submitDialog() {
  pending.value = true
  const text = reason.value.trim()
  const ok =
    dialogMode.value === 'return'
      ? await returnTask(task.value.id, userId.value, text, newDeadline.value)
      : await withdrawTask(task.value.id, userId.value, text)
  pending.value = false
  dialogOpen.value = false
  const action = dialogMode.value === 'return' ? '退回' : '撤回'
  if (!ok) {
    toast.error(`${action}失敗`, { description: '這件交辦的狀態已經變了，請重新整理。' })
    return
  }
  toast.success(`已${action}，已通知 ${task.value.assigneeLabel}`)
  await reload()
}

// '2026-09-30T18:00' → '2026/09/30 18:00'（管委會端的日期有年份）
function dateText(value) {
  if (!value) return '未設定' // 完成期限是選填，沒有期限的交辦（2026-10-15）
  return `${formatFullDate(value)} ${formatTime(value)}`
}

// 第一張卡下面的資訊列：label 是左邊的標籤，value 是右邊的內容
const basicRows = computed(() => {
  const item = task.value
  const rows = [
    { label: '指派對象', value: item.assigneeLabel },
    { label: '完成期限', value: dateText(item.deadline) },
    { label: '交辦時間', value: dateText(item.createdAt) },
  ]
  // 有關聯案件才顯示
  if (item.caseTitle) rows.push({ label: '關聯案件', value: item.caseTitle })
  return rows
})

// 處理紀錄：對方回報、我退回、我確認、我撤回，有發生過的才列出來，新的在上面
//   at 只用來排序，畫面上不會顯示
const recordRows = computed(() => {
  const item = task.value
  const rows = []
  if (item.report) {
    const note = item.report.note ? `\n${item.report.note}` : ''
    const files = item.report.files?.length ? `\n附件：${item.report.files.join('、')}` : ''
    rows.push({ label: '回報完成', at: item.report.at, value: `${dateText(item.report.at)}${note}${files}` })
  }
  if (item.returnNote) {
    const { at, note } = item.returnNote
    rows.push({ label: '退回', at, value: `${dateText(at)}\n原因：${note}` })
  }
  if (item.doneAt) rows.push({ label: '確認完成', at: item.doneAt, value: dateText(item.doneAt) })
  if (item.withdrawReason) {
    const { at, note } = item.withdrawReason
    rows.push({ label: '撤回', at, value: `${dateText(at)}\n原因：${note}` })
  }
  // 先由舊到新排，再整個倒過來。時間一樣時（假資料的「現在」是固定的），後發生的會排在上面
  return rows.toSorted((a, b) => a.at.localeCompare(b.at)).reverse()
})
</script>

<template>
  <!-- 有按鈕時底部有固定的按鈕區，pb-24 留空間給它，內容才不會被蓋住 -->
  <div class="space-y-4 px-5 pt-4" :class="canConfirm || canWithdraw ? 'pb-24' : 'pb-5'">
    <!-- 載入中：三個和卡片差不多高的灰色方塊 -->
    <template v-if="loading">
      <Skeleton class="h-[200px] rounded-xl" />
      <Skeleton class="h-[120px] rounded-xl" />
      <Skeleton class="h-[150px] rounded-xl" />
    </template>

    <!-- 找不到這件交辦 -->
    <Empty v-else-if="!task" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這件交辦</EmptyTitle>
      <EmptyDescription class="type-body">可能已經刪除，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <!-- 管理人員端沒有交辦列表，回首頁 -->
        <RouterLink :to="route.meta.roleId === 'staff' ? '/staff/home' : '/committee/tasks'">
          {{ route.meta.roleId === 'staff' ? '回到首頁' : '回到交辦進度' }}
        </RouterLink>
      </Button>
    </Empty>

    <!-- 有資料 -->
    <template v-else>
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-center gap-1.5">
          <p class="min-w-0 flex-1 type-date text-muted-foreground">#{{ task.id }}</p>
          <Badge :variant="statusBadge.variant">{{ statusBadge.text }}</Badge>
        </div>
        <h2 class="type-card-title text-foreground">{{ task.title }}</h2>
        <Separator />
        <div v-for="row in basicRows" :key="row.label" class="flex items-baseline gap-3">
          <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
          <p class="min-w-0 flex-1 text-right type-body-strong text-foreground">{{ row.value }}</p>
        </div>
      </section>

      <section class="space-y-3.5 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">交辦內容</h2>
        <!-- 交辦內容是選填（2026-10-15），沒寫的顯示灰色「沒有填寫」 -->
        <p v-if="task.content" class="type-body text-foreground">{{ task.content }}</p>
        <p v-else class="type-body text-muted-foreground">沒有填寫</p>
      </section>

      <!-- 還沒有任何回報、退回、確認、撤回時，整張不顯示 -->
      <section v-if="recordRows.length" class="space-y-3.5 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">處理紀錄</h2>
        <div v-for="row in recordRows" :key="row.label" class="flex items-baseline gap-3">
          <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
          <!-- whitespace-pre-line：值裡的 \n 會換行 -->
          <p class="min-w-0 flex-1 text-right whitespace-pre-line type-body-strong text-foreground">{{ row.value }}</p>
        </div>
      </section>

      <BottomCta v-if="canConfirm">
        <Button variant="outline" :disabled="pending" @click="openDialog('return')">退回說明</Button>
        <Button :disabled="pending" @click="confirm">確認完成</Button>
      </BottomCta>
      <BottomCta v-else-if="canWithdraw">
        <Button variant="outline" :disabled="pending" @click="openDialog('withdraw')">撤回交辦</Button>
      </BottomCta>

      <!-- 退回、撤回的彈窗：平常看不到，dialogOpen 變成 true 才會出現 -->
      <Dialog v-model:open="dialogOpen">
        <!-- 沒有右上角的叉叉，用「取消」關閉；點彈窗外面也可以關（和撤回通報的彈窗一樣） -->
        <DialogContent :show-close-button="false" class="gap-3.5 p-5">
          <!-- 結尾的 ! 是「一定要用這個」：DialogTitle 本身有預設的字級，要蓋過它 -->
          <DialogTitle class="type-card-title!">
            {{ dialogMode === 'return' ? '退回這件交辦？' : '撤回這件交辦？' }}
          </DialogTitle>
          <DialogDescription class="type-body!">
            <template v-if="dialogMode === 'return'">會通知 {{ task.assigneeLabel }}，這件交辦會回到對方的待辦。</template>
            <template v-else>撤回後對方不用再處理，無法復原。會通知 {{ task.assigneeLabel }}。</template>
          </DialogDescription>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <!-- 必填只用紅色星號（dev-guide 第 5 節「表單」） -->
              <Label for="task-reason" class="text-base">
                {{ dialogMode === 'return' ? '退回原因' : '撤回原因' }}<span class="text-destructive">*</span>
              </Label>
              <p class="type-date text-muted-foreground">{{ reason.length }} / {{ REASON_MAX }} 字</p>
            </div>
            <Textarea id="task-reason" v-model="reason" :maxlength="REASON_MAX" class="min-h-[100px]" />
          </div>

          <!-- 退回時可以給新的期限；原本的期限已經過了就一定要給 -->
          <div v-if="dialogMode === 'return'" class="space-y-2">
            <Label for="task-deadline" class="text-base">
              新的完成期限
              <span v-if="deadlinePassed" class="text-destructive">*</span>
              <span v-else class="type-date text-muted-foreground">選填</span>
            </Label>
            <!-- datetime-local：手機會跳出選日期和時間的轉盤；min 讓使用者選不到比現在早的時間 -->
            <Input id="task-deadline" v-model="newDeadline" type="datetime-local" :min="MOCK_NOW" />
            <p class="type-date text-muted-foreground">原本的期限：{{ dateText(task.deadline) }}</p>
          </div>

          <div class="flex gap-3">
            <!-- DialogClose：包住的按鈕按下去就會關閉彈窗 -->
            <DialogClose as-child>
              <Button variant="outline" class="flex-1">取消</Button>
            </DialogClose>
            <Button
              :variant="dialogMode === 'return' ? 'default' : 'destructive'"
              class="flex-1"
              :disabled="!canSubmit"
              @click="submitDialog"
            >
              {{ dialogMode === 'return' ? '確認退回' : '確認撤回' }}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </template>
  </div>
</template>
