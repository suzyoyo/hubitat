<script setup>
// App 外框：三端共用。上面是頂部列，下面是底部導覽，中間放各頁內容
// 底部分頁的那幾頁：logo 頂部列＋底部導覽
// 其他頁面（內頁、通知 …）：「返回＋標題」頂部列，沒有底部導覽
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/app/AppHeader.vue'
import BottomNav from '@/components/app/BottomNav.vue'
import MockFailBanner from '@/components/app/MockFailBanner.vue'
import OfflineBanner from '@/components/app/OfflineBanner.vue'
import { canUseMenuItem, getRole } from '@/config/roles'
import { fontSize } from '@/lib/fontSize'
import { getCurrentUser, getUnreadCount } from '@/mocks/api'

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

// 住戶選了「大」字：底部分頁那幾頁的內容換成 WCAG 大字（展示用，見 src/lib/fontSize.js）
const largeText = computed(() => props.roleId === 'resident' && isTab.value && fontSize.value === 'large')

// 「＋」跳出的選單裡，這個人看得到的項目（例如一般委員看不到「新增交辦」）
// 要先知道是誰，所以一開始是空的；換到另一端時重新拿
const menuItems = ref([])
watch(
  () => props.roleId,
  async () => {
    menuItems.value = []
    if (!role.value.fab.menu) return
    const user = await getCurrentUser(props.roleId)
    menuItems.value = role.value.fab.menu.filter((item) => canUseMenuItem(item, user))
  },
  { immediate: true },
)

// 有沒有沒讀過的通知：有的話鈴鐺加紅點
// 每次換頁都重新問一次，例如住戶送出通報後切到管委會首頁，紅點就會出現
const hasUnread = ref(false)
watch(
  () => [props.roleId, route.fullPath],
  async () => {
    const user = await getCurrentUser(props.roleId)
    hasUnread.value = (await getUnreadCount(user.id, props.roleId)) > 0
  },
  { immediate: true },
)
</script>

<template>
  <!-- 只做手機版：寬螢幕上限制最大寬度並置中 -->
  <div class="mx-auto min-h-dvh max-w-md bg-background">
    <!-- 背景的淡藍光暈：固定在畫面左下角，不會跟著內容捲動，也不會擋到點擊 -->
    <div class="pointer-events-none fixed inset-0 mx-auto max-w-md bg-page-glow" />
    <!-- 分頁不傳 title，顯示 logo；其他頁面傳 title，顯示「返回＋標題」 -->
    <!-- 頂部列和兩條橫幅（沒網路、假 API 故意失敗）包在一起黏在最上面，往下捲也看得到 -->
    <div class="sticky top-0 z-10">
      <AppHeader
        :title="isTab ? '' : route.meta.pageTitle"
        :notifications-to="`${basePath}/notifications`"
        :has-unread="hasUnread"
        :home-to="`${basePath}/home`"
      />
      <OfflineBanner />
      <MockFailBanner />
    </div>
    <!-- pb-32：留空間給固定在底部的導覽列，內容才不會被蓋住；沒有導覽列時只留 pb-10 -->
    <!-- relative：讓內容疊在光暈的上面 -->
    <main class="relative" :class="[isTab ? 'pb-32' : 'pb-10', { 'large-text': largeText }]">
      <!-- RouterView：目前網址對應的頁面會顯示在這裡 -->
      <RouterView />
    </main>
    <BottomNav v-if="isTab" :base-path="basePath" :tabs="role.tabs" :fab="role.fab" :menu-items="menuItems" />
  </div>
</template>
