<script setup>
// 底部導覽：左邊是半透明白色膠囊分頁列，右邊是圓形「＋」按鈕
// 顏色都來自 src/style.css 的變數（--nav、--nav-active、--fab …）
import { PlusIcon } from '@lucide/vue'
import { computed } from 'vue'

const props = defineProps({
  // 這一端的網址開頭，例如 /resident
  basePath: { type: String, required: true },
  // 分頁清單，來自 src/config/roles.js
  tabs: { type: Array, required: true },
  // 「＋」按鈕的設定
  fab: { type: Object, required: true },
})

// 分頁超過 3 個（管委會、管理人員）時用緊湊版：字和按鈕都小一點
const compact = computed(() => props.tabs.length > 3)
</script>

<template>
  <!-- fixed：固定在畫面底部；max-w-md + mx-auto：和頁面內容一樣置中 -->
  <!-- pb 用 max()：避開 iPhone 底部的橫條（safe-area-inset-bottom） -->
  <div
    class="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md items-center pt-2 pb-[max(20px,env(safe-area-inset-bottom))] pl-5"
    :class="compact ? 'gap-3 pr-5' : 'gap-6 pr-[27px]'"
  >
    <nav
      class="flex min-w-0 flex-1 items-stretch rounded-full border border-nav-border bg-nav p-1 text-nav-foreground shadow-nav"
      :class="compact ? '' : 'h-[70px]'"
    >
      <!-- 一般分頁的文字顏色設在外層 nav 上；active-class 是「目前分頁」才會加上的 class -->
      <RouterLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="`${basePath}/${tab.path}`"
        class="flex min-w-0 flex-1 flex-col items-center justify-center rounded-full whitespace-nowrap"
        :class="compact ? 'py-2 type-label' : 'type-nav'"
        active-class="bg-nav-active text-nav-active-foreground shadow-nav-active"
      >
        <!-- component :is：依資料決定要顯示哪一個圖示元件 -->
        <!-- shrink-0：空間不夠時也不要把圖示壓小 -->
        <component :is="tab.icon" class="size-6 shrink-0" />
        <span>{{ tab.label }}</span>
      </RouterLink>
    </nav>

    <RouterLink
      :to="`${basePath}/${fab.path}`"
      :aria-label="fab.title"
      class="flex shrink-0 flex-col items-center justify-center rounded-full border border-nav-border bg-fab type-nav text-fab-foreground shadow-fab"
      :class="compact ? 'size-14' : 'size-[68px]'"
    >
      <PlusIcon :class="compact ? 'size-6' : 'size-[26px]'" />
      <!-- 只有住戶端的按鈕上有文字「通報」 -->
      <span v-if="fab.text">{{ fab.text }}</span>
    </RouterLink>
  </div>
</template>
