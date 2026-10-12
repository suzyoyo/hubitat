<script setup>
// 公告詳情彈窗（對應設計稿「住戶端-首頁-社區公告（查看詳情彈窗）」）
// 首頁和社區公告頁共用：點公告卡片時打開，顯示日期時間、地點或影響範圍、負責單位、注意事項
import { ClockIcon, HardHatIcon, InfoIcon, MapPinIcon, TriangleAlertIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { noticeDateText, noticeOrganizerLabel } from '@/lib/notice'

defineProps({
  // getAnnouncements() 回傳的其中一則；還沒點過任何卡片時是 null
  notice: { type: Object, default: null },
})

// 彈窗是開還是關。頁面用 v-model:open 綁定，彈窗自己關掉時頁面的值也會跟著變
const open = defineModel('open', { type: Boolean, default: false })
</script>

<template>
  <Dialog v-model:open="open">
    <!-- 設計稿沒有右上角的叉叉，用下面的「我知道了」關閉；點彈窗外面也可以關 -->
    <!-- max-h + overflow-y-auto：內容太長時在彈窗裡面捲動，不會超出畫面 -->
    <DialogContent
      v-if="notice"
      :show-close-button="false"
      class="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto p-5"
    >
      <Badge>公告詳情</Badge>
      <!-- 結尾的 ! 是「一定要用這個」：DialogTitle 本身有預設的字級，要蓋過它 -->
      <DialogTitle class="type-card-title!">{{ notice.title }}</DialogTitle>
      <!-- 給螢幕閱讀器的說明，畫面上看不到（sr-only） -->
      <DialogDescription class="sr-only">這則公告的時間、地點與注意事項</DialogDescription>
      <Separator />

      <!-- 每一項：左邊圖示，右邊上面是項目名稱、下面是內容 -->
      <div class="space-y-5 px-1">
        <div class="flex items-center gap-2.5">
          <ClockIcon class="size-5 shrink-0" />
          <div class="min-w-0 flex-1 space-y-1">
            <p class="type-body-strong">日期時間</p>
            <p class="type-body text-muted-foreground">
              {{ noticeDateText(notice) }}
              <!-- 多天的公告才有每日時段，另起一行 -->
              <template v-if="notice.timeText"><br />{{ notice.timeText }}</template>
            </p>
          </div>
        </div>

        <!-- 活動類顯示地點；其他顯示影響範圍（影響哪裡＋會怎麼影響） -->
        <div class="flex items-center gap-2.5">
          <MapPinIcon class="size-5 shrink-0" />
          <div v-if="notice.place" class="min-w-0 flex-1 space-y-1">
            <p class="type-body-strong">地點</p>
            <p class="type-body text-muted-foreground">{{ notice.place }}</p>
          </div>
          <div v-else class="min-w-0 flex-1 space-y-1">
            <p class="type-body-strong">影響範圍</p>
            <p class="type-body text-muted-foreground">
              {{ notice.scopeLabel }}
              <template v-if="notice.impact"><br />{{ notice.impact }}</template>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <HardHatIcon class="size-5 shrink-0" />
          <div class="min-w-0 flex-1 space-y-1">
            <p class="type-body-strong">{{ noticeOrganizerLabel(notice) }}單位</p>
            <p class="type-body text-muted-foreground">{{ notice.organizer }}</p>
          </div>
        </div>

        <!-- 公告有寫內容說明才顯示。活動是「活動說明」，其他（施工、維護…）是「注意事項」 -->
        <div v-if="notice.content" class="flex items-center gap-2.5">
          <InfoIcon v-if="notice.type === 'activity'" class="size-5 shrink-0" />
          <TriangleAlertIcon v-else class="size-5 shrink-0" />
          <div class="min-w-0 flex-1 space-y-1">
            <p class="type-body-strong">{{ notice.type === 'activity' ? '活動說明' : '注意事項' }}</p>
            <p class="type-body text-muted-foreground">{{ notice.content }}</p>
          </div>
        </div>
      </div>

      <Separator />
      <!-- DialogClose：包住的按鈕按下去就會關閉彈窗 -->
      <DialogClose as-child>
        <Button class="w-full">我知道了</Button>
      </DialogClose>
    </DialogContent>
  </Dialog>
</template>
