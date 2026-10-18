<script setup>
// 管委會端、管理人員端共用・交辦的回報完成（交辦詳情的「回報完成」）
// 設計稿沒有這一頁，版面照案件的回報完成頁（CaseCompleteView，設計稿 1134:13682）：
//   交辦摘要、附件（選填，最多 5 個）、備註說明（選填）；底部「回報」先跳確認彈窗，確認了才回報
// 只給「沒有關聯案件」的交辦用；有關聯案件的，交辦詳情會連到案件的回報完成頁（完工驗收時交辦會一起回報）
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomCta from '@/components/app/BottomCta.vue'
import CaseAttachmentList from '@/components/case/CaseAttachmentList.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { formatFullDate } from '@/lib/date'
import { getCurrentUser, getTaskById, reportTask } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const ATTACHMENT_MAX = 5 // 附件最多幾個（和案件的回報完成頁一樣）
const NOTE_MAX = 200 // 備註最多幾個字

// 網址是 /committee/tasks/:id/report 或 /staff/tasks/:id/report；route.meta.roleId 是目前在哪一端
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const task = ref(null) // 這一件交辦；編號不存在時是 undefined
const userId = ref('')
const files = ref([]) // 附件的檔名
const note = ref('') // 備註說明
const confirmOpen = ref(false) // 確認彈窗開了沒
const pending = ref(false) // 送出還在路上

async function load() {
  if (!route.params.id) return // 正要離開這一頁，不用拿
  loading.value = true
  const user = await getCurrentUser(route.meta.roleId)
  userId.value = user.id
  task.value = await getTaskById(route.params.id)
  loading.value = false
}
watch(() => route.params.id, load, { immediate: true })

// 回到這件交辦的詳情頁
const detailPath = computed(() => `/${route.meta.roleId}/tasks/${route.params.id}`)

// 能不能回報：交辦給我的、還在進行中（含已逾期、被退回的），而且沒有關聯案件（和交辦詳情的按鈕同一個規則）
const canReport = computed(
  () => task.value?.assigneeId === userId.value && task.value.status === 'in_progress' && !task.value.caseId,
)

// 摘要卡的第二行：交辦人｜期限（管委會、管理人員端的日期有年份，例如 2026/10/08）
const summaryText = computed(() => {
  const deadline = task.value.deadline ? formatFullDate(task.value.deadline) : '未設定'
  return `交辦人：${task.value.assignerLabel}｜期限：${deadline}`
})

// 不能回報時，空狀態要說的原因
const blockedText = computed(() => {
  if (task.value.assigneeId !== userId.value) return '這件交辦不是交辦給你的。'
  if (task.value.status === 'reported') return '已經回報過了，正在等交辦人確認。'
  return '這件交辦已經結束了。'
})

async function submit() {
  pending.value = true
  const ok = await reportTask(task.value.id, userId.value, { note: note.value.trim(), files: files.value })
  pending.value = false
  if (!ok) {
    toast.error('沒有回報成功', { description: '交辦的狀態可能已經改變，請重新整理' })
    return
  }
  confirmOpen.value = false
  toast.success('已回報完成', { description: `等待${task.value.assignerLabel}確認` })
  // 從交辦詳情來的就回上一頁；直接打開這一頁的（沒有上一頁）就換到交辦詳情
  if (window.history.state?.back === detailPath.value) router.back()
  else router.replace(detailPath.value)
}
</script>

<template>
  <div class="space-y-4 px-5 pt-4" :class="canReport ? 'pb-28' : 'pb-5'">
    <template v-if="loading">
      <Skeleton class="h-[83px] rounded-xl" />
      <Skeleton class="h-[180px] rounded-xl" />
      <Skeleton class="h-[128px] rounded-xl" />
    </template>

    <!-- 找不到交辦，或這件交辦現在不能回報（例如已經回報過、不是交辦給我的） -->
    <Empty v-else-if="!task || !canReport" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="330" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">{{ task ? '這件交辦現在不能回報完成' : '找不到這件交辦' }}</EmptyTitle>
      <EmptyDescription class="type-body">
        {{ task ? blockedText : '可能已經刪除，或是網址不正確。' }}
      </EmptyDescription>
      <Button as-child class="mt-4">
        <!-- 管理人員端沒有交辦列表，回首頁 -->
        <RouterLink :to="task ? detailPath : route.meta.roleId === 'staff' ? '/staff/home' : '/committee/tasks'">
          {{ task ? '回到交辦詳情' : route.meta.roleId === 'staff' ? '回到首頁' : '回到交辦進度' }}
        </RouterLink>
      </Button>
    </Empty>

    <template v-else>
      <!-- 交辦摘要 -->
      <section class="space-y-1.5 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">{{ task.title }}</h2>
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

      <!-- 備註說明 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">
          <!-- label 包住標題，點標題也會把游標放進輸入框 -->
          <label for="report-note">備註說明</label><span class="ml-1.5 type-date text-muted-foreground">選填</span>
        </h2>
        <Textarea
          id="report-note"
          v-model="note"
          :maxlength="NOTE_MAX"
          placeholder="簡單說明完成情況，例如報告已彙整、已放進社區檔案..."
          class="min-h-[88px]"
        />
      </section>
    </template>

    <BottomCta v-if="!loading && task && canReport">
      <Button :disabled="pending" @click="confirmOpen = true">回報</Button>
    </BottomCta>

    <!-- 確認彈窗：回報之後就不能改了，先問一次 -->
    <Dialog v-model:open="confirmOpen">
      <DialogContent v-if="task" :show-close-button="false" class="gap-3.5 p-5">
        <!-- 結尾的 ! 是「一定要用這個」：DialogTitle 本身有預設的字級，要蓋過它 -->
        <DialogTitle class="type-card-title!">確認回報完成？</DialogTitle>
        <DialogDescription class="type-body!">回報後會交給{{ task.assignerLabel }}確認。</DialogDescription>
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
