<script setup>
// 社區公告頁的公告卡（對應 Figma 的 Notice/Card）
// 類型、範圍兩個徽章＋標題＋日期時間＋地點或注意事項＋負責單位與「查看詳情」
// 徽章不寫日期和「進行中」這類狀態：日期已經在內文的「日期時間」那一行
import { ChevronRightIcon, ClockIcon, MapPinIcon, TriangleAlertIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { noticeDateText, noticeOrganizerLabel } from '@/lib/notice'

defineProps({
  // getAnnouncements() 回傳的其中一則
  notice: { type: Object, required: true },
})

// 點卡片時通知頁面（會把這則公告一起傳出去），由頁面打開詳情彈窗
defineEmits(['detail'])
</script>

<template>
  <!-- relative：讓「查看詳情」的可點擊範圍可以蓋滿這張卡片（見最下面的說明） -->
  <article class="relative space-y-3 rounded-xl bg-card p-4 shadow-card">
    <!-- 兩個徽章：類型（灰）、範圍。放不下會自動換行 -->
    <div class="flex flex-wrap items-center gap-2">
      <Badge variant="outline">{{ notice.typeLabel }}</Badge>
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

    <!-- 活動類顯示地點；其他顯示注意事項，也就是公告的內容說明（影響哪裡看上面的範圍徽章） -->
    <div v-if="notice.place" class="flex items-center gap-2.5">
      <MapPinIcon class="size-5 shrink-0" />
      <p class="min-w-0 flex-1 type-body">地點：{{ notice.place }}</p>
    </div>
    <div v-else class="flex items-center gap-2.5">
      <TriangleAlertIcon class="size-5 shrink-0" />
      <!-- line-clamp-2：內容太長時只顯示兩行，後面用「…」，完整內容點「查看詳情」看 -->
      <p class="line-clamp-2 min-w-0 flex-1 type-body">注意事項：{{ notice.content }}</p>
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
