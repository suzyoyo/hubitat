<script setup>
// 選單的一列：左邊圖示、中間標題（下面可以多一行說明）、右邊箭頭（對應 Figma 的 App/Menu Item）
// 用法：把圖示放在標籤中間，例如
//   <MenuItem title="通知設定" to="/resident/me/notifications"><BellIcon /></MenuItem>
import { ChevronRightIcon } from '@lucide/vue'
import { RouterLink } from 'vue-router'

defineProps({
  title: { type: String, required: true },
  // 標題下面的灰色說明；不傳就只有一行
  description: { type: String, default: '' },
  // 點了要連到哪一頁；不傳就只是一列文字，不能點、也沒有箭頭
  to: { type: String, default: '' },
})
</script>

<template>
  <!-- 有 to 就是連結（RouterLink），沒有就是一般的 div -->
  <!-- py-3.5 加上文字的行高，一列至少 52px，超過 44px 好按 -->
  <!-- [&>svg]:size-5：放進來的圖示固定 20px -->
  <component
    :is="to ? RouterLink : 'div'"
    :to="to || undefined"
    class="flex items-center gap-3 py-3.5 [&>svg]:size-5 [&>svg]:shrink-0"
  >
    <slot />
    <div class="min-w-0 flex-1">
      <p class="type-body">{{ title }}</p>
      <p v-if="description" class="type-date text-muted-foreground">{{ description }}</p>
    </div>
    <ChevronRightIcon v-if="to" />
  </component>
</template>
