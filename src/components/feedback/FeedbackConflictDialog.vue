<script setup>
// 「狀態已經變了」的彈窗：兩個人同時處理同一筆資料時，晚按的人會看到這個
// 例：李主委打開案件時還沒結案，按下結案前，張副主委已經先結案了
// 例：<FeedbackConflictDialog v-model:open="conflictOpen" description="張副主委在 13:40 已經結案。" @refresh="load" />
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

defineProps({
  title: { type: String, default: '這筆資料剛剛有人改過了' },
  // 說清楚是誰、什麼時候、改成什麼
  description: { type: String, required: true },
})

// v-model:open：彈窗開或關
const open = defineModel('open', { type: Boolean, default: false })
// 按「重新整理」時通知頁面重新拿資料
const emit = defineEmits(['refresh'])

function refresh() {
  open.value = false
  emit('refresh')
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent :show-close-button="false" class="gap-3.5 p-5">
      <!-- 結尾的 ! 是「一定要用這個」：DialogTitle 本身有預設的字級，要蓋過它 -->
      <DialogTitle class="type-card-title!">{{ title }}</DialogTitle>
      <DialogDescription class="type-body!">
        {{ description }}你的操作沒有送出，請重新整理看最新的狀態。
      </DialogDescription>
      <Button class="w-full" @click="refresh">重新整理</Button>
    </DialogContent>
  </Dialog>
</template>
