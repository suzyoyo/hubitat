<script setup>
// 社區公告頁的公告卡（對應 Figma 的 Notice/Card）
// 類型／時間／範圍三個徽章＋標題＋日期時間＋影響範圍或地點＋負責單位與「查看詳情」
import { computed } from 'vue'
import { ChevronRightIcon, ClockIcon, MapPinIcon, TriangleAlertIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { countDays, diffDays, formatDateWithWeekday } from '@/lib/date'
import { noticeDateText, noticeOrganizerLabel } from '@/lib/notice'
import { MOCK_TODAY } from '@/mocks/api'

const props = defineProps({
  // getAnnouncements() 回傳的其中一則
  notice: { type: Object, required: true },
})

// 點卡片時通知頁面（會把這則公告一起傳出去），由頁面打開詳情彈窗
defineEmits(['detail'])

// '2026-10-05T09:00' → '2026-10-05'
const startDate = computed(() => props.notice.startAt.split('T')[0])
const endDate = computed(() => props.notice.endAt.split('T')[0])
// 是不是同一天開始、同一天結束
const isOneDay = computed(() => startDate.value === endDate.value)

// 時間徽章：文字和顏色一起決定（住戶端的徽章規則見 docs/dev-guide.md 第 5 節）
//   進行中、今天 → 紅（destructive）：今天就會影響你
//   明天         → 藍（default）：跟你有關，但還不用做什麼
//   更之後       → 灰（outline）：一般日期
const timeBadge = computed(() => {
  const dateText = formatDateWithWeekday(startDate.value)
  if (props.notice.isOngoing) {
    // 只有一天的公告不用寫「共 1 天」
    const text = isOneDay.value ? '進行中' : `進行中・共 ${countDays(startDate.value, endDate.value)} 天`
    return { variant: 'destructive', text }
  }
  const days = diffDays(MOCK_TODAY, startDate.value)
  if (days <= 0) return { variant: 'destructive', text: `今天 ${dateText}` }
  if (days === 1) return { variant: 'default', text: `明天 ${dateText}` }
  return { variant: 'outline', text: dateText }
})
</script>

<template>
  <!-- relative：讓「查看詳情」的可點擊範圍可以蓋滿這張卡片（見最下面的說明） -->
  <article class="relative space-y-3 rounded-xl bg-card p-4 shadow-card">
    <!-- 三個徽章：類型（灰）、時間、範圍。放不下會自動換行 -->
    <div class="flex flex-wrap items-center gap-2">
      <Badge variant="outline">{{ notice.typeLabel }}</Badge>
      <Badge :variant="timeBadge.variant">{{ timeBadge.text }}</Badge>
      <!-- 與我有關的用藍色標出來；其他的只顯示範圍 -->
      <Badge v-if="notice.relatedToMe">與你相關・{{ notice.scopeLabel }}</Badge>
      <Badge v-else variant="outline">{{ notice.scopeLabel }}</Badge>
    </div>

    <h3 class="type-card-title">{{ notice.title }}</h3>

    <!-- 圖示固定大小（shrink-0），文字太長時換行、不會把圖示擠扁 -->
    <div class="flex items-center gap-2.5">
      <ClockIcon class="size-5 shrink-0" />
      <p class="min-w-0 flex-1 type-body">
        日期時間：{{ noticeDateText(notice) }}
        <!-- 多天的公告才有每日時段，另起一行 -->
        <template v-if="notice.timeText"><br />{{ notice.timeText }}</template>
      </p>
    </div>

    <!-- 有影響範圍說明就顯示影響範圍；活動類沒有，改顯示地點 -->
    <div v-if="notice.impact" class="flex items-center gap-2.5">
      <TriangleAlertIcon class="size-5 shrink-0" />
      <p class="min-w-0 flex-1 type-body">影響範圍：{{ notice.impact }}</p>
    </div>
    <div v-else-if="notice.place" class="flex items-center gap-2.5">
      <MapPinIcon class="size-5 shrink-0" />
      <p class="min-w-0 flex-1 type-body">地點：{{ notice.place }}</p>
    </div>

    <div class="flex items-center gap-2">
      <p class="min-w-0 flex-1 type-date text-muted-foreground">
        {{ noticeOrganizerLabel(notice) }}：{{ notice.organizer }}
      </p>
      <!-- h-11 是 44px 高；-mr-2.5 讓箭頭對齊卡片內容的右邊 -->
      <!-- after:absolute after:inset-0：把可點擊範圍放大到整張卡片，點卡片任何地方都等於按這顆按鈕 -->
      <button
        type="button"
        class="-mr-2.5 flex h-11 shrink-0 items-center gap-1 rounded-lg px-2.5 type-link tracking-[0.4px] text-heading after:absolute after:inset-0"
        @click="$emit('detail', notice)"
      >
        查看詳情
        <ChevronRightIcon class="size-4" />
      </button>
    </div>
  </article>
</template>
