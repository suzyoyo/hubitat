<script setup>
// 新增通報・第 4 步：描述問題（住戶端、管委會端的新增通報共用）
// 通報問題（標題，必填）、補充說明（選填）、現場照片或影片（選填，最多 3 個）
import { MapPinIcon } from '@lucide/vue'
import FeedbackHaobiTip from '@/components/feedback/FeedbackHaobiTip.vue'
import ReportPhotoGrid from '@/components/report/ReportPhotoGrid.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { REPORT_DESCRIPTION_MAX, REPORT_SUBJECT_MAX } from '@/lib/report'

defineProps({
  // 最上面那一行：前面幾步選了什麼，例如「A 棟・1F 大廳・公共設施問題」
  context: { type: String, required: true },
})

// 三個欄位，頁面用 v-model:subject、v-model:description、v-model:photos 綁定
const subject = defineModel('subject', { type: String, default: '' })
const description = defineModel('description', { type: String, default: '' })
const photos = defineModel('photos', { type: Array, default: () => [] })
</script>

<template>
  <div class="space-y-4">
    <!-- 前面幾步選的地點和類型，提醒住戶現在在通報什麼 -->
    <div class="flex items-center gap-2 rounded-md bg-card px-3 py-2.5 shadow-card">
      <MapPinIcon class="size-[18px] shrink-0" />
      <p class="min-w-0 flex-1 type-body text-foreground">{{ context }}</p>
    </div>

    <FeedbackHaobiTip title="可以說說發生什麼事嗎？" description="附上照片，我們會更快了解狀況。" />

    <!-- 通報問題：必填，名稱後面是紅色星號 -->
    <div class="space-y-2">
      <!-- for 對應輸入框的 id：點名稱，游標會跳進輸入框 -->
      <Label for="report-subject" class="text-base">
        通報問題
        <span class="text-warning-strong">*</span>
      </Label>
      <!-- maxlength：超過字數上限就打不進去 -->
      <Input id="report-subject" v-model="subject" placeholder="例如：感應門不會自動開" :maxlength="REPORT_SUBJECT_MAX" />
    </div>

    <!-- 補充說明：選填，名稱後面是灰色小字「選填」 -->
    <div class="space-y-2">
      <Label for="report-description" class="text-base">
        補充說明
        <span class="type-label text-muted-foreground">選填</span>
      </Label>
      <Textarea
        id="report-description"
        v-model="description"
        placeholder="例如：需要用力推才會動，尤其晚上回家時常被擋在門外。"
        :maxlength="REPORT_DESCRIPTION_MAX"
        class="min-h-[140px]"
      />
      <p class="text-right type-date text-muted-foreground">{{ description.length }} / {{ REPORT_DESCRIPTION_MAX }} 字</p>
    </div>

    <!-- 現場照片／影片：選填 -->
    <div class="space-y-2">
      <!-- 照片不是單一個輸入框，所以用 p，不用 Label -->
      <!-- 設計稿右邊還有「已加入 1／3 張」，和下面的說明重複，所以拿掉 -->
      <p class="flex items-center gap-2 text-base font-medium text-foreground">
        現場照片／影片
        <span class="type-label text-muted-foreground">選填</span>
      </p>
      <!-- 照片格和下面的說明是共用的元件，和通報詳情頁長得一樣 -->
      <ReportPhotoGrid v-model="photos" />
    </div>
  </div>
</template>
