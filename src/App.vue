<script setup>
import 'vue-sonner/style.css' // Sonner 通知的樣式
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <!-- RouterView：依網址顯示對應的頁面（設定在 src/router/index.js） -->
  <RouterView />
  <!-- 放一次就好，整個 App 的 toast 通知都會顯示在這裡 -->
  <Toaster position="top-center" rich-colors />
</template>
