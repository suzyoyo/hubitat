<script setup>
// 管委會端、管理人員端共用・回報完成（案件詳情的「完工驗收」，設計稿 1134:13682）
// 由上到下：案件摘要、附件（選填，最多 5 個）、維修費用（只有主委、副主委）、備註說明（選填）；底部「回報」先跳確認彈窗，確認了才完工驗收
// 主委、副主委按的會直接結案，所以多一欄維修費用（有關聯設備才有），和結案頁（CaseCloseView.vue）一樣放在說明上面（2026-10-16）
//   結案頁的「結案說明」這裡不另外放，備註說明就是說明（兩個文字框合成一個）
// 完工驗收之後（規則見 docs/case-flow.md 4-5，2026-10-15 改）：
//   主委、副主委按的（自己處理的）→ 直接結案
//   管理人員按的 → 待結案，回到主委、副主委審核；交辦給我的那筆交辦一起回報完成
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomCta from '@/components/app/BottomCta.vue'
import CaseAttachmentList from '@/components/case/CaseAttachmentList.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { formatFullDate } from '@/lib/date'
import { canCloseCases, canHandleCases, completeCase, getCaseById, getCurrentUser } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const ATTACHMENT_MAX = 5 // 附件最多幾個（設計稿）
const NOTE_MAX = 200 // 備註最多幾個字

// 網址是 /committee/cases/:id/complete 或 /staff/cases/:id/complete；route.meta.roleId 是目前在哪一端
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const item = ref(null) // 這一件案件；編號不存在時是 undefined
const userId = ref('')
const files = ref([]) // 附件的檔名
const note = ref('') // 備註說明
const cost = ref('') // 維修費用（直接結案才有；輸入框的文字，送出時才轉成數字）
const confirmOpen = ref(false) // 確認彈窗開了沒
const pending = ref(false) // 送出還在路上

async function load() {
  if (!route.params.id) return // 正要離開這一頁，不用拿
  loading.value = true
  const user = await getCurrentUser(route.meta.roleId)
  userId.value = user.id
  item.value = await getCaseById(route.params.id)
  loading.value = false
}
watch(() => route.params.id, load, { immediate: true })

// 回到這件案件的詳情頁
const detailPath = computed(() => `/${route.meta.roleId}/cases/${route.params.id}`)

// 能不能完工驗收：主委、副主委、管理人員，而且案件是已受理或處理中（和案件詳情的按鈕同一個規則）
const canComplete = computed(
  () => canHandleCases(userId.value) && ['accepted', 'in_progress'].includes(item.value?.status),
)
// 我是主委或副主委 → 回報後直接結案（我本身就是審核的人）
const closesDirectly = computed(() => canCloseCases(userId.value))

// 摘要卡的第二行：負責人｜期限（管委會、管理人員端的日期有年份，例如 2026/10/08）
const summaryText = computed(() => {
  const deadline = item.value.deadline ? formatFullDate(item.value.deadline) : '尚未設定'
  // 負責人：實際處理的人（交辦出去就是交辦對象，case-flow 第 3 節）
  return `負責人：${item.value.handlerLabel || '尚未指派'}｜期限：${deadline}`
})

// 確認彈窗的說明：按了之後會發生什麼
const confirmText = computed(() =>
  closesDirectly.value ? '回報後會直接結案。' : '回報後會交給主委、副主委結案。',
)

// 費用只能打數字：把不是數字的字拿掉
function onCostInput(value) {
  cost.value = String(value).replace(/\D/g, '')
}

async function submit() {
  pending.value = true
  const options = { note: note.value.trim(), photos: files.value }
  // 直接結案的才送費用
  if (closesDirectly.value && Number(cost.value) > 0) options.cost = Number(cost.value)
  const result = await completeCase(item.value.id, userId.value, options)
  pending.value = false
  if (!result) {
    toast.error('沒有回報成功', { description: '案件的狀態可能已經改變，請重新整理' })
    return
  }
  confirmOpen.value = false
  // 直接結案的：有關聯設備才會記進維修紀錄（4-7）
  if (result.status === 'closed') {
    toast.success('已結案', { description: result.equipmentName ? `已記進「${result.equipmentName}」的維修紀錄` : '' })
  }
  else toast.success('已回報完成', { description: '等待主委、副主委結案' })
  // 從案件詳情來的就回上一頁；直接打開這一頁的（沒有上一頁）就換到案件詳情
  if (window.history.state?.back === detailPath.value) router.back()
  else router.replace(detailPath.value)
}
</script>

<template>
  <div class="space-y-4 px-5 pt-4" :class="canComplete ? 'pb-28' : 'pb-5'">
    <template v-if="loading">
      <Skeleton class="h-[83px] rounded-xl" />
      <Skeleton class="h-[180px] rounded-xl" />
      <Skeleton class="h-[128px] rounded-xl" />
    </template>

    <!-- 找不到案件，或這件案件現在不能完工驗收（例如已經結案、我沒有權限） -->
    <Empty v-else-if="!item || !canComplete" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">{{ item ? '這件案件現在不能回報完成' : '找不到這件案件' }}</EmptyTitle>
      <EmptyDescription class="type-body">
        {{ item ? `目前狀態是「${item.statusLabel}」。` : '可能已經刪除，或是網址不正確。' }}
      </EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink :to="item ? detailPath : `/${route.meta.roleId}/cases`">
          {{ item ? '回到案件詳情' : '回到案件列表' }}
        </RouterLink>
      </Button>
    </Empty>

    <template v-else>
      <!-- 案件摘要 -->
      <section class="space-y-1.5 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">{{ item.title }}</h2>
        <p class="type-date text-muted-foreground">{{ summaryText }}</p>
      </section>

      <!-- 附件 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-center justify-between gap-2">
          <h2 class="type-card-title text-foreground">
            附件<span class="ml-1.5 type-date text-muted-foreground">選填</span>
          </h2>
          <Badge variant="outline">{{ files.length }}/{{ ATTACHMENT_MAX }}</Badge>
        </div>
        <CaseAttachmentList v-model="files" :max="ATTACHMENT_MAX" />
      </section>

      <!-- 維修費用：只有主委、副主委看得到（回報後直接結案）；費用記在設備的維修紀錄上，沒有關聯設備就不記（case-flow 4-6） -->
      <section v-if="closesDirectly && item.equipmentName" class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">
          <label for="complete-cost">維修費用</label><span class="ml-1.5 type-date text-muted-foreground">選填</span>
        </h2>
        <div class="flex items-center gap-2">
          <!-- inputmode="numeric"：手機會跳出數字鍵盤 -->
          <Input
            id="complete-cost"
            :model-value="cost"
            inputmode="numeric"
            placeholder="例如 4500"
            class="flex-1"
            @update:model-value="onCostInput"
          />
          <span class="type-body text-foreground">元</span>
        </div>
        <p class="type-date text-muted-foreground">會記進「{{ item.equipmentName }}」的維修紀錄，只有委員看得到。</p>
      </section>

      <!-- 備註說明 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">
          <!-- label 包住標題，點標題也會把游標放進輸入框 -->
          <label for="complete-note">備註說明</label><span class="ml-1.5 type-date text-muted-foreground">選填</span>
        </h2>
        <Textarea
          id="complete-note"
          v-model="note"
          :maxlength="NOTE_MAX"
          placeholder="簡單說明完成情況，例如改善已完成、廠商已簽收..."
          class="min-h-[88px]"
        />
      </section>
    </template>

    <BottomCta v-if="!loading && item && canComplete">
      <Button :disabled="pending" @click="confirmOpen = true">回報</Button>
    </BottomCta>

    <!-- 確認彈窗（設計稿沒畫）：回報之後就不能改了，先問一次 -->
    <Dialog v-model:open="confirmOpen">
      <DialogContent v-if="item" :show-close-button="false" class="gap-3.5 p-5">
        <!-- 結尾的 ! 是「一定要用這個」：DialogTitle 本身有預設的字級，要蓋過它 -->
        <DialogTitle class="type-card-title!">確認完工驗收？</DialogTitle>
        <DialogDescription class="type-body!">{{ confirmText }}</DialogDescription>
        <div class="flex gap-3">
          <DialogClose as-child>
            <Button variant="outline" class="flex-1">取消</Button>
          </DialogClose>
          <Button class="flex-1" :disabled="pending" @click="submit">確認回報</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
