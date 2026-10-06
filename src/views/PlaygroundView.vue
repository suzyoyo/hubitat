<script setup>
// 元件盤點頁：把 shadcn-vue 元件依類別陳列，方便看外觀與用法
// 每個類別拆成一個檔案，放在 ./playground/ 資料夾
import BasicSection from './playground/BasicSection.vue'
import MobileSection from './playground/MobileSection.vue'
import FormSection from './playground/FormSection.vue'
import ProgressSection from './playground/ProgressSection.vue'
import ListSection from './playground/ListSection.vue'
import MockSection from './playground/MockSection.vue'
import TokenSection from './playground/TokenSection.vue'

// 頂部快速跳轉用的清單；id 要和各 section 的 id 一致
const categories = [
  { id: 'token', label: '設計 Token' },
  { id: 'basic', label: '基礎' },
  { id: 'mobile', label: '手機互動' },
  { id: 'form', label: '表單' },
  { id: 'progress', label: '進度' },
  { id: 'list', label: '清單' },
  { id: 'mock', label: '假資料' },
]
</script>

<template>
  <!-- 手機優先：最大寬度限制在 md（約 448px），置中顯示 -->
  <div class="mx-auto min-h-screen max-w-md bg-background">
    <!-- 頂部：標題 + 分類跳轉（sticky 讓它捲動時固定在上方） -->
    <header class="sticky top-0 z-10 border-b bg-background/95 px-4 pt-4 backdrop-blur">
      <h1 class="text-xl font-bold">元件盤點</h1>
      <p class="text-sm text-muted-foreground">好彼社區 · shadcn-vue 首批元件</p>
      <!-- overflow-x-auto：手機寬度不夠時可以左右滑動 -->
      <nav class="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-3">
        <a
          v-for="category in categories"
          :key="category.id"
          :href="`#${category.id}`"
          class="shrink-0 rounded-full border bg-card px-4 py-2.5 text-sm hover:bg-muted"
        >
          {{ category.label }}
        </a>
      </nav>
    </header>

    <main class="space-y-10 px-4 py-6">
      <TokenSection />
      <BasicSection />
      <MobileSection />
      <FormSection />
      <ProgressSection />
      <ListSection />
      <MockSection />
    </main>
  </div>
</template>
