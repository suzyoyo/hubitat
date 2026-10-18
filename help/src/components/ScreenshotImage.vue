<script setup>
// App 截圖：點一下放大看，按 Esc、點外面或「關閉」按鈕關掉
//   shot：{ file: 檔名, alt: 替代文字（說明圖上有什麼）, caption: 圖說（選填） }
//   截圖檔還沒有時，整個元件不顯示（不放假圖）
import { XIcon, ZoomInIcon } from '@lucide/vue'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { computed, ref } from 'vue'
import { screenshotUrl } from '@/lib/screenshots'

const props = defineProps({
  shot: { type: Object, required: true },
})

const url = computed(() => screenshotUrl(props.shot.file))
const open = ref(false)
</script>

<template>
  <figure v-if="url" class="mx-auto w-full max-w-[280px]">
    <DialogRoot v-model:open="open">
      <button
        type="button"
        class="group relative block w-full overflow-hidden rounded-[18px] border border-line bg-white shadow-[var(--shadow-card)]"
        :aria-label="`放大圖片：${shot.alt}`"
        @click="open = true"
      >
        <img :src="url" :alt="shot.alt" loading="lazy" class="block h-auto w-full" width="375" height="812" />
        <span
          class="absolute bottom-2 right-2 flex h-9 items-center gap-1 rounded-full bg-brand-900/85 px-3 text-sm font-medium text-white group-hover:bg-brand-900"
          aria-hidden="true"
        >
          <ZoomInIcon class="size-4" />
          放大
        </span>
      </button>

      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-brand-950/80" />
        <DialogContent
          class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-4 focus:outline-none"
          @click.self="open = false"
        >
          <DialogTitle class="sr-only">放大的截圖</DialogTitle>
          <DialogDescription class="sr-only">{{ shot.alt }}</DialogDescription>
          <img
            :src="url"
            :alt="shot.alt"
            class="max-h-[calc(100dvh-7rem)] w-auto max-w-full rounded-2xl bg-white"
          />
          <DialogClose
            class="flex h-12 items-center gap-2 rounded-full bg-white px-6 font-bold text-brand-900 hover:bg-brand-50"
          >
            <XIcon class="size-5" aria-hidden="true" />
            關閉
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
    <figcaption v-if="shot.caption" class="mt-2 text-center text-[15px] text-muted">{{ shot.caption }}</figcaption>
  </figure>
</template>
