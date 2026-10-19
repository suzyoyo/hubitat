<script setup>
// 沒有網路時，頂部列下面出現的灰色橫幅
// 放在外框（AppShell）裡，每一頁都會自動有；網路恢復就自動消失
import { WifiOffIcon } from '@lucide/vue'
import { useOnline } from '@vueuse/core'

defineProps({
  // 展示用：不管有沒有網路都顯示
  preview: { type: Boolean, default: false },
})

// useOnline()：瀏覽器有沒有網路，斷線、恢復時會自動變
const online = useOnline()
</script>

<template>
  <!-- role="status"：螢幕閱讀器會唸出來 -->
  <div v-if="!online || preview" role="status" class="flex items-center gap-2 bg-gray-700 px-5 py-2.5 text-white">
    <WifiOffIcon class="size-4 shrink-0" />
    <p class="type-date">目前沒有網路，看到的可能是舊資料</p>
  </div>
</template>
