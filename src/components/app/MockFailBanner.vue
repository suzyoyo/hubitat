<script setup>
// 「測試模式：正在模擬連線失敗」的橘色橫幅：開關打開時每一頁都看得到，避免展示前忘了關
// 只有在 /playground 打開開關才會出現；接上真的後端、拿掉假 API 時一起拿掉
// 開關在 /playground 的「狀態畫面」，點橫幅直接過去
import { TriangleAlertIcon } from '@lucide/vue'
import { mockFail } from '@/mocks/api'
</script>

<template>
  <RouterLink
    v-if="mockFail"
    to="/playground#state"
    role="status"
    class="flex items-center gap-2 bg-orange-500 px-5 py-2.5 text-white"
  >
    <TriangleAlertIcon class="size-4 shrink-0" />
    <p class="type-date">測試模式：正在模擬連線失敗，點這裡關閉</p>
  </RouterLink>
</template>
