<script setup>
// 社區公告頁的公告卡（對應 Figma 的 Notice/Card）
// 類型／時間／範圍三個徽章＋標題＋日期時間＋影響範圍或地點＋負責單位與「查看詳情」
import { computed } from 'vue'
import { ChevronRightIcon, ClockIcon, MapPinIcon, TriangleAlertIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { countDays, diffDays, formatDateWithWeekday, formatTime } from '@/lib/date'
import { MOCK_TODAY } from '@/mocks/api'

const props = defineProps({
  // getAnnouncements() 回傳的其中一則
  notice: { type: Object, required: true },
})

// 按下「查看詳情」時通知頁面，由頁面決定要做什麼
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

// 日期時間那一行
//   一天： '10/10（六）09:00–12:00'（全形括號本身就有留白，後面不用再加空格）
//   多天： '10/5（一）～10/7（三）'，每日時段（timeText）寫在下一行
const dateText = computed(() => {
  const start = formatDateWithWeekday(startDate.value)
  if (isOneDay.value) {
    return `${start}${formatTime(props.notice.startAt)}–${formatTime(props.notice.endAt)}`
  }
  return `${start}～${formatDateWithWeekday(endDate.value)}`
})

// 活動是「主辦」，其他（施工、維護…）是「負責」
const organizerLabel = computed(() => (props.notice.type === 'activity' ? '主辦' : '負責'))
</script>

<template>
  <article class="space-y-3 rounded-xl bg-card p-4 shadow-card">
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
        日期時間：{{ dateText }}
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
        {{ organizerLabel }}：{{ notice.organizer }}
      </p>
      <!-- h-11 是 44px 的可點擊範圍；-mr-2.5 讓箭頭對齊卡片內容的右邊 -->
      <button
        type="button"
        class="-mr-2.5 flex h-11 shrink-0 items-center gap-1 rounded-lg px-2.5 type-link tracking-[0.4px] text-heading"
        @click="$emit('detail', notice)"
      >
        查看詳情
        <ChevronRightIcon class="size-4" />
      </button>
    </div>
  </article>
</template>
