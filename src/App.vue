<script setup>
import 'vue-sonner/style.css' // Sonner 通知的樣式
import { Toaster } from '@/components/ui/sonner'
import PlaygroundView from '@/views/PlaygroundView.vue'
</script>

<template>
  <!-- 暫時直接顯示元件盤點頁；Step 7 加入 Vue Router 後改到 /playground -->
  <PlaygroundView />
  <!-- 放一次就好，整個 App 的 toast 通知都會顯示在這裡 -->
  <Toaster position="top-center" rich-colors />
</template>
