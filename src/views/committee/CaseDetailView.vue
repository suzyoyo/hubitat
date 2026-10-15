<script setup>
// 管委會端、管理人員端共用・案件詳情：一件案件的基本資料、通報內容、廠商、處理紀錄（設計稿 1134:17558）
// 按鈕依「這個人能做什麼＋案件狀態」顯示，不分哪一端（規則見 docs/case-flow.md）：
//   關聯設備、廠商、處理紀錄三張卡片：欄位直接顯示，邊填邊記下來（2026-10-15 拿掉「取消」「確定」），
//   按底部「更新進度」才一起存，而且只寫一筆紀錄（updateCase）
//   底部：更新進度＋完工驗收（到回報完成頁）並排；受理（按了就受理）、交辦（到新增交辦頁）、
//   結案（到結案頁）依狀態出現。發布公告從「＋」選單進去，這裡不放
//   沒有「撤回通報」：2026-10-15 和 013 決定拿掉撤回，不需要處理的通報由處理的人完工驗收時寫明原因結案
import { ImageIcon, VideoIcon } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { caseStatusBadge } from '@/components/admin/caseStatusBadge'
import BottomCta from '@/components/app/BottomCta.vue'
import CaseEquipmentPicker from '@/components/case/CaseEquipmentPicker.vue'
import CaseLogForm from '@/components/case/CaseLogForm.vue'
import CaseVendorPicker from '@/components/case/CaseVendorPicker.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate, formatTime } from '@/lib/date'
import {
  acceptCase,
  canAssignTasks,
  canCloseCases,
  canHandleCases,
  getCaseById,
  getCurrentUser,
  getEquipmentList,
  getVendors,
  updateCase,
} from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// 網址是 /committee/cases/:id 或 /staff/cases/:id，所以 route.params.id 就是案件編號
// 管理人員端的設計稿內容和管委會一樣，只有底部按鈕不同（Figma 1484:15491）；route.meta.roleId 是目前在哪一端
const route = useRoute()
const router = useRouter()

const loading = ref(true)
// 這一件案件；編號不存在時，假 API 會回傳 undefined
const item = ref(null)
const userId = ref('') // 我是誰（看目前在哪一端）
const vendors = ref([]) // 選廠商時的清單：合作中的廠商
const devices = ref([]) // 選設備時的清單：設備清冊（已報廢的不列）
const pending = ref(false) // 送出還在路上
// 卡片裡按「確定」記下來、還沒存的內容；按「更新進度」後清掉
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
// 受理之後、結案之前都能寫處理紀錄
const canAddLog = computed(() => canHandle.value && ['accepted', 'in_progress', 'to_verify'].includes(item.value?.status))

// 底部的按鈕；main 是主要動作（藍底），其他是次要動作
const actions = computed(() => {
  const data = item.value
  const list = []
  if (data.status === 'pending' && canHandle.value) list.push({ key: 'accept', label: '受理', main: true })
  if (['accepted', 'in_progress'].includes(data.status) && canAssignTasks(userId.value) && !data.openTaskId) {
    list.push({ key: 'assign', label: '交辦' })
  }
  // 已受理也可以完工驗收：管理人員自己就修好的，不一定要派廠商
  if (['accepted', 'in_progress'].includes(data.status) && canHandle.value) {
    list.push({ key: 'complete', label: '完工驗收', main: true })
  }
  // 結案：主委、副主委都可以，不管是誰受理的（2026-10-15 改，原本只有負責人）
  if (data.status === 'to_verify' && canCloseCases(userId.value)) list.push({ key: 'close', label: '結案', main: true })
  return list
})
// 「更新進度」：能選廠商或寫紀錄的時候才出現；有記下來的內容才能按
const canUpdate = computed(() => canPickVendor.value || canAddLog.value)
const hasDraft = computed(() => Boolean(equipmentDraft.value || vendorDraft.value || logDraft.value))
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
}

// 受理：按了就受理，受理的人是負責人（完成日期、分類之後再加地方填）
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

// ── 更新進度：把卡片裡記下來的設備、廠商、處理紀錄一起存，只寫一筆紀錄 ─────────────
// 成功回傳 true，失敗回傳 false（完工驗收要先存好才換頁）
async function updateStatus() {
  pending.value = true
  const result = await updateCase(item.value.id, userId.value, {
    equipmentId: equipmentDraft.value?.equipmentId,
    vendor: vendorDraft.value,
    log: logDraft.value,
  })
  if (!result) return failUpdate()
  pending.value = false
  item.value = result
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
  ]
})

// 看副檔名判斷是不是影片，例如 .mp4、.mov（和通報的照片格同一個規則）
function isVideo(name) {
  return /\.(mp4|mov|m4v|webm|avi)$/i.test(name)
}
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
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
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

      <!-- 現場照片／影片：假資料只有檔名，先顯示圖示和檔名 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">現場照片／影片</h2>
        <div v-if="item.photos.length" class="grid grid-cols-2 gap-3">
          <div
            v-for="name in item.photos"
            :key="name"
            class="flex h-[100px] flex-col items-center justify-center gap-1.5 rounded-lg bg-muted px-2"
          >
            <component :is="isVideo(name) ? VideoIcon : ImageIcon" class="size-7 text-muted-foreground" />
            <p class="w-full truncate text-center type-date text-muted-foreground">{{ name }}</p>
          </div>
        </div>
        <p v-else class="type-body text-muted-foreground">沒有照片或影片</p>
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
        <div v-else class="space-y-0.5">
          <p class="type-body-strong text-foreground">{{ item.equipmentName || '尚未關聯設備' }}</p>
          <p v-if="item.equipmentName" class="type-date text-muted-foreground">{{ item.equipmentPlace }}</p>
        </div>
      </section>

      <!-- 廠商 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">廠商履歷</h2>
        <!-- 可以派廠商的時候直接顯示欄位（欄位裡已經帶入存好的廠商和預約時間，2026-10-15 拿掉灰底區塊）；
             不能改的只看文字 -->
        <CaseVendorPicker v-if="canPickVendor" v-model:draft="vendorDraft" :vendors="vendors" :current="shownVendor" />
        <div v-else class="space-y-0.5">
          <p class="type-body-strong text-foreground">{{ shownVendor.name || '尚未派廠商' }}</p>
          <p v-if="shownVendor.scheduledAt" class="type-date text-muted-foreground">
            預約 {{ dateTimeText(shownVendor.scheduledAt) }} 到場
          </p>
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
        <p v-if="item.completion.photos.length" class="type-date text-muted-foreground">
          附 {{ item.completion.photos.length }} 個檔案
        </p>
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
  </div>
</template>
