<script setup>
// App 外框：三端共用。上面是頂部列，下面是底部導覽，中間放各頁內容
import { computed } from 'vue'
import AppHeader from '@/components/app/AppHeader.vue'
import BottomNav from '@/components/app/BottomNav.vue'
import { getRole } from '@/config/roles'

const props = defineProps({
  // 由路由傳進來：resident / committee / staff
  roleId: { type: String, required: true },
})

const role = computed(() => getRole(props.roleId))
const basePath = computed(() => `/${props.roleId}`)
</script>

<template>
  <!-- 只做手機版：寬螢幕上限制最大寬度並置中 -->
  <div class="mx-auto min-h-dvh max-w-md bg-background">
    <AppHeader :notifications-to="`${basePath}/notifications`" />
    <!-- pb-32：留空間給固定在底部的導覽列，內容才不會被蓋住 -->
    <main class="pb-32">
      <!-- RouterView：目前網址對應的頁面會顯示在這裡 -->
      <RouterView />
    </main>
    <BottomNav :base-path="basePath" :tabs="role.tabs" :fab="role.fab" />
  </div>
</template>
