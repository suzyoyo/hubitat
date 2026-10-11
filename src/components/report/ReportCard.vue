<script setup>
// 「我的通報」卡片（對應 Figma 的 Report/Card），有三種：
//   Compact：首頁摘要（最新回覆＋更新時間）
//   Full：   我的通報列表（送出日期＋管委會回覆＋編輯按鈕）
//   Empty：  目前無通報（不傳 report 就是這一種）
import { computed } from 'vue'
import { ChevronRightIcon, ClockIcon, PencilLineIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatDateTime } from '@/lib/date'

const props = defineProps({
  // getMyReports() 回傳的其中一筆；不傳就顯示「目前無通報」
  report: { type: Object, default: null },
  // 卡片的種類：'compact'（首頁）或 'full'（我的通報列表）
  type: { type: String, default: 'compact' },
  // 點卡片要連到哪一頁
  to: { type: String, default: '' },
  // 「編輯通報 / 補充」要連到哪一頁（只有 Full 會用到）；不傳就不顯示這個按鈕
  editTo: { type: String, default: '' },
})

// 徽章顏色：「處理中」是淺橘（secondary），「已收到」「已完成」是淺藍（default）
// status 是 pending 代表管委會還沒受理，住戶看到的是「已收到」
const badgeVariant = computed(() => {
  if (props.report.isOpen && props.report.status !== 'pending') return 'secondary'
  return 'default'
})

// Compact 的外觀：左邊一條紅線，所以只有右邊是圓角
const compactClass = 'block rounded-r-xl border-l-[5px] border-warning bg-card p-4 shadow-card'
</script>

<template>
  <!-- Empty：目前無通報 -->
  <div v-if="!report" :class="compactClass">
    <p class="type-greeting">目前無通報</p>
  </div>

  <!-- Full：我的通報列表 -->
  <!-- relative：讓標題連結的可點擊範圍可以蓋滿這張卡片（見下面的說明） -->
  <article v-else-if="type === 'full'" class="relative space-y-3 rounded-xl bg-card p-4 shadow-card">
    <div class="flex items-start gap-1">
      <h3 class="min-w-0 flex-1 type-greeting">
        <!-- 卡片裡面還有「編輯」按鈕，連結不能包連結，所以不能把整張卡片做成 RouterLink -->
        <!-- 改成：連結只包標題，再用 after:absolute after:inset-0 把可點擊範圍放大到整張卡片 -->
        <RouterLink :to="to" class="after:absolute after:inset-0">{{ report.displayTitle }}</RouterLink>
      </h3>
      <Badge :variant="badgeVariant">{{ report.statusLabel }}</Badge>
    </div>
    <p class="text-base leading-5 text-muted-foreground">送出於 {{ formatDate(report.submittedAt) }}</p>
    <!-- 管委會還沒回覆時，latestReply 是 undefined，這一塊就不顯示 -->
    <div v-if="report.latestReply" class="space-y-1 py-2.5">
      <p class="type-body-strong">管委會回覆</p>
      <p class="type-body">{{ report.latestReply.text }}</p>
    </div>
    <div class="flex items-center">
      <!-- relative z-10：讓按鈕疊在標題連結的可點擊範圍上面，才按得到 -->
      <Button v-if="editTo" as-child variant="outline" class="relative z-10 bg-card px-3 font-medium">
        <RouterLink :to="editTo">
          <PencilLineIcon />
          編輯通報 / 補充
        </RouterLink>
      </Button>
      <!-- ml-auto：不管左邊有沒有按鈕，箭頭都靠右 -->
      <ChevronRightIcon class="ml-auto size-5 shrink-0" />
    </div>
  </article>

  <!-- Compact：首頁摘要 -->
  <RouterLink v-else :to="to" :class="compactClass" class="space-y-3">
    <div class="flex items-start gap-1">
      <h3 class="min-w-0 flex-1 type-greeting">{{ report.displayTitle }}</h3>
      <Badge :variant="badgeVariant">{{ report.statusLabel }}</Badge>
    </div>
    <!-- 最新一筆給住戶看的進度說明 -->
    <p class="type-body text-muted-foreground">{{ report.latestReply.text }}</p>
    <Separator />
    <div class="flex items-center gap-2.5">
      <ClockIcon class="size-5 shrink-0" />
      <p class="min-w-0 flex-1 text-base leading-5">更新於 {{ formatDateTime(report.updatedAt) }}</p>
      <ChevronRightIcon class="size-5 shrink-0" />
    </div>
  </RouterLink>
</template>
