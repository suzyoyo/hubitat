<script setup>
// 照片格（對應 Figma 的 Report/Photo Tile）。所有上傳照片的地方都用它（2026-10-19 統一）：
//   新增通報、通報詳情（ReportPhotoGrid），快速留存、回報完成、交辦回報（case/CaseAttachmentList）
// 有兩種：
//   thumbnail：一個已經加入的檔案，格子裡直接顯示照片（不顯示檔名；PDF 沒有縮圖，例外留檔名），下面有「刪除」按鈕
//   add：      虛線框的「新增」，按了可以選檔案（手機上會問要拍照、錄影還是從相簿選），可以一次選好幾個
// 沒有「更換」：要換的話先刪除再新增
// 假資料只記檔名：示範時剛選的照片、影片暫存在瀏覽器（src/lib/filePreview.js），看得到真的內容；
//   假資料原本的檔案沒有內容，顯示照片、影片或文件的圖示
import { FileTextIcon, ImageIcon, PlusIcon, VideoIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { isPdfName, isVideoName, previewUrl } from '@/lib/filePreview'

const props = defineProps({
  // 'thumbnail' 或 'add'
  type: { type: String, default: 'thumbnail' },
  // 檔名，例如 '門框.jpg'、'異音.mp4'（thumbnail 才需要；畫面上不顯示，給螢幕閱讀器念）
  name: { type: String, default: '' },
  // 可以選哪些檔案（add 才需要），預設照片或影片
  accept: { type: String, default: 'image/*,video/*' },
})

// pick：選好檔案了，把檔案的陣列傳出去（add 才會送）
// remove：按了「刪除」（thumbnail 才會送）
const emit = defineEmits(['pick', 'remove'])

const src = computed(() => previewUrl(props.name))
const isVideo = computed(() => isVideoName(props.name))
const isPdf = computed(() => isPdfName(props.name))
// 沒有內容可以顯示時用的圖示
const icon = computed(() => {
  if (isVideo.value) return VideoIcon
  if (isPdf.value) return FileTextIcon
  return ImageIcon
})

// fileInput：指向下面那個藏起來的 <input type="file">，按「新增」時用程式幫使用者按它
const fileInput = ref(null)

function openPicker() {
  fileInput.value.click()
}

function onFileChange(event) {
  const files = [...event.target.files] // 把選到的檔案變成一般的陣列
  event.target.value = '' // 清空，下次選同一個檔案時才會再觸發
  if (files.length) emit('pick', files)
}
</script>

<template>
  <!-- 新增：整格都可以按。min-h 讓它和已經加入的格子差不多高 -->
  <button
    v-if="type === 'add'"
    type="button"
    class="flex min-h-[154px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-muted-foreground bg-card type-body text-muted-foreground"
    @click="openPicker"
  >
    <PlusIcon class="size-[26px]" />
    新增
    <!-- hidden：藏起來的檔案選擇；multiple：可以一次選好幾個 -->
    <input ref="fileInput" type="file" :accept="accept" multiple class="hidden" @change="onFileChange" />
  </button>

  <!-- 已經加入的檔案 -->
  <div v-else class="space-y-2 rounded-xl bg-card p-2 shadow-card">
    <div class="relative flex h-[86px] items-center justify-center overflow-hidden rounded-lg bg-background text-muted-foreground">
      <!-- 影片：#t=0.1 讓瀏覽器顯示第 0.1 秒的畫面當縮圖；muted、playsinline 讓 iPhone 不會自己全螢幕 -->
      <template v-if="src && isVideo">
        <video :src="`${src}#t=0.1`" muted playsinline preload="metadata" class="size-full object-cover" />
        <VideoIcon class="absolute bottom-1.5 left-1.5 size-4 text-white drop-shadow" />
      </template>
      <!-- 照片：object-cover 把照片裁成格子的大小，不會變形 -->
      <img v-else-if="src" :src="src" :alt="name" class="size-full object-cover" />
      <!-- 沒有內容（假資料、PDF）：放圖示；PDF 沒有縮圖分不出是哪份，下面留檔名（2026-10-19，suzy 在 #153 提的） -->
      <div v-else class="flex w-full flex-col items-center gap-1 px-1" role="img" :aria-label="name">
        <component :is="icon" class="size-7" />
        <p v-if="isPdf" class="w-full truncate text-center type-date" aria-hidden="true">{{ name }}</p>
      </div>
    </div>
    <!-- 用文字按鈕，不用叉叉圖示：長輩比較看得懂。按鈕高 44px -->
    <!-- type="button"：放在 <form> 裡時，按了才不會被當成送出表單 -->
    <Button type="button" variant="outline" class="w-full px-0" :aria-label="`刪除 ${name}`" @click="emit('remove')">
      刪除
    </Button>
  </div>
</template>
