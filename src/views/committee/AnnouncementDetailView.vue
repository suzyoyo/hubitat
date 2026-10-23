<script setup>
// 管委會端・公告詳情：一則公告的時間、地點、內容說明與發布紀錄
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomCta from '@/components/app/BottomCta.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate, formatTime } from '@/lib/date'
import {
  getAnnouncementById,
  getCurrentUser,
  restoreAnnouncement,
  withdrawAnnouncement,
} from '@/mocks/api'
import { ANNOUNCEMENT_STATUSES } from '@/mocks/data/announcements'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// useRoute()：取得目前路由的資訊
// 網址是 /committee/announcements/:id，所以 route.params.id 就是這則公告的編號
const route = useRoute()
// useRouter()：用來換頁（撤回後回到上一頁）
const router = useRouter()

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 這一則公告。編號不存在時，假 API 會回傳 undefined
const announcement = ref(null)
// 我是誰：假 API 要用來判斷我能不能修改、撤回
const userId = ref('')

// 拿這則公告；有傳 userId，回來的資料會多 canEdit、canWithdraw
async function reload() {
  announcement.value = await getAnnouncementById(route.params.id, 'committee', userId.value)
}

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('committee')
  userId.value = user.id
  await reload()
  loading.value = false
})

// ── 修改、撤回 ─────────────────────────────────────
// 底部的按鈕（誰、什麼狀態能按，由假 API 決定，見 docs/data-model.md 的公告）
//   已發布 → 修改公告、撤回公告；其他（包含已撤回）→ 沒有按鈕。已撤回的不能再改、不能重新發布
const hasActions = computed(() => announcement.value?.canEdit || announcement.value?.canWithdraw)
// 修改公告：和發布公告同一個表單
const editLink = computed(() => `/committee/announcements/${route.params.id}/edit`)

// pending：動作還在路上時是 true，按鈕先不能按，避免連按兩次
const pending = ref(false)
// 撤回確認彈窗是開還是關
const withdrawOpen = ref(false)
// 撤回原因（選填）
const withdrawReason = ref('')

function openWithdraw() {
  // 每次打開都清掉上次填的
  withdrawReason.value = ''
  withdrawOpen.value = true
}

async function submitWithdraw() {
  pending.value = true
  const id = announcement.value.id
  const ok = await withdrawAnnouncement(id, userId.value, withdrawReason.value.trim())
  pending.value = false
  withdrawOpen.value = false
  if (!ok) {
    toast.error('撤回失敗', { description: '這則公告的狀態已經變了，請重新整理。' })
    return
  }
  // 設計稿：toast 右邊有「復原」。多停幾秒（預設 4 秒），長輩才來得及按
  // toast 放在 App.vue，換頁後還會留著，所以回到上一頁也按得到「復原」
  toast.success('公告已撤回，已通知住戶', {
    duration: 8000,
    action: { label: '復原', onClick: () => restore(id) },
  })
  goBack()
}

// 撤回後回到上一頁（寫法和頂部列的返回鍵一樣）
// 直接打網址進來的沒有上一頁、或上一頁也是這則公告（例如剛修改完），就回管委會首頁
function goBack() {
  // history.state.back 是 Vue Router 記下來的「上一頁的網址」，沒有的話是 null
  const back = window.history.state?.back
  if (back && !back.startsWith(`/committee/announcements/${route.params.id}`)) {
    router.back()
  } else {
    router.replace('/committee/home')
  }
}

// 按 toast 上的「復原」：變回已發布，並回到這則公告，讓使用者看到它回來了
// 這時候已經離開詳情頁，所以公告編號由撤回時傳進來
async function restore(id) {
  const ok = await restoreAnnouncement(id, userId.value)
  if (!ok) {
    toast.error('復原失敗', { description: '這則公告的狀態已經變了，請重新整理。' })
    return
  }
  toast.success('已復原公告')
  router.push(`/committee/announcements/${id}`)
}

// 狀態徽章的顏色（dev-guide 第 5 節管理端的規則）
//   待補、已退回 → 橘：要發布的人動手
//   待審核       → 藍：流程進行中，在等審核的人
//   已發布、已撤回 → 灰：正常或已結束
const STATUS_BADGE_VARIANTS = {
  draft: 'secondary',
  rejected: 'secondary',
  pending: 'default',
  published: 'outline',
  withdrawn: 'outline',
}

// '2026-10-01T14:20' → '2026/10/01 14:20'
function fullDateTime(value) {
  return `${formatFullDate(value)} ${formatTime(value)}`
}

// 日期時間（照管委會設計稿，有年份）
//   一天：               '2026/10/12 09:00–12:00'
//   多天、有每日時段：   '2026/10/05～2026/10/07' 換行 '每日 09:00–17:00'
//   多天、沒有每日時段： '2026/09/28 18:00～' 換行 '2026/09/29 12:00'（頭尾的時間都要寫）
function dateText(item) {
  const startDate = item.startAt.split('T')[0]
  const endDate = item.endAt.split('T')[0]
  if (startDate === endDate) {
    return `${formatFullDate(startDate)} ${formatTime(item.startAt)}–${formatTime(item.endAt)}`
  }
  if (item.timeText) {
    return `${formatFullDate(startDate)}～${formatFullDate(endDate)}\n${item.timeText}`
  }
  return `${fullDateTime(item.startAt)}～\n${fullDateTime(item.endAt)}`
}

// 第一張卡下面的資訊列：label 是左邊的標籤，value 是右邊的內容
const basicRows = computed(() => [
  { label: '日期時間', value: dateText(announcement.value) },
  // 活動有地點就顯示地點，其他顯示影響範圍
  { label: '地點／影響範圍', value: announcement.value.place || announcement.value.scopeLabel },
  { label: '主辦／負責單位', value: announcement.value.organizer },
])

// 審核欄的文字（審核規則見 docs/data-model.md 的公告）
function reviewText(item) {
  if (item.status === 'draft') return '尚未送出審核'
  if (item.status === 'rejected') {
    return `${item.reviewerLabel} 退回\n${fullDateTime(item.rejectedAt)}\n原因：${item.rejectReason}`
  }
  if (item.reviewerLabel) return `${item.reviewerLabel} 審核通過`
  if (item.needsReview) return '待審核'
  return item.isUrgent ? '緊急公告，免審核' : '委員發布，免審核'
}

// 發布紀錄的資訊列；已撤回的公告多一列撤回紀錄
const publishRows = computed(() => {
  const item = announcement.value
  const rows = [
    { label: '發布者', value: item.authorLabel },
    { label: '發布時間', value: item.publishedAt ? fullDateTime(item.publishedAt) : '尚未發布' },
    { label: '審核', value: reviewText(item) },
  ]
  if (item.status === 'withdrawn') {
    // 撤回原因是選填，有寫才顯示
    const reason = item.withdrawReason ? `\n原因：${item.withdrawReason}` : ''
    rows.push({ label: '撤回', value: `${item.withdrawnByLabel}\n${fullDateTime(item.withdrawnAt)}${reason}` })
  }
  return rows
})
</script>

<template>
  <!-- 有按鈕時底部有固定的按鈕區，留空間給它，內容才不會被蓋住 -->
  <div class="space-y-4 px-5 pt-4" :class="hasActions ? 'pb-24' : 'pb-5'">
    <!-- 載入中：三個和卡片差不多高的灰色方塊 -->
    <template v-if="loading">
      <Skeleton class="h-[200px] rounded-xl" />
      <Skeleton class="h-[120px] rounded-xl" />
      <Skeleton class="h-[150px] rounded-xl" />
    </template>

    <!-- 找不到這則公告 -->
    <Empty v-else-if="!announcement" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這則公告</EmptyTitle>
      <EmptyDescription class="type-body">可能已經刪除，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink to="/committee/home">回到首頁</RouterLink>
      </Button>
    </Empty>

    <!-- 有資料 -->
    <template v-else>
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-center justify-between">
          <Badge variant="outline">{{ announcement.typeLabel }}</Badge>
          <Badge :variant="STATUS_BADGE_VARIANTS[announcement.status]">
            {{ ANNOUNCEMENT_STATUSES[announcement.status].label }}
          </Badge>
        </div>
        <h2 class="type-card-title text-foreground">{{ announcement.title }}</h2>
        <Separator />
        <div v-for="row in basicRows" :key="row.label" class="flex items-baseline gap-3">
          <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
          <!-- whitespace-pre-line：值裡的 \n 會換行 -->
          <p class="min-w-0 flex-1 text-right whitespace-pre-line type-body-strong text-foreground">{{ row.value }}</p>
        </div>
      </section>

      <section class="space-y-3.5 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">內容說明</h2>
        <p class="type-body text-foreground">{{ announcement.content }}</p>
      </section>

      <section class="space-y-3.5 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">發布紀錄</h2>
        <div v-for="row in publishRows" :key="row.label" class="flex items-baseline gap-3">
          <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
          <p class="min-w-0 flex-1 text-right whitespace-pre-line type-body-strong text-foreground">{{ row.value }}</p>
        </div>
      </section>

      <!-- 已發布：兩顆左右排，撤回（紅）在左、主要的修改在右（2026-10-23 013 改，原本照設計稿上下排） -->
      <BottomCta v-if="announcement.canWithdraw">
        <Button variant="destructive" :disabled="pending" @click="openWithdraw">撤回公告</Button>
        <Button as-child>
          <RouterLink :to="editLink">修改公告</RouterLink>
        </Button>
      </BottomCta>

      <!-- 撤回確認彈窗：平常看不到，withdrawOpen 變成 true 才會出現（長相和撤回通報的彈窗一樣） -->
      <Dialog v-model:open="withdrawOpen">
        <!-- 沒有右上角的叉叉，用「保留公告」關閉；點彈窗外面也可以關 -->
        <!-- @open-auto-focus.prevent：打開時不要自動把游標放進輸入框（不然手機的鍵盤會馬上跳出來），點了輸入框才開始打字 -->
        <DialogContent :show-close-button="false" class="gap-3.5 p-5" @open-auto-focus.prevent>
          <!-- 結尾的 ! 是「一定要用這個」：DialogTitle 本身有預設的字級，要蓋過它 -->
          <DialogTitle class="type-card-title!">撤回這則公告？</DialogTitle>
          <DialogDescription class="type-body!">
            撤回後住戶將看不到這則公告，已收到通知的住戶會收到更正通知。
          </DialogDescription>
          <!-- aria-label：輸入框沒有另外的標題文字，這是給螢幕閱讀器念的名稱 -->
          <Input v-model="withdrawReason" aria-label="撤回原因" placeholder="撤回原因（選填）" maxlength="50" />
          <!-- 做了就回不去的動作（紅）在左；安全的「保留公告」是主要按鈕、在右，手滑按到也不會出事（2026-10-23） -->
          <div class="flex gap-3">
            <Button variant="destructive" class="flex-1" :disabled="pending" @click="submitWithdraw">
              確認撤回
            </Button>
            <!-- DialogClose：包住的按鈕按下去就會關閉彈窗 -->
            <DialogClose as-child>
              <Button class="flex-1">保留公告</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </template>
  </div>
</template>
