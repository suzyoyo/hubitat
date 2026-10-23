<script setup>
// 加入管委會・確認邀請：看清楚是誰邀請、加入哪一屆、可以做什麼，再決定接受或婉拒
import { ref } from 'vue'
import { UsersIcon } from '@lucide/vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatFullDate } from '@/lib/date'

defineProps({
  // 用邀請碼查到的邀請（假 API getInviteByCode 回傳的）
  invite: { type: Object, required: true },
  // 接受或婉拒還在路上時傳 true，按鈕先不能按，避免連按兩次
  pending: { type: Boolean, default: false },
})

// accept：按了「接受邀請」；decline：在彈窗裡按了「確認婉拒」
defineEmits(['accept', 'decline'])

// 婉拒的確認彈窗是開還是關
const declineOpen = ref(false)
</script>

<template>
  <div class="space-y-4 text-center">
    <div class="mx-auto flex size-18 items-center justify-center rounded-xl bg-muted">
      <UsersIcon class="size-6" />
    </div>
    <h2 class="type-title text-foreground">{{ invite.inviterName }}邀請你加入管委會</h2>
    <p class="type-body text-muted-foreground">接受後，會在任期開始日自動取得權限</p>

    <!-- 邀請的內容：職稱、第幾屆、任期 -->
    <div class="space-y-2.5 rounded-xl bg-card p-4 text-left shadow-card">
      <!-- 職稱只是分類，用灰色徽章 -->
      <Badge variant="outline">{{ invite.roleLabel }}</Badge>
      <p class="type-card-title text-foreground">第 {{ invite.term }} 屆管理委員會</p>
      <p class="type-date text-muted-foreground">
        {{ formatFullDate(invite.startDate) }} 生效・任期至 {{ formatFullDate(invite.endDate) }}
      </p>
    </div>

    <Alert class="text-left">
      <AlertTitle>{{ invite.roleLabel }}可以做的事</AlertTitle>
      <!-- 一般委員不能新增交辦，結案也不評分廠商（docs/permissions.md），所以只寫這兩項 -->
      <AlertDescription>簽核提案、查看管委會會議紀錄</AlertDescription>
    </Alert>

    <div class="space-y-4">
      <Button class="w-full" :disabled="pending" @click="$emit('accept')">接受邀請</Button>
      <Button variant="outline" class="w-full" :disabled="pending" @click="declineOpen = true">婉拒</Button>
    </div>

    <!-- 婉拒之後邀請碼就不能再用，所以先問一次 -->
    <Dialog v-model:open="declineOpen">
      <!-- 沒有右上角的叉叉，用「取消」關閉；點彈窗外面也可以關 -->
      <DialogContent :show-close-button="false" class="gap-3.5 p-5">
        <!-- 結尾的 ! 是「一定要用這個」：DialogTitle 本身有預設的字級，要蓋過它 -->
        <DialogTitle class="type-card-title!">婉拒這次邀請？</DialogTitle>
        <DialogDescription class="type-body!">
          婉拒後這組邀請碼就不能再使用，之後想加入要請主委重新提供
        </DialogDescription>
        <div class="flex gap-3">
          <!-- DialogClose：包住的按鈕按下去就會關閉彈窗 -->
          <DialogClose as-child>
            <Button variant="outline" class="flex-1">取消</Button>
          </DialogClose>
          <Button variant="destructive" class="flex-1" :disabled="pending" @click="$emit('decline')">
            確認婉拒
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
