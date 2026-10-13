<script setup>
// 照片／影片的那一區：一排三格的照片格，下面一行說明。新增通報和通報詳情共用，兩頁才會長得一樣
// 用法：<ReportPhotoGrid v-model="photos" />，photos 是檔名的陣列，例如 ['門框.jpg', '異音.mp4']
import ReportPhotoTile from '@/components/report/ReportPhotoTile.vue'
import { REPORT_PHOTO_MAX, REPORT_VIDEO_MAX_MB } from '@/lib/report'

// 目前加入的檔名，頁面用 v-model 綁定
const photos = defineModel({ type: Array, default: () => [] })

// 加一個。不直接改原本的陣列，而是做一個新的再放回去，頁面才會收到通知
function addPhoto(fileName) {
  photos.value = [...photos.value, fileName]
}

// 刪掉第 index 個（index 從 0 開始）：filter 留下「不是第 index 個」的
function removePhoto(index) {
  photos.value = photos.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="space-y-2">
    <!-- grid-cols-3：一排三格，剛好放得下上限的 3 個 -->
    <div class="grid grid-cols-3 gap-2.5">
      <!-- v-for 的 (photo, index)：index 是第幾個，從 0 開始 -->
      <ReportPhotoTile v-for="(photo, index) in photos" :key="photo + index" :name="photo" @remove="removePhoto(index)" />
      <!-- 還沒滿才顯示「新增」 -->
      <ReportPhotoTile v-if="photos.length < REPORT_PHOTO_MAX" type="add" @pick="addPhoto" />
    </div>
    <p class="type-date text-muted-foreground">
      照片和影片合計最多 {{ REPORT_PHOTO_MAX }} 個，每段影片 {{ REPORT_VIDEO_MAX_MB }}MB 以內。建議拍下故障部位或整體環境，請避免拍到人臉與車牌。
    </p>
  </div>
</template>
