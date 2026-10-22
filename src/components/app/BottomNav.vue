<script setup>
// 底部導覽：左邊是半透明白色膠囊分頁列，右邊是圓形「＋」按鈕
// 顏色都來自 src/style.css 的變數（--nav、--nav-active、--fab …）
import { PlusIcon, XIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import MenuItem from '@/components/app/MenuItem.vue'
import IconTile from '@/components/common/IconTile.vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const props = defineProps({
  // 這一端的網址開頭，例如 /resident
  basePath: { type: String, required: true },
  // 分頁清單，來自 src/config/roles.js
  tabs: { type: Array, required: true },
  // 「＋」按鈕的設定
  fab: { type: Object, required: true },
  // fab 有 menu 時：這個人看得到的選單項目（外框依權限篩過）
  menuItems: { type: Array, default: () => [] },
})

// 分頁超過 3 個（管委會、管理人員）時用緊湊版：字和按鈕都小一點
const compact = computed(() => props.tabs.length > 3)

// 全域新增選單是開還是關
const menuOpen = ref(false)

// 點灰色的地方：選單本來在「手指按下去」那一刻就關掉，灰色跟著消失，
// 手機在手指離開後才補送「點擊」，就會點到灰色下面的卡片（suzy 在 #131 提醒的）
// 所以按在灰色上時先不關，等灰色自己收到「點擊」才關（灰色的 @click）
function keepOpenOnOverlay(event) {
  if (event.detail.originalEvent.target?.closest?.('[data-fab-overlay]')) event.preventDefault()
}

// 「＋」按鈕的樣子：連結和開選單的按鈕共用
const fabClass = computed(() => [
  'flex shrink-0 flex-col items-center justify-center rounded-full border border-nav-border bg-fab type-nav text-fab-foreground shadow-fab',
  compact.value ? 'size-14' : 'size-[68px]',
])
</script>

<template>
  <!-- fixed：固定在畫面底部；max-w-md + mx-auto：和頁面內容一樣置中 -->
  <!-- pb 用 max()：避開 iPhone 底部的橫條（safe-area-inset-bottom） -->
  <div
    class="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md items-center pt-2 pb-[max(20px,env(safe-area-inset-bottom))] pl-5"
    :class="compact ? 'gap-3 pr-5' : 'gap-6 pr-[27px]'"
  >
    <!-- 毛玻璃（2026-10-18）：半透明底色＋把後面的畫面模糊（backdrop-blur），後面卡片的字才不會和分頁的字疊在一起；
         backdrop-saturate 把模糊後變灰的顏色拉回來。模糊 20px、飽和度 1.8 照 Apple 官網的導覽列；底色是 style.css 的 --nav（白 60%，比 Apple 的 80% 透一點）。不支援模糊的舊瀏覽器只會看到原本的半透明白 -->
    <nav
      class="flex min-w-0 flex-1 items-stretch rounded-full border border-nav-border bg-nav p-1 text-nav-foreground shadow-nav backdrop-blur-[20px] backdrop-saturate-[1.8]"
      :class="compact ? '' : 'h-[70px]'"
    >
      <!-- 一般分頁的文字顏色設在外層 nav 上；active-class 是「目前分頁」才會加上的 class -->
      <!-- data-tour：首頁導覽要亮的地方（app/HomeTour.vue），例如 tab-files -->
      <RouterLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="`${basePath}/${tab.path}`"
        :data-tour="`tab-${tab.path}`"
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

    <!-- 選單打開時，後面的畫面蓋一層灰色（點灰色的地方也會關掉選單）
         放在分頁列和「＋」中間：分頁列、頂部列會被蓋住，「＋」和選單在灰色上面 -->
    <div v-if="menuOpen" data-fab-overlay class="fixed inset-0 bg-black/40" aria-hidden="true" @click="menuOpen = false" />

    <!-- 管委會、管理人員：按下去在按鈕上方跳出全域新增選單；打開時「＋」變成叉叉，再按一次關掉 -->
    <Popover v-if="fab.menu" v-model:open="menuOpen">
      <PopoverTrigger as-child>
        <button type="button" :aria-label="fab.title" :class="[fabClass, 'relative']">
          <component :is="menuOpen ? XIcon : PlusIcon" :class="compact ? 'size-6' : 'size-[26px]'" />
        </button>
      </PopoverTrigger>
      <!-- side="top" align="end"：出現在按鈕上方、靠右對齊 -->
      <PopoverContent
        side="top"
        align="end"
        :side-offset="12"
        @pointer-down-outside="keepOpenOnOverlay"
        class="w-[270px] gap-0 rounded-xl p-2 shadow-card ring-0">
        <!-- 點了任何一項就關掉選單，再換頁 -->
        <MenuItem
          v-for="item in menuItems"
          :key="item.path"
          :title="item.label"
          :to="`${basePath}/${item.path}`"
          class="rounded-lg px-2 hover:bg-muted"
          @click="menuOpen = false"
        >
          <IconTile variant="square">
            <component :is="item.icon" />
          </IconTile>
        </MenuItem>
      </PopoverContent>
    </Popover>

    <!-- 住戶：按下去換到新增通報 -->
    <RouterLink v-else :to="`${basePath}/${fab.path}`" :aria-label="fab.title" data-tour="new-report" :class="fabClass">
      <PlusIcon :class="compact ? 'size-6' : 'size-[26px]'" />
      <!-- 只有住戶端的按鈕上有文字「通報」 -->
      <span v-if="fab.text">{{ fab.text }}</span>
    </RouterLink>
  </div>
</template>
