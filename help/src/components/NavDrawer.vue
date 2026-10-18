<script setup>
// 平板、手機的側邊抽屜：主要連結＋身分切換＋文章導覽
// 用 reka-ui 的 Dialog：打開時焦點移進抽屜、按 Tab 不會跑到背後的頁面、按 Esc 或點外面就關掉，
// 關掉後焦點回到「打開選單」按鈕。畫面上寫「選單」，給螢幕閱讀器的名稱是「主要導覽」，並標示 aria-modal
import { XIcon } from '@lucide/vue'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { useRoute } from 'vue-router'
import ArticleNav from './ArticleNav.vue'
import { MAIN_LINKS } from './links'
import RoleSwitcher from './RoleSwitcher.vue'

const open = defineModel('open', { type: Boolean, default: false })
const route = useRoute()
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-brand-950/40" />
      <DialogContent
        aria-modal="true"
        class="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,340px)] flex-col bg-white shadow-xl focus:outline-none"
      >
        <div class="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <!-- 畫面上寫「選單」；螢幕閱讀器念的名稱是「主要導覽」（DialogTitle 只給螢幕閱讀器） -->
          <p class="text-lg font-bold text-brand-900" aria-hidden="true">選單</p>
          <DialogTitle class="sr-only">主要導覽</DialogTitle>
          <DialogDescription class="sr-only">切換身分、選擇要看的教學</DialogDescription>
          <DialogClose
            class="grid size-11 place-items-center rounded-lg text-brand-900 hover:bg-brand-50"
            aria-label="關閉選單"
          >
            <XIcon class="size-6" aria-hidden="true" />
          </DialogClose>
        </div>

        <div class="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-4">
          <nav aria-label="網站頁面">
            <ul class="grid grid-cols-2 gap-2">
              <li v-for="link in MAIN_LINKS" :key="link.to">
                <RouterLink
                  :to="link.to"
                  class="flex min-h-11 items-center rounded-lg bg-page px-3 font-medium text-brand-900 hover:bg-brand-50"
                  :class="route.path === link.to && 'bg-brand-50 font-bold'"
                  :aria-current="route.path === link.to ? 'page' : undefined"
                >
                  {{ link.label }}
                </RouterLink>
              </li>
            </ul>
          </nav>

          <div class="mt-6">
            <RoleSwitcher />
          </div>
          <ArticleNav class="mt-4" :active-id="route.params.id" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
