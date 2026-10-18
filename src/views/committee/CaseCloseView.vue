<script setup>
// 管委會端・結案（案件詳情的「結案」，規則見 docs/case-flow.md 4-6、4-7）
// 只有主委、副主委、案件是「待結案」才能結案
// 由上到下：案件摘要、維修費用（選填，有關聯設備才有）、結案說明（選填）
// 底部一顆「結案」，按了直接結案（案件詳情已經按過「確認結案」才來這一頁；「退回」在案件詳情，2026-10-16）
// 廠商評分 2026-10-16 拿掉了
// 版面照回報完成頁（CaseCompleteView.vue）
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomCta from '@/components/app/BottomCta.vue'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { formatFullDate } from '@/lib/date'
import { canCloseCases, closeCase, getCaseById, getCurrentUser } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const NOTE_MAX = 200 // 結案說明最多幾個字

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const item = ref(null) // 這一件案件；編號不存在時是 undefined
const userId = ref('')
const cost = ref('') // 維修費用（輸入框的文字，送出時才轉成數字）
const note = ref('') // 結案說明，會寫進處理紀錄
const pending = ref(false) // 送出還在路上

async function load() {
  if (!route.params.id) return // 正要離開這一頁，不用拿
  loading.value = true
  const user = await getCurrentUser('committee')
  userId.value = user.id
  item.value = await getCaseById(route.params.id)
  loading.value = false
}
watch(() => route.params.id, load, { immediate: true })

const detailPath = computed(() => `/committee/cases/${route.params.id}`)

// 能不能結案：主委、副主委，而且案件是待結案（和案件詳情的「結案」按鈕同一個規則）
const canClose = computed(() => canCloseCases(userId.value) && item.value?.status === 'to_verify')

// 摘要卡的第二行：負責人｜廠商
const summaryText = computed(() => {
  const handler = item.value.handlerLabel || '尚未指派'
  return `負責人：${handler}｜廠商：${item.value.vendorName || '沒有派廠商'}`
})

// 完工驗收的時間（管理人員按完工驗收的那一筆紀錄）
const completedText = computed(() => {
  const at = item.value.completion?.at
  return at ? `${formatFullDate(at)} 完工驗收` : ''
})

// 費用只能打數字：把不是數字的字拿掉
function onCostInput(value) {
  cost.value = String(value).replace(/\D/g, '')
}

async function submit() {
  pending.value = true
  const options = {}
  if (Number(cost.value) > 0) options.cost = Number(cost.value)
  if (note.value.trim()) options.note = note.value.trim()
  const result = await closeCase(item.value.id, userId.value, options)
  pending.value = false
  if (!result) {
    toast.error('沒有結案成功', { description: '案件的狀態可能已經改變，請回到案件詳情看看' })
    return
  }
  toast.success('已結案', { description: result.equipmentName ? `已記進「${result.equipmentName}」的維修紀錄` : '' })
  backToDetail()
}

// 從案件詳情來的就回上一頁；直接打開這一頁的（沒有上一頁）就換到案件詳情
function backToDetail() {
  if (window.history.state?.back === detailPath.value) router.back()
  else router.replace(detailPath.value)
}
</script>

<template>
  <div class="space-y-4 px-5 pt-4" :class="canClose ? 'pb-28' : 'pb-5'">
    <template v-if="loading">
      <Skeleton class="h-[83px] rounded-xl" />
      <Skeleton class="h-[128px] rounded-xl" />
      <Skeleton class="h-[180px] rounded-xl" />
    </template>

    <!-- 找不到案件，或這件案件現在不能結案（例如還沒完工驗收、已經結案、我不是主委或副主委） -->
    <Empty v-else-if="!item || !canClose" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="330" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">{{ item ? '這件案件現在不能結案' : '找不到這件案件' }}</EmptyTitle>
      <EmptyDescription class="type-body">
        {{ item ? `目前狀態是「${item.statusLabel}」。` : '可能已經刪除，或是網址不正確。' }}
      </EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink :to="item ? detailPath : '/committee/cases'">
          {{ item ? '回到案件詳情' : '回到案件列表' }}
        </RouterLink>
      </Button>
    </Empty>

    <template v-else>
      <!-- 案件摘要 -->
      <section class="space-y-1.5 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">{{ item.title }}</h2>
        <p class="type-date text-muted-foreground">{{ summaryText }}</p>
        <p v-if="completedText" class="type-date text-muted-foreground">{{ completedText }}</p>
      </section>

      <!-- 維修費用：費用記在設備的維修紀錄上，沒有關聯設備就不記（case-flow 4-6） -->
      <section v-if="item.equipmentName" class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">
          <label for="close-cost">維修費用</label><span class="ml-1.5 type-date text-muted-foreground">選填</span>
        </h2>
        <div class="flex items-center gap-2">
          <!-- inputmode="numeric"：手機會跳出數字鍵盤 -->
          <Input
            id="close-cost"
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

      <!-- 結案說明：寫在處理進度「已結案」那筆紀錄的第二行（住戶看不到） -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">
          <label for="close-note">結案說明</label><span class="ml-1.5 type-date text-muted-foreground">選填</span>
        </h2>
        <Textarea
          id="close-note"
          v-model="note"
          :maxlength="NOTE_MAX"
          placeholder="例如費用已付清、保固一年"
          class="min-h-[88px]"
        />
        <p class="type-date text-muted-foreground">會顯示在處理進度與留痕，住戶看不到。</p>
      </section>
    </template>

    <BottomCta v-if="!loading && item && canClose">
      <Button :disabled="pending" @click="submit">結案</Button>
    </BottomCta>
  </div>
</template>
