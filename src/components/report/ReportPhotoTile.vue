<script setup>
// 照片格（對應 Figma 的 Report/Photo Tile），新增通報和通報詳情共用。有兩種：
//   thumbnail：一個已經加入的照片或影片，下面有「刪除」按鈕
//   add：      虛線框的「新增」，按了可以選照片或影片
// 沒有「更換」：要換的話先刪除再新增，兩頁的操作才會一樣
// 選檔案用的是瀏覽器內建的檔案選擇（手機上會問要拍照、錄影還是從相簿選）
// 假資料只記檔名，所以預覽的地方先放圖示和檔名，沒有真的顯示內容；影片用攝影機的圖示
import { ImageIcon, PlusIcon, VideoIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { REPORT_VIDEO_MAX_MB } from '@/lib/report'

const props = defineProps({
  // 'thumbnail' 或 'add'
  type: { type: String, default: 'thumbnail' },
  // 照片或影片的檔名，例如 '門框.jpg'、'異音.mp4'（thumbnail 才需要）
  name: { type: String, default: '' },
})

// pick：選好一個檔案了，會把檔名傳出去（add 才會送）
// remove：按了「刪除」（thumbnail 才會送）
const emit = defineEmits(['pick', 'remove'])

// 看副檔名判斷是不是影片，例如 .mp4、.mov。/…/i 是「不分大小寫」的比對規則
const isVideo = computed(() => /\.(mp4|mov|m4v|webm|avi)$/i.test(props.name))

// fileInput：指向下面那個藏起來的 <input type="file">
const fileInput = ref(null)

// 打開檔案選擇：用程式幫使用者「按」那個藏起來的 input
function openPicker() {
  fileInput.value.click()
}

// 使用者選好檔案之後
function onFileChange(event) {
  const file = event.target.files[0]
  // 清空 input，下次選同一個檔案時才會再觸發
  event.target.value = ''
  if (!file) return
  // 影片太大就不收，跳出提示。file.size 的單位是位元組，1 MB = 1024 × 1024 位元組
  const tooLarge = file.type.startsWith('video/') && file.size > REPORT_VIDEO_MAX_MB * 1024 * 1024
  if (tooLarge) {
    toast.error('影片太大了', { description: `每段影片請在 ${REPORT_VIDEO_MAX_MB}MB 以內。` })
    return
  }
  emit('pick', file.name)
}
</script>

<template>
  <!-- 新增：整格都可以按。min-h 讓它在還沒有任何檔案時也和 thumbnail 差不多高 -->
  <button
    v-if="type === 'add'"
    type="button"
    class="flex min-h-[154px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-muted-foreground bg-card type-body text-muted-foreground"
    @click="openPicker"
  >
    <PlusIcon class="size-[26px]" />
    新增
    <!-- hidden：藏起來的檔案選擇；accept 限制只能選圖片或影片 -->
    <input ref="fileInput" type="file" accept="image/*,video/*" class="hidden" @change="onFileChange" />
  </button>

  <!-- 已經加入的照片或影片 -->
  <div v-else class="space-y-2 rounded-xl bg-card p-2 shadow-card">
    <div class="flex h-[86px] flex-col items-center justify-center gap-1.5 rounded-lg bg-background px-1 text-muted-foreground">
      <!-- component :is：照片或影片用不同的圖示 -->
      <component :is="isVideo ? VideoIcon : ImageIcon" class="size-7 shrink-0" />
      <!-- truncate：檔名太長時用「…」截斷 -->
      <p class="w-full truncate text-center type-date">{{ name }}</p>
    </div>
    <!-- 用文字按鈕，不用叉叉圖示：長輩比較看得懂。按鈕高 44px -->
    <Button variant="outline" class="w-full px-0" :aria-label="`刪除 ${name}`" @click="emit('remove')">刪除</Button>
  </div>
</template>
