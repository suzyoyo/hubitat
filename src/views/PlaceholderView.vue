<script setup>
// 佔位頁：還沒做的頁面都顯示這一頁（router/index.js 的 views[path] ?? PlaceholderView）
// 給使用者、評審看的是「這個功能準備中」；頁面名稱和網址只在開發時（npm run dev）顯示，方便我們知道是哪一頁
import { useRoute } from 'vue-router'
import FeedbackState from '@/components/feedback/FeedbackState.vue'

// useRoute()：取得目前路由的資訊；meta.title 是在 router/index.js 設定的
const route = useRoute()
// import.meta.env.DEV：npm run dev 時是 true，npm run build 打包後是 false
const isDev = import.meta.env.DEV
</script>

<template>
  <div>
    <FeedbackState kind="coming-soon" />
    <p v-if="isDev" class="type-note px-5 text-center text-muted-foreground">
      開發用：{{ route.meta.title }}・{{ route.path }}
    </p>
  </div>
</template>
