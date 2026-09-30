<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <!-- Tailwind 測試區塊：確認 class 有生效，Step 6 會換掉 -->
  <div class="m-4 rounded-xl bg-emerald-600 p-4 text-lg font-bold text-white">
    Tailwind 已啟用 ✓
  </div>
  <HelloWorld />
</template>
