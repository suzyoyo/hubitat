<script setup>
// 管委會端、管理人員端共用・案件詳情：一件案件的基本資料、通報內容、廠商、處理紀錄（設計稿 1134:17558）
// 按鈕依「這個人能做什麼＋案件狀態」顯示，不分哪一端（規則見 docs/case-flow.md）：
//   問題分類、關聯設備、廠商、處理紀錄四張卡片：欄位直接顯示，邊填邊記下來（2026-10-15 拿掉「取消」「確定」），
//   按底部「更新進度」才一起存，而且只寫一筆紀錄（updateCase）
//   底部：更新進度＋完工驗收（到回報完成頁）並排；受理（按了就受理）、交辦（到新增交辦頁）、
//   結案（到結案頁）依狀態出現。發布公告從「＋」選單進去，這裡不放
//   沒有「撤回通報」：2026-10-15 和 013 決定拿掉撤回，不需要處理的通報由處理的人完工驗收時寫明原因結案
import { ChevronRightIcon } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { caseStatusBadge } from '@/components/admin/caseStatusBadge'
import BottomCta from '@/components/app/BottomCta.vue'
import CaseCategoryPicker from '@/components/case/CaseCategoryPicker.vue'
import CaseEquipmentPicker from '@/components/case/CaseEquipmentPicker.vue'
import CaseFileGrid from '@/components/case/CaseFileGrid.vue'
import CaseLogForm from '@/components/case/CaseLogForm.vue'
import CaseVendorPicker from '@/components/case/CaseVendorPicker.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { formatFullDate, formatTime } from '@/lib/date'
import {
  acceptCase,
  canAssignTasks,
  canCloseCases,
  canHandleCases,
  getCaseById,
  getCurrentUser,
  getEquipmentList,
  getTaskById,
  getVendors,
  markToCloseNotificationRead,
  returnCase,
  updateCase,
  withdrawTask,
} from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// 網址是 /committee/cases/:id 或 /staff/cases/:id，所以 route.params.id 就是案件編號
// 管理人員端的設計稿內容和管委會一樣，只有底部按鈕不同（Figma 1484:15491）；route.meta.roleId 是目前在哪一端
const route = useRoute()
const router = useRouter()
// 廠商詳細只有管委會端有頁面，管理人員端先不放「查看廠商」（設備詳情兩端都有，「查看設備」都放）
const showDetailLinks = route.meta.roleId === 'committee'

const loading = ref(true)
// 這一件案件；編號不存在時，假 API 會回傳 undefined
const item = ref(null)
const userId = ref('') // 我是誰（看目前在哪一端）
const vendors = ref([]) // 選廠商時的清單：合作中的廠商
const devices = ref([]) // 選設備時的清單：設備清冊（已報廢的不列）
const pending = ref(false) // 送出還在路上
const openTask = ref(null) // 這件案件還沒完成的交辦（進行中或待確認）；沒有就是 null
// 寫原因的彈窗：退回案件（待結案）和撤回交辦共用一個；reasonMode 是 'return' 或 'withdraw'
const reasonOpen = ref(false)
const reasonMode = ref('return')
const reason = ref('') // 原因（必填）
const REASON_MAX = 200 // 原因最多幾個字
// 卡片裡按「確定」記下來、還沒存的內容；按「更新進度」後清掉
const categoryDraft = ref('') // 問題分類，例如 'leak'
const equipmentDraft = ref(null) // { equipmentId, name, place }
const vendorDraft = ref(null) // { vendorId, vendorName, scheduledAt }
const logDraft = ref(null) // { text, residentText, scheduledAt }

// 拿這一頁要的資料：我是誰、這件案件、可以選的設備和廠商
async function load() {
  if (!route.params.id) return // 正要離開這一頁（換到沒有案件編號的網址），不用拿
  loading.value = true
  const user = await getCurrentUser(route.meta.roleId)
  userId.value = user.id
  const [data, vendorList, deviceList] = await Promise.all([
    getCaseById(route.params.id),
    getVendors('active'),
    getEquipmentList(route.meta.roleId),
  ])
  item.value = data
  vendors.value = vendorList
  openTask.value = data?.openTaskId ? await getTaskById(data.openTaskId) : null
  // 主委、副主委打開待結案的案件：「案件待結案」通知就算看過（待辦不再把它排最前面）
  if (data?.status === 'to_verify' && canCloseCases(user.id)) markToCloseNotificationRead(user.id, data.id)
  devices.value = deviceList.filter((device) => device.status !== 'retired')
  loading.value = false
}
// 一打開就拿（immediate），之後網址換到另一件案件時也重新拿
//   從一件案件連到另一件時，Vue 會沿用同一個頁面，不會重新跑一次，所以要自己看網址有沒有變
watch(() => route.params.id, load, { immediate: true })

// ── 這個人能做什麼 ──────────────────────────────────────
const canHandle = computed(() => canHandleCases(userId.value)) // 主委、副主委、管理人員
// 已受理、處理中才能選設備和廠商（處理中可以換）
const canPickVendor = computed(() => canHandle.value && ['accepted', 'in_progress'].includes(item.value?.status))
// 主委、副主委看待結案的案件：只做審核（退回或確認結案），不寫處理紀錄（2026-10-16）
const isReviewing = computed(() => item.value?.status === 'to_verify' && canCloseCases(userId.value))
// 受理之後、結案之前都能寫處理紀錄（審核中的主委、副主委除外）
const canAddLog = computed(
  () => canHandle.value && !isReviewing.value && ['accepted', 'in_progress', 'to_verify'].includes(item.value?.status),
)

// 底部的按鈕；main 是主要動作（藍底），其他是次要動作
const actions = computed(() => {
  const data = item.value
  const list = []
  if (data.status === 'pending' && canHandle.value) list.push({ key: 'accept', label: '受理', main: true })
  if (['accepted', 'in_progress'].includes(data.status) && canAssignTasks(userId.value) && !data.openTaskId) {
    list.push({ key: 'assign', label: '交辦' })
  }
  // 已受理也可以完工驗收：管理人員自己就修好的，不一定要派廠商
  //   管委會端交辦出去之後，交給被交辦的人完工驗收，這裡不放（2026-10-16）；交辦的人看到的是「撤回交辦」
  const delegated = route.meta.roleId === 'committee' && openTask.value?.status === 'in_progress'
  if (['accepted', 'in_progress'].includes(data.status) && canHandle.value && !delegated) {
    list.push({ key: 'complete', label: '完工驗收', main: true })
  }
  if (delegated && openTask.value.assignerId === userId.value) list.push({ key: 'withdraw', label: '撤回交辦' })
  // 待結案：主委、副主委都可以審核，不管是誰受理的（2026-10-15 改，原本只有負責人）
  //   左「退回」跳彈窗寫原因；右「確認結案」到結案頁填費用、結案說明（2026-10-16）
  if (isReviewing.value) {
    list.push({ key: 'return', label: '退回' })
    list.push({ key: 'close', label: '確認結案', main: true })
  }
  return list
})
// 「更新進度」：能選廠商或寫紀錄的時候才出現；有記下來的內容才能按
const canUpdate = computed(() => canPickVendor.value || canAddLog.value)
const hasDraft = computed(() => Boolean(categoryDraft.value || equipmentDraft.value || vendorDraft.value || logDraft.value))
// 已經存好的廠商：帶入選廠商的欄位；不能改的人直接看文字
const shownVendor = computed(() => ({ name: item.value?.vendorName ?? '', scheduledAt: item.value?.scheduledAt ?? '' }))
const hasBottom = computed(() => !loading.value && item.value && (actions.value.length > 0 || canUpdate.value))

// 交辦放上面一排；其他（受理、完工驗收、結案）和「更新進度」並排在下面
const topActions = computed(() => actions.value.filter((action) => action.key === 'assign'))
const mainActions = computed(() => actions.value.filter((action) => action.key !== 'assign'))

function runAction(action) {
  const base = `/${route.meta.roleId}`
  if (action.key === 'accept') accept()
  if (action.key === 'complete') goComplete()
  // 交辦、結案到另一頁做（新增交辦頁、結案頁是 013 做的）；交辦只有主委、副主委看得到，所以一定是管委會端
  if (action.key === 'assign') router.push(`/committee/tasks/new?caseId=${item.value.id}`)
  if (action.key === 'close') router.push(`${base}/cases/${item.value.id}/close`)
  if (action.key === 'return' || action.key === 'withdraw') openReason(action.key)
}

function openReason(mode) {
  reasonMode.value = mode
  reason.value = ''
  reasonOpen.value = true
}

// 彈窗的文字：退回案件、撤回交辦各一套
const reasonText = computed(() => {
  const who = reasonMode.value === 'withdraw' ? openTask.value?.assigneeLabel : item.value?.handlerLabel
  return reasonMode.value === 'withdraw'
    ? { title: '撤回交辦？', note: `撤回後${who || '對方'}不用再處理，會通知對方。`, label: '撤回原因', button: '確認撤回' }
    : { title: '退回給管理人員？', note: `案件會回到「處理中」，請${who || '管理人員'}再處理一次。`, label: '退回原因', button: '確認退回' }
})

function submitReason() {
  if (reasonMode.value === 'withdraw') withdraw()
  else sendBack()
}

// 撤回交辦：交辦變成已撤回，負責人換回受理的人，底部又會出現「交辦」「完工驗收」
async function withdraw() {
  pending.value = true
  const ok = await withdrawTask(openTask.value.id, userId.value, reason.value.trim())
  pending.value = false
  if (!ok) {
    toast.error('沒有撤回成功', { description: '交辦的狀態可能已經改變，請重新整理' })
    return
  }
  const who = openTask.value.assigneeLabel
  reasonOpen.value = false
  toast.success('已撤回交辦', { description: who ? `已通知${who}` : '' })
  await load()
}

// 退回：案件回到處理中，交辦對象（沒有交辦就是完工驗收的人）會收到通知（case-flow 4-6b）
async function sendBack() {
  pending.value = true
  const result = await returnCase(item.value.id, userId.value, reason.value)
  pending.value = false
  if (!result) {
    toast.error('沒有退回成功', { description: '案件的狀態可能已經改變，請重新整理' })
    return
  }
  item.value = result
  openTask.value = result.openTaskId ? await getTaskById(result.openTaskId) : null
  reasonOpen.value = false
  toast.success('已退回', { description: `已通知${result.handlerLabel || '管理人員'}再處理` })
}

// 受理：按了就受理，受理的人是負責人（分類受理後在「問題分類」卡片改；處理期限不用填，用交辦的完成期限）
async function accept() {
  pending.value = true
  const result = await acceptCase(item.value.id, userId.value)
  pending.value = false
  if (!result) {
    toast.error('沒有受理成功', { description: '可能已經有人受理了，請重新整理' })
    return
  }
  item.value = result
  toast.success('已受理', { description: '接著可以選設備、派廠商' })
}

// 完工驗收：到回報完成頁。有記下來還沒存的，先幫他存好，才不會弄丟
async function goComplete() {
  if (hasDraft.value && !(await updateStatus())) return
  router.push(`/${route.meta.roleId}/cases/${item.value.id}/complete`)
}

// ── 更新進度：把卡片裡記下來的分類、設備、廠商、處理紀錄一起存，只寫一筆紀錄 ─────────────
// 成功回傳 true，失敗回傳 false（完工驗收要先存好才換頁）
async function updateStatus() {
  pending.value = true
  const result = await updateCase(item.value.id, userId.value, {
    category: categoryDraft.value,
    equipmentId: equipmentDraft.value?.equipmentId,
    vendor: vendorDraft.value,
    log: logDraft.value,
  })
  if (!result) return failUpdate()
  pending.value = false
  item.value = result
  categoryDraft.value = ''
  equipmentDraft.value = null
  vendorDraft.value = null
  logDraft.value = null
  toast.success('已更新進度')
  return true
}

function failUpdate() {
  pending.value = false
  toast.error('沒有更新成功', { description: '請重新整理後再試一次' })
  return false
}

const statusBadge = computed(() => caseStatusBadge(item.value))

// '2026-09-25T10:12' → '2026/09/25 10:12'（管委會端的日期有年份）
function dateTimeText(value) {
  return `${formatFullDate(value)} ${formatTime(value)}`
}

// 第一張卡下面的資訊列：label 是左邊的標籤，value 是右邊的內容
const basicRows = computed(() => {
  const data = item.value
  // 處理期限：交辦的完成期限（假 API 算好的，2026-10-18）；沒有交辦就是「尚未設定」，也不會逾期
  let deadline = '尚未設定'
  if (data.deadline) {
    deadline = formatFullDate(data.deadline)
    if (data.isOverdue) deadline += `（已逾期 ${data.overdueDays} 天）`
  }
  return [
    // 負責人：實際處理的人（交辦出去就是交辦對象，case-flow 第 3 節），不是資料上受理的人
    { label: '負責人', value: data.handlerLabel || '尚未指派' },
    { label: '附議', value: data.supporterCount ? `${data.supporterCount} 戶` : '無' },
    { label: '處理期限', value: deadline },
    { label: '問題分類', value: data.categoryLabel },
  ]
})

</script>

<template>
  <!-- 有底部按鈕時多留空間，最下面的卡片才不會被蓋住 -->
  <div class="space-y-4 px-5 pt-4" :class="hasBottom ? 'pb-44' : 'pb-5'">
    <template v-if="loading">
      <Skeleton class="h-[208px] rounded-xl" />
      <Skeleton class="h-[137px] rounded-xl" />
      <Skeleton class="h-[200px] rounded-xl" />
    </template>

    <!-- 找不到這件案件 -->
    <Empty v-else-if="!item" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這件案件</EmptyTitle>
      <EmptyDescription class="type-body">可能已經刪除，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink :to="`/${route.meta.roleId}/cases`">回到案件列表</RouterLink>
      </Button>
    </Empty>

    <template v-else>
      <!-- 基本資料 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="space-y-1">
          <h2 class="type-card-title text-foreground">{{ item.title }}</h2>
          <p class="type-date text-muted-foreground">#{{ item.id }}</p>
        </div>
        <div class="flex items-center justify-between gap-2">
          <Badge variant="outline">{{ item.areaName }}</Badge>
          <Badge :variant="statusBadge.variant">{{ statusBadge.text }}</Badge>
        </div>
        <div v-for="row in basicRows" :key="row.label" class="flex items-baseline gap-3">
          <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
          <p class="min-w-0 flex-1 text-right type-body-strong text-foreground">{{ row.value }}</p>
        </div>
      </section>

      <!-- 通報人寫的描述 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">住戶通報描述</h2>
        <p class="type-body text-muted-foreground">{{ item.description ? `「${item.description}」` : '沒有填寫' }}</p>
      </section>

      <!-- 現場照片／影片：一格一個（case/CaseFileGrid）；假資料只有檔名的顯示圖示和檔名 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">現場照片／影片</h2>
        <CaseFileGrid v-if="item.photos.length" :files="item.photos" title="現場照片" />
        <p v-else class="type-body text-muted-foreground">沒有照片或影片</p>
      </section>

      <!-- 問題分類：可以選廠商的時候（已受理、處理中）才出現，2026-10-17 加
           不能改的人看上面基本資料的「問題分類」就好，這裡不重複顯示 -->
      <section v-if="canPickVendor" class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">問題分類</h2>
        <CaseCategoryPicker v-model:draft="categoryDraft" :current="item.category" />
      </section>

      <!-- 關聯設備：選了，結案時才會記進這台設備的維修紀錄
           可以選的時候直接顯示選設備的欄位（2026-10-15 改，拿掉灰色區塊和「選擇設備 ›」按鈕）；不能選的只看文字 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">關聯設備</h2>
        <CaseEquipmentPicker
          v-if="canPickVendor"
          v-model:draft="equipmentDraft"
          :devices="devices"
          :current="{ name: item.equipmentName, place: item.equipmentPlace }"
        />
        <!-- 「查看設備」靠右，和左邊文字的最下排對齊（2026-10-16）；已經存好的設備才有連結
             可以點的範圍用 before 往上下各補 12px，超過 44px -->
        <div v-else class="flex items-end justify-between gap-3">
          <div class="min-w-0 space-y-0.5">
            <p class="type-body-strong text-foreground">{{ item.equipmentName || '尚未關聯設備' }}</p>
            <p v-if="item.equipmentName" class="type-date text-muted-foreground">{{ item.equipmentPlace }}</p>
          </div>
          <RouterLink
            v-if="item.equipmentId"
            :to="`/${route.meta.roleId}/equipment/${item.equipmentId}`"
            class="relative flex shrink-0 items-center gap-1 type-link text-foreground before:absolute before:inset-x-0 before:-inset-y-3"
          >
            查看設備
            <ChevronRightIcon class="size-4" />
          </RouterLink>
        </div>
      </section>

      <!-- 廠商 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">廠商</h2>
        <!-- 可以派廠商的時候直接顯示欄位（欄位裡已經帶入存好的廠商和預約時間，2026-10-15 拿掉灰底區塊）；
             不能改的只看文字 -->
        <CaseVendorPicker v-if="canPickVendor" v-model:draft="vendorDraft" :vendors="vendors" :current="shownVendor" />
        <!-- 「查看廠商」靠右，和左邊文字的最下排對齊；名冊裡的廠商才有詳細頁，自己打名字的（沒有 vendorId）沒有連結 -->
        <div v-else class="flex items-end justify-between gap-3">
          <div class="min-w-0 space-y-0.5">
            <p class="type-body-strong text-foreground">{{ shownVendor.name || '尚未派廠商' }}</p>
            <p v-if="shownVendor.scheduledAt" class="type-date text-muted-foreground">
              預約 {{ dateTimeText(shownVendor.scheduledAt) }} 到場
            </p>
          </div>
          <RouterLink
            v-if="showDetailLinks && item.vendorId"
            :to="`/committee/vendors/${item.vendorId}`"
            class="relative flex shrink-0 items-center gap-1 type-link text-foreground before:absolute before:inset-x-0 before:-inset-y-3"
          >
            查看廠商
            <ChevronRightIcon class="size-4" />
          </RouterLink>
        </div>
      </section>

      <!-- 處理進度與留痕：由舊到新 -->
      <section class="space-y-3.5 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">處理進度與留痕</h2>
        <template v-for="(log, index) in item.logs" :key="`${log.at}-${index}`">
          <Separator v-if="index > 0" />
          <div class="flex gap-3">
            <p class="w-[88px] shrink-0 type-date text-muted-foreground">{{ dateTimeText(log.at) }}</p>
            <div class="min-w-0 flex-1 space-y-0.5">
              <p class="type-body-strong text-foreground">{{ log.label }}</p>
              <!-- whitespace-pre-line：「更新進度」一項一行（內容裡的換行照樣換行） -->
              <p class="type-body whitespace-pre-line text-muted-foreground">{{ log.text }}</p>
              <!-- 備註小字（例如住戶修改通報時，改完的內容）：和住戶端的處理進度一樣（ReportRecord），
                   type-note 14px 灰色；whitespace-pre-line 讓兩項都改時一項一行 -->
              <p v-if="log.note" class="type-note whitespace-pre-line text-muted-foreground">{{ log.note }}</p>
              <!-- 附上留存的照片（快速留存歸到這件案件時，2026-10-18） -->
              <CaseFileGrid v-if="log.files?.length" :files="log.files" :title="log.label" class="pt-2" />
            </div>
          </div>
        </template>
        <CaseLogForm v-if="canAddLog" v-model:draft="logDraft" />
      </section>

      <!-- 完工紀錄：完工了才有 -->
      <section v-if="item.completion" class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">完工紀錄</h2>
        <p class="type-date text-muted-foreground">{{ dateTimeText(item.completion.at) }}</p>
        <p class="type-body text-foreground">{{ item.completion.note }}</p>
        <!-- 附件直接顯示（2026-10-18 013）：和現場照片一樣一格一個，有照片的點了全螢幕看 -->
        <CaseFileGrid v-if="item.completion.photos.length" :files="item.completion.photos" title="完工紀錄" />
      </section>


    </template>

    <!-- 底部按鈕：上面一排是更新進度，下面一排是依狀態出現的動作（排法照設計稿 1134:17558，
         設計稿上面那排原本是「發布社區公告」，2026-10-15 改成更新現況、再改名叫更新進度） -->
    <BottomCta v-if="hasBottom" vertical>
      <!-- 上面一排：交辦（主委、副主委、還沒交辦時才有） -->
      <Button v-for="action in topActions" :key="action.key" variant="outline" @click="runAction(action)">
        {{ action.label }}
      </Button>
      <!-- 下面一排：動作（完工驗收、結案…）在左、更新進度在右（2026-10-15 013 改）
           顏色不跟著換：右邊那顆是主要的藍色；有更新進度時，左邊的動作用次要的淺藍 -->
      <div v-if="canUpdate || mainActions.length" class="flex gap-3 *:flex-1">
        <Button
          v-for="action in mainActions"
          :key="action.key"
          :variant="canUpdate ? 'secondary' : action.main ? 'default' : 'outline'"
          :disabled="pending"
          @click="runAction(action)"
        >
          {{ action.label }}
        </Button>
        <Button v-if="canUpdate" :disabled="!hasDraft || pending" @click="updateStatus">更新進度</Button>
      </div>
    </BottomCta>

    <!-- 寫原因的彈窗：退回案件、撤回交辦共用；原因必填，寫法和交辦詳情的彈窗一樣 -->
    <Dialog v-model:open="reasonOpen">
      <DialogContent v-if="item" :show-close-button="false" class="gap-3.5 p-5">
        <!-- 結尾的 ! 是「一定要用這個」：DialogTitle 本身有預設的字級，要蓋過它 -->
        <DialogTitle class="type-card-title!">{{ reasonText.title }}</DialogTitle>
        <DialogDescription class="type-body!">{{ reasonText.note }}</DialogDescription>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <!-- 必填只用紅色星號（dev-guide 第 5 節「表單」） -->
            <Label for="case-reason" class="text-base">{{ reasonText.label }}<span class="text-destructive">*</span></Label>
            <p class="type-date text-muted-foreground">{{ reason.length }} / {{ REASON_MAX }} 字</p>
          </div>
          <Textarea id="case-reason" v-model="reason" :maxlength="REASON_MAX" class="min-h-[100px]" />
        </div>
        <div class="flex gap-3">
          <DialogClose as-child>
            <Button variant="outline" class="flex-1">取消</Button>
          </DialogClose>
          <Button class="flex-1" :disabled="pending || !reason.trim()" @click="submitReason">{{ reasonText.button }}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
