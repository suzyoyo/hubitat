<script setup>
// 撤回通報的確認彈窗（對應設計稿「住戶端-通報詳情-撤回確認」）
// 撤回之後不能復原，所以先問一次；可以順便寫撤回原因（選填）
// 這個元件只負責「問」，真的去撤回是頁面的工作：按「確認撤回」會送出 confirm 事件
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

defineProps({
  // 撤回還在路上時傳 true，按鈕先不能按，避免連按兩次
  pending: { type: Boolean, default: false },
})

// confirm：按了「確認撤回」，會把撤回原因傳出去（沒寫就是空字串）
const emit = defineEmits(['confirm'])

// 彈窗是開還是關。頁面用 v-model:open 綁定
const open = defineModel('open', { type: Boolean, default: false })

// 輸入框裡的撤回原因
const reason = ref('')

// 每次打開彈窗都把上次打的原因清掉
watch(open, (isOpen) => {
  if (isOpen) reason.value = ''
})
</script>

<template>
  <Dialog v-model:open="open">
    <!-- 設計稿沒有右上角的叉叉，用「取消」關閉；點彈窗外面也可以關 -->
    <!-- @open-auto-focus.prevent：打開時不要自動把游標放進輸入框（不然手機的鍵盤會馬上跳出來），點了輸入框才開始打字 -->
    <DialogContent :show-close-button="false" class="gap-3.5 p-5" @open-auto-focus.prevent>
      <!-- 結尾的 ! 是「一定要用這個」：DialogTitle 本身有預設的字級，要蓋過它 -->
      <DialogTitle class="type-card-title!">撤回這則通報？</DialogTitle>
      <DialogDescription class="type-body!">撤回後管委會將停止處理本單，無法復原</DialogDescription>
      <!-- aria-label：輸入框沒有另外的標題文字，這是給螢幕閱讀器念的名稱 -->
      <!-- maxlength：原因最多 50 個字 -->
      <Input v-model="reason" aria-label="撤回原因" placeholder="撤回原因（選填）" maxlength="50" />
      <div class="flex gap-3">
        <!-- DialogClose：包住的按鈕按下去就會關閉彈窗 -->
        <DialogClose as-child>
          <Button variant="outline" class="flex-1">取消</Button>
        </DialogClose>
        <!-- trim()：去掉頭尾的空白 -->
        <Button variant="destructive" class="flex-1" :disabled="pending" @click="emit('confirm', reason.trim())">
          確認撤回
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
