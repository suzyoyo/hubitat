<script setup>
// 照片格（對應 Figma 的 Report/Photo Tile），有兩種：
//   preview：一張已經加入的照片，下面有「更換」「刪除」兩個按鈕
//   add：    虛線框的「新增照片」
// 選照片用的是瀏覽器內建的檔案選擇（手機上會問要拍照還是從相簿選）
// 假資料只記照片的檔名，所以預覽的地方先放圖示和檔名，沒有真的顯示照片
import { ImageIcon, PlusIcon } from '@lucide/vue'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

defineProps({
  // 'preview' 或 'add'
  type: { type: String, default: 'preview' },
  // 照片的檔名，例如 '門框.jpg'（preview 才需要）
  name: { type: String, default: '' },
})

// pick：選好一張照片了，會把檔名傳出去（新增和更換都是這個事件）
// remove：按了「刪除」
const emit = defineEmits(['pick', 'remove'])

// fileInput：指向下面那個藏起來的 <input type="file">
const fileInput = ref(null)

// 打開檔案選擇：用程式幫使用者「按」那個藏起來的 input
function openPicker() {
  fileInput.value.click()
}

// 使用者選好檔案之後
function onFileChange(event) {
  const file = event.target.files[0]
  if (file) emit('pick', file.name)
  // 清空 input，下次選同一個檔案時才會再觸發
  event.target.value = ''
}
</script>

<template>
  <!-- 新增照片：整格都可以按 -->
  <button
    v-if="type === 'add'"
    type="button"
    class="flex min-h-[158px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground bg-card type-body text-foreground"
    @click="openPicker"
  >
    <PlusIcon class="size-8" />
    新增照片
    <!-- hidden：藏起來的檔案選擇；accept="image/*" 只能選圖片 -->
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
  </button>

  <!-- 已經加入的照片 -->
  <div v-else class="space-y-2 rounded-xl border border-border bg-card p-2">
    <div class="flex h-[88px] flex-col items-center justify-center gap-1 rounded-xl bg-background px-2 text-muted-foreground">
      <ImageIcon class="size-7 shrink-0" />
      <!-- truncate：檔名太長時用「…」截斷 -->
      <p class="w-full truncate text-center type-date">{{ name }}</p>
    </div>
    <!-- 按鈕高 44px（設計稿 28px），長輩比較好按 -->
    <div class="flex gap-2">
      <Button variant="outline" class="min-w-0 flex-1 px-0" @click="openPicker">更換</Button>
      <Button variant="outline" class="min-w-0 flex-1 px-0" @click="emit('remove')">刪除</Button>
    </div>
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
  </div>
</template>
