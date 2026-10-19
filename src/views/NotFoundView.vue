<script setup>
// 找不到頁面：網址打錯時顯示
// 在某一端裡打錯（例如 /committee/abc）會有那一端的外框，「回首頁」回那一端的首頁
// 整個網址都打錯（例如 /abc）沒有外框，「回首頁」回角色選擇頁
import FeedbackState from '@/components/feedback/FeedbackState.vue'
</script>

<template>
  <div class="mx-auto max-w-md">
    <FeedbackState kind="page-not-found" />
  </div>
</template>
