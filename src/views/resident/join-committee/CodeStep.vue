<script setup>
// 加入管委會・輸入邀請碼：輸入 6 位數的邀請碼，或用相機掃描 QR Code
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { INVITE_CODE_LENGTH } from '@/mocks/data/invites'

defineProps({
  // 邀請碼不能用時要顯示的提示；空字串就是沒有錯
  error: { type: String, default: '' },
  // 正在查邀請碼時是 true
  checking: { type: Boolean, default: false },
})

// scan：按了「開啟相機掃描」
defineEmits(['scan'])

// 邀請碼，頁面用 v-model 綁定
const code = defineModel({ type: String, default: '' })

// 每打一個字就整理一次：只留數字（\D 是「不是數字的字」），最多 6 位
function onInput(value) {
  code.value = String(value).replace(/\D/g, '').slice(0, INVITE_CODE_LENGTH)
}
</script>

<template>
  <div class="space-y-5">
    <div class="space-y-2">
      <!-- for 對應輸入框的 id：點名稱，游標會跳進輸入框 -->
      <Label for="invite-code" class="text-base">
        邀請碼
        <span class="text-warning-strong">*</span>
      </Label>
      <!-- inputmode="numeric"：手機會跳出數字鍵盤 -->
      <!-- aria-invalid：有錯的時候輸入框的外框會變紅 -->
      <Input
        id="invite-code"
        :model-value="code"
        inputmode="numeric"
        autocomplete="off"
        placeholder="請輸入 6 位數字"
        :aria-invalid="error !== ''"
        @update:model-value="onInput"
      />
      <!-- role="alert"：提示一出現，螢幕閱讀器會馬上唸出來 -->
      <p v-if="error" role="alert" class="type-date text-warning-strong">{{ error }}</p>
      <p v-else-if="checking" class="type-date text-muted-foreground">正在確認邀請碼…</p>
    </div>

    <div class="space-y-2">
      <p class="text-base font-medium text-foreground">或掃描 QR Code</p>
      <Button class="w-full" @click="$emit('scan')">開啟相機掃描</Button>
      <p class="type-date text-muted-foreground">
        輸入 6 位數後會自動前往下一步。邀請碼由主委提供，72 小時內有效，只能使用一次
      </p>
    </div>
  </div>
</template>
