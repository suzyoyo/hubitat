<script setup>
// 離開前確認：表單填到一半想離開（按返回、點底部分頁、重新整理、關掉分頁）時，先問一次（2026-10-19）
// 用法：放在表單頁裡，傳「有沒有填東西」進來；沒填東西就直接離開，不打擾
//   <LeaveConfirmDialog :dirty="isDirty" />
// 送出成功後要換頁的頁面，要讓 isDirty 先變成 false（例如加一個 saved 旗子），才不會在送出後又問一次
// 「存成草稿」之後再做（下一個 PR）
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

const props = defineProps({
  // 有沒有填東西（還沒送出）
  dirty: { type: Boolean, default: false },
})

const router = useRouter()
const open = ref(false)
let target = null // 使用者原本要去的地方
let allowed = false // 按了「直接離開」，這次就不再擋

// 換頁前：有填東西就先擋下來，跳出彈窗
onBeforeRouteLeave((to) => {
  if (!props.dirty || allowed) return true
  target = to
  open.value = true
  return false
})

// 按「不儲存，直接離開」：放行，再去原本要去的地方
// 原本是按返回（要去的就是上一頁）就退回上一頁，歷史紀錄才不會多一筆
function leave() {
  allowed = true
  open.value = false
  if (window.history.state?.back === target.fullPath) router.back()
  else router.push(target.fullPath)
}

// 重新整理、關掉分頁：瀏覽器只能跳它自己的提醒，文字不能改
function onBeforeUnload(event) {
  if (!props.dirty) return
  event.preventDefault()
  event.returnValue = ''
}
onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent :show-close-button="false" class="gap-3.5 p-5">
      <!-- 結尾的 ! 是「一定要用這個」：DialogTitle 本身有預設的字級，要蓋過它 -->
      <DialogTitle class="type-card-title!">還沒送出，確定要離開嗎？</DialogTitle>
      <DialogDescription class="type-body!">離開後，剛剛填的內容不會保留。</DialogDescription>
      <!-- 最安全的「繼續填寫」放在主要按鈕，避免誤按就把資料丟掉 -->
      <div class="space-y-2">
        <Button class="w-full" @click="open = false">繼續填寫</Button>
        <Button variant="outline" class="w-full" @click="leave">不儲存，直接離開</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
