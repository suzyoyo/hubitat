<script setup>
// 附件的照片格：一排三格（照片格 report/ReportPhotoTile），最後一格是「新增」，下面一行說明
// 用法：<CaseAttachmentList v-model="files" />，files 是檔名的陣列，例如 ['IMG_0421.jpg', '報告.pdf']
// 快速留存、回報完成、交辦回報用。2026-10-19 從「一列一個檔案」改成和新增通報一樣的照片格，格子裡直接顯示照片、不顯示檔名
// 和新增通報（report/ReportPhotoGrid）不同的地方：可以選 PDF、上限由頁面決定、說明文字不同
import ReportPhotoTile from '@/components/report/ReportPhotoTile.vue'
import { addPickedFiles } from '@/lib/filePreview'

const props = defineProps({
  // 最多幾個檔案；頁面標題旁的「2/5」也用同一個數字
  max: { type: Number, default: 5 },
})

// 目前加入的檔名，頁面用 v-model 綁定
const files = defineModel({ type: Array, default: () => [] })

// 加入剛選的檔案（可以一次好幾個）：影片太大、超過上限的不收，選的照片會暫存起來顯示在格子裡
function add(picked) {
  files.value = addPickedFiles(files.value, picked, props.max)
}

// 刪掉第 index 個：filter 留下「不是第 index 個」的
function remove(index) {
  files.value = files.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="space-y-2">
    <div class="grid grid-cols-3 gap-2.5">
      <ReportPhotoTile v-for="(name, index) in files" :key="name + index" :name="name" @remove="remove(index)" />
      <!-- 還沒滿才能新增；accept 多了 PDF -->
      <ReportPhotoTile v-if="files.length < max" type="add" accept="image/*,video/*,application/pdf" @pick="add" />
    </div>
    <p class="type-date text-muted-foreground">最多 {{ max }} 個檔案，支援照片、影片與 PDF</p>
  </div>
</template>
