<script setup>
// 住戶端・通報詳情：看一筆通報的處理進度，也可以補充說明、換照片或撤回
import { useRoute } from 'vue-router'

// useRoute()：取得目前路由的資訊
// 網址是 /resident/reports/:id，所以 route.params.id 就是這筆通報的編號
const route = useRoute()
</script>

<template>
  <div class="px-5 pt-4">
    <p>通報詳情：{{ route.params.id }}</p>
  </div>
</template>
