<script setup>
// 不存在的網址
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div class="page-container py-12">
    <h1 class="sr-only">找不到這一頁</h1>
    <EmptyState title="找不到這一頁" description="網址可能打錯了。可以回到首頁，或用搜尋找教學。">
      <RouterLink to="/" class="btn btn-primary">回使用指南首頁</RouterLink>
      <RouterLink to="/search" class="btn btn-secondary">搜尋教學</RouterLink>
    </EmptyState>
  </div>
</template>
