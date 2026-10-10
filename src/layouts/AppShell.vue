<script setup>
// App 外框：三端共用。上面是頂部列，下面是底部導覽，中間放各頁內容
// 底部分頁的那幾頁：logo 頂部列＋底部導覽
// 其他頁面（內頁、通知 …）：「返回＋標題」頂部列，沒有底部導覽
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/app/AppHeader.vue'
import BottomNav from '@/components/app/BottomNav.vue'
import { getRole } from '@/config/roles'

const props = defineProps({
  // 由路由傳進來：resident / committee / staff
  roleId: { type: String, required: true },
})

const role = computed(() => getRole(props.roleId))
const basePath = computed(() => `/${props.roleId}`)

// useRoute()：取得目前路由的資訊；meta 是在 router/index.js 設定的
const route = useRoute()
// 目前這一頁是不是底部分頁的其中一頁
const isTab = computed(() => route.meta.isTab)
</script>

<template>
  <!-- 只做手機版：寬螢幕上限制最大寬度並置中 -->
  <div class="mx-auto min-h-dvh max-w-md bg-background">
    <!-- 背景的淡藍光暈：固定在畫面左下角，不會跟著內容捲動，也不會擋到點擊 -->
    <div class="pointer-events-none fixed inset-0 mx-auto max-w-md bg-page-glow" />
    <!-- 分頁不傳 title，顯示 logo；其他頁面傳 title，顯示「返回＋標題」 -->
    <AppHeader
      :title="isTab ? '' : route.meta.pageTitle"
      :notifications-to="`${basePath}/notifications`"
      :home-to="`${basePath}/home`"
    />
    <!-- pb-32：留空間給固定在底部的導覽列，內容才不會被蓋住；沒有導覽列時只留 pb-10 -->
    <!-- relative：讓內容疊在光暈的上面 -->
    <main class="relative" :class="isTab ? 'pb-32' : 'pb-10'">
      <!-- RouterView：目前網址對應的頁面會顯示在這裡 -->
      <RouterView />
    </main>
    <BottomNav v-if="isTab" :base-path="basePath" :tabs="role.tabs" :fab="role.fab" />
  </div>
</template>
