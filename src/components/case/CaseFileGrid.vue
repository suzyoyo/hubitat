<script setup>
// 案件的照片、影片、檔案，排成一排、可以左右滑（案件詳情的「住戶通報」「完工紀錄」、留存詳情用；
//   2026-10-19 從一排兩格改成一排滑動的小方格，比較省空間）
//   有暫存照片、影片的（示範時剛選的，見 src/lib/filePreview.js）顯示縮圖，點了全螢幕看，左右滑換張，影片可以播放；
//   假資料只有檔名的，只顯示圖示（不能點）
//   都不顯示檔名（2026-10-19，和照片格 report/ReportPhotoTile 一樣）；只有 PDF 留檔名，不然分不出是哪份
// 全螢幕的寫法和合約詳情的預覽一樣（views/committee/ContractDetailView.vue）
import { ChevronLeftIcon, ChevronRightIcon, FileTextIcon, ImageIcon, VideoIcon, XIcon } from '@lucide/vue'
import { computed, nextTick, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { isPdfName, isVideoName, previewUrl } from '@/lib/filePreview'

const props = defineProps({
  // 檔名的清單，例如 ['施工前.jpg', '施工後.jpg']
  files: { type: Array, required: true },
  // 全螢幕上方的標題，例如「完工紀錄」
  title: { type: String, default: '' },
  // 滑動時要不要伸到卡片邊緣（2026-10-19，suzy 在 #156 提的）：
  //   預設開，外層是卡片（p-4，16px 內距）時，照片可以滑到卡片邊緣；
  //   外層沒有剛好 16px 內距的（例如處理紀錄裡、日期欄右邊的照片）要關掉，不然會蓋到旁邊
  bleed: { type: Boolean, default: true },
})

// 看副檔名決定圖示：影片用攝影機、PDF 用文件，其他當作照片
function iconOf(name) {
  if (isVideoName(name)) return VideoIcon
  if (isPdfName(name)) return FileTextIcon
  return ImageIcon
}

const tiles = computed(() => props.files.map((name) => ({ name, src: previewUrl(name), isVideo: isVideoName(name) })))
// 看得到的照片和影片（全螢幕只放這些）
const photos = computed(() => tiles.value.filter((tile) => tile.src))

// ── 全螢幕 ─────────────────────────────────
const viewerOpen = ref(false)
const current = ref(0) // 現在看第幾張（從 0 開始）
const track = ref(null) // 橫向捲動的那一排

async function openViewer(name) {
  current.value = photos.value.findIndex((photo) => photo.name === name)
  viewerOpen.value = true
  await nextTick()
  requestAnimationFrame(() => track.value?.scrollTo({ left: current.value * track.value.clientWidth }))
}

// 滑動時，用捲了多遠算出現在是第幾張；換張時把其他正在播的影片暫停
function onScroll() {
  const el = track.value
  if (!el) return
  current.value = Math.round(el.scrollLeft / el.clientWidth)
  // el.children：每一張是一格；不是現在這張的影片就暫停
  Array.from(el.children).forEach((slide, index) => {
    if (index !== current.value) slide.querySelector('video')?.pause()
  })
}

function go(index) {
  track.value?.scrollTo({ left: index * track.value.clientWidth, behavior: 'smooth' })
}
</script>

<template>
  <!-- 一排、超過寬度就左右滑；bleed 時 -mx-4 px-4 讓滑動時可以滑到卡片邊緣，第一格還是和文字對齊 -->
  <div class="flex snap-x gap-2.5 overflow-x-auto pb-1" :class="{ '-mx-4 px-4': bleed }">
    <template v-for="tile in tiles" :key="tile.name">
      <!-- 有照片或影片：縮圖，點了全螢幕 -->
      <button
        v-if="tile.src"
        type="button"
        class="relative size-24 shrink-0 snap-start overflow-hidden rounded-lg bg-muted"
        :aria-label="`看 ${tile.name}`"
        @click="openViewer(tile.name)"
      >
        <!-- 影片：顯示第 0.1 秒的畫面＋左下角攝影機圖示 -->
        <template v-if="tile.isVideo">
          <video :src="`${tile.src}#t=0.1`" muted playsinline preload="metadata" class="size-full object-cover" />
          <VideoIcon class="absolute bottom-1.5 left-1.5 size-4 text-white drop-shadow" />
        </template>
        <img v-else :src="tile.src" alt="" class="size-full object-cover" />
      </button>
      <!-- 只有檔名（假資料、PDF）：放圖示，檔名給螢幕閱讀器念；PDF 分不出是哪份，下面留檔名 -->
      <div
        v-else
        class="flex size-24 shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-lg bg-muted px-2"
        role="img"
        :aria-label="tile.name"
      >
        <component :is="iconOf(tile.name)" class="size-7 text-muted-foreground" />
        <p v-if="isPdfName(tile.name)" class="w-full truncate text-center type-date text-muted-foreground" aria-hidden="true">{{ tile.name }}</p>
      </div>
    </template>
  </div>

  <!-- 全螢幕：深色底、上面是第幾張和關閉，中間左右滑換張，下面是上一張、下一張 -->
  <Dialog v-model:open="viewerOpen">
    <DialogContent
      :show-close-button="false"
      class="flex h-dvh max-w-none flex-col gap-0 rounded-none bg-neutral-900 p-0 text-white ring-0 sm:max-w-none"
    >
      <div class="flex items-center gap-2 px-3 py-2">
        <!-- 結尾的 ! 是「一定要用這個」：DialogTitle 本身有預設的字級，要蓋過它 -->
        <DialogTitle class="min-w-0 flex-1 truncate type-body-strong! text-white">
          {{ title ? `${title}・` : '' }}第 {{ current + 1 }} / {{ photos.length }} 張
        </DialogTitle>
        <DialogDescription class="sr-only">左右滑動可以換張</DialogDescription>
        <DialogClose as-child>
          <Button variant="ghost" size="icon" class="size-11 text-white hover:bg-white/10" aria-label="關閉">
            <XIcon class="size-6" />
          </Button>
        </DialogClose>
      </div>
      <div ref="track" class="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto" @scroll.passive="onScroll">
        <div v-for="photo in photos" :key="photo.name" class="flex w-full shrink-0 snap-center items-center justify-center p-4">
          <!-- 影片：controls 有播放、暫停、進度條；playsinline 讓 iPhone 在這裡播，不會自己跳全螢幕 -->
          <video v-if="photo.isVideo" :src="photo.src" controls playsinline class="max-h-full max-w-full rounded" />
          <img v-else :src="photo.src" :alt="photo.name" class="max-h-full max-w-full rounded" />
        </div>
      </div>
      <div class="flex items-center justify-between px-3 py-3">
        <Button variant="ghost" class="h-11 text-white hover:bg-white/10" :disabled="current === 0" @click="go(current - 1)">
          <ChevronLeftIcon />
          上一張
        </Button>
        <Button
          variant="ghost"
          class="h-11 text-white hover:bg-white/10"
          :disabled="current === photos.length - 1"
          @click="go(current + 1)"
        >
          下一張
          <ChevronRightIcon />
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
