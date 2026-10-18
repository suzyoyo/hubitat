<script setup>
// 附件清單（設計稿「回報完成」的附件卡片 1134:13687）：一列一個檔案（圖示＋檔名＋「刪除」按鈕），下面「＋ 新增」和說明
// 用法：<CaseAttachmentList v-model="files" />，files 是檔名的陣列，例如 ['IMG_0421.jpg', '報告.pdf']
// 案件的完工驗收用，之後交辦的回報完成也可以用
// 假資料只記檔名；示範時選的照片會暫存在瀏覽器記憶體（src/lib/filePreview.js），清單上顯示小縮圖，案件詳情也看得到
// 可以一次選好幾個（2026-10-18），超過上限的不收
import { FileTextIcon, ImageIcon, PlusIcon, VideoIcon } from '@lucide/vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { previewUrl, rememberPreview } from '@/lib/filePreview'
import { REPORT_VIDEO_MAX_MB } from '@/lib/report'

const props = defineProps({
  // 最多幾個檔案；頁面標題旁的「2/5」也用同一個數字
  max: { type: Number, default: 5 },
})

// 目前加入的檔名，頁面用 v-model 綁定
const files = defineModel({ type: Array, default: () => [] })

// 看副檔名決定圖示：影片用攝影機、PDF 用文件，其他當作照片
function iconOf(name) {
  if (/\.(mp4|mov|m4v|webm|avi)$/i.test(name)) return VideoIcon
  if (/\.pdf$/i.test(name)) return FileTextIcon
  return ImageIcon
}

// fileInput：指向下面那個藏起來的 <input type="file">，按「新增」時用程式幫使用者按它
const fileInput = ref(null)

function openPicker() {
  fileInput.value.click()
}

// 使用者選好檔案之後（可以一次好幾個）：影片太大的不收、超過上限的不收，其他加到最後面
function onFileChange(event) {
  const picked = [...event.target.files] // 把選到的檔案變成一般的陣列
  event.target.value = '' // 清空，下次選同一個檔案時才會再觸發
  if (!picked.length) return
  const isTooLarge = (file) => file.type.startsWith('video/') && file.size > REPORT_VIDEO_MAX_MB * 1024 * 1024
  if (picked.some(isTooLarge)) {
    toast.error('影片太大了', { description: `每段影片請在 ${REPORT_VIDEO_MAX_MB}MB 以內，太大的沒有加進來。` })
  }
  const room = props.max - files.value.length // 還可以放幾個
  const accepted = picked.filter((file) => !isTooLarge(file)).slice(0, room)
  if (picked.filter((file) => !isTooLarge(file)).length > room) {
    toast.error(`最多 ${props.max} 個檔案`, { description: `只加了前 ${accepted.length} 個。` })
  }
  accepted.forEach((file) => rememberPreview(file.name, file))
  // 不直接改原本的陣列，做一個新的放回去，頁面才會收到通知
  files.value = [...files.value, ...accepted.map((file) => file.name)]
}

// 刪掉第 index 個：filter 留下「不是第 index 個」的
function remove(index) {
  files.value = files.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="space-y-3">
    <ul v-if="files.length" class="space-y-1">
      <li v-for="(name, index) in files" :key="name + index" class="flex items-center gap-3 pl-3">
        <!-- 有暫存的照片就顯示小縮圖，沒有就用圖示 -->
        <img v-if="previewUrl(name)" :src="previewUrl(name)" alt="" class="size-9 shrink-0 rounded object-cover" />
        <component :is="iconOf(name)" v-else class="size-5 shrink-0 text-foreground" />
        <p class="min-w-0 flex-1 truncate type-body text-foreground">{{ name }}</p>
        <!-- 用文字按鈕，不用叉叉：長輩比較看得懂（和住戶端的照片格一樣）。aria-label 給螢幕閱讀器念 -->
        <Button variant="outline" class="shrink-0" :aria-label="`刪除 ${name}`" @click="remove(index)">刪除</Button>
      </li>
    </ul>
    <!-- 還沒滿才能新增 -->
    <Button v-if="files.length < max" variant="outline" class="w-full" @click="openPicker">
      <PlusIcon />新增
    </Button>
    <!-- hidden：藏起來的檔案選擇；accept 限制只能選圖片、影片或 PDF；multiple 可以一次選好幾個 -->
    <input ref="fileInput" type="file" accept="image/*,video/*,application/pdf" multiple class="hidden" @change="onFileChange" />
    <p class="type-date text-muted-foreground">最多 {{ max }} 個檔案，支援照片、影片與 PDF</p>
  </div>
</template>
