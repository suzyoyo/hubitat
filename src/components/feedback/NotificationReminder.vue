<script setup>
// 「開啟通知」提醒卡：放在三端首頁最上面，還沒開通知就一直出現（強烈提醒但不擋）
// 按「先不要」只在這次打開 App 時藏起來，下次打開又會出現
// 按「開啟通知」：還沒問過 → 跳出手機的詢問；之前拒絕過、或手機不支援 → 教他到設定打開
import { BellRingIcon } from '@lucide/vue'
import { ref } from 'vue'
import FeedbackPermissionDialog from '@/components/feedback/FeedbackPermissionDialog.vue'
import { Button } from '@/components/ui/button'

defineProps({
  // 展示用：已經開了通知也顯示
  preview: { type: Boolean, default: false },
})

const DISMISS_KEY = 'notification-reminder-dismissed'

// 瀏覽器有沒有通知功能：iPhone 沒有加入主畫面時就沒有
const supported = 'Notification' in window
// granted：已開啟 / denied：拒絕過 / default：還沒問過 / unsupported：沒有通知功能
const permission = ref(supported ? Notification.permission : 'unsupported')

// sessionStorage：關掉 App 就清空。私密瀏覽等情況可能不能用，所以包在 try 裡
function readDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}
const dismissed = ref(readDismissed())

function dismiss() {
  dismissed.value = true
  try {
    sessionStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // 存不了也沒關係，這次還是會藏起來
  }
}

const dialogOpen = ref(false)

async function enable() {
  if (permission.value === 'default') {
    permission.value = await Notification.requestPermission()
  }
  // 沒開成功（拒絕了、或手機不支援）：教他到設定打開
  if (permission.value !== 'granted') dialogOpen.value = true
}
</script>

<template>
  <template v-if="preview || (permission !== 'granted' && !dismissed)">
    <div class="space-y-3 rounded-xl bg-secondary p-4">
      <div class="flex gap-3">
        <BellRingIcon class="mt-0.5 size-5 shrink-0 text-primary" />
        <div class="space-y-1">
          <p class="type-body-strong text-blue-950">開啟通知，才不會錯過重要消息</p>
          <p class="type-date text-muted-foreground">受理、結案、緊急公告都會用通知告訴你。</p>
        </div>
      </div>
      <div class="flex gap-2">
        <Button variant="ghost" class="flex-1" @click="dismiss">先不要</Button>
        <Button class="flex-1" @click="enable">開啟通知</Button>
      </div>
    </div>
    <FeedbackPermissionDialog v-model:open="dialogOpen" kind="notifications" />
  </template>
</template>
