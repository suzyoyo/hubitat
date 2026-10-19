<script setup>
// 元件盤點頁：把 shadcn-vue 元件依類別陳列，方便看外觀與用法
// 每個類別拆成一個檔案，放在 ./playground/ 資料夾
import { ArrowLeftIcon } from '@lucide/vue'
import { useEventListener } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import BasicSection from './playground/BasicSection.vue'
import MobileSection from './playground/MobileSection.vue'
import FormSection from './playground/FormSection.vue'
import ProgressSection from './playground/ProgressSection.vue'
import ListSection from './playground/ListSection.vue'
import MockSection from './playground/MockSection.vue'
import StateSection from './playground/StateSection.vue'
import TokenSection from './playground/TokenSection.vue'

// 頂部快速跳轉用的清單；id 要和各 section 的 id 一致
const categories = [
  { id: 'token', label: '設計 Token' },
  { id: 'basic', label: '基礎' },
  { id: 'mobile', label: '手機互動' },
  { id: 'form', label: '表單' },
  { id: 'progress', label: '進度' },
  { id: 'list', label: '清單' },
  { id: 'state', label: '狀態畫面' },
  { id: 'mock', label: '假資料' },
]

// 現在看到哪一區：上方對應的分類按鈕變成品牌藍
const header = ref(null)
const nav = ref(null)
const current = ref('token')

// 最後一個「頂端已經捲到標題列下面」的區塊，就是現在在看的；捲到最底時算最後一區
function updateCurrent() {
  const line = header.value.getBoundingClientRect().bottom + 24
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
  let found = categories[0].id
  for (const { id } of categories) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= line) found = id
  }
  current.value = atBottom ? categories.at(-1).id : found
}

useEventListener(window, 'scroll', updateCurrent, { passive: true })
onMounted(updateCurrent)

// 分類按鈕超出畫面時，左右捲動讓現在的那顆看得到
watch(current, (id) => {
  const chip = nav.value?.querySelector(`[href="#${id}"]`)
  if (!chip) return
  nav.value.scrollTo({ left: chip.offsetLeft - 16, behavior: 'smooth' })
})
</script>

<template>
  <!-- 手機優先：最大寬度限制在 md（約 448px），置中顯示 -->
  <div class="mx-auto min-h-screen max-w-md bg-background">
    <!-- 頂部：標題 + 分類跳轉（sticky 讓它捲動時固定在上方） -->
    <header ref="header" class="sticky top-0 z-10 border-b bg-background/95 px-4 pt-4 backdrop-blur">
      <!-- 返回按鈕＋標題；手機上沒有瀏覽器的上一頁，靠這顆回角色選擇頁 -->
      <div class="flex items-center gap-1">
        <!-- 44px 是可點擊範圍；-ml-3 讓箭頭對齊下面的文字 -->
        <RouterLink
          to="/"
          aria-label="返回角色選擇"
          class="-ml-3 flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeftIcon class="size-5" />
        </RouterLink>
        <h1 class="text-xl font-bold">元件盤點</h1>
      </div>
      <p class="text-sm text-muted-foreground">好彼社區 · shadcn-vue 首批元件</p>
      <!-- overflow-x-auto：手機寬度不夠時可以左右滑動 -->
      <!-- 現在在看的那區是品牌藍；其他的按下去會變灰（手機上沒有 hover） -->
      <nav ref="nav" class="relative -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-3">
        <a
          v-for="category in categories"
          :key="category.id"
          :href="`#${category.id}`"
          class="shrink-0 rounded-full border px-4 py-2.5 text-sm"
          :class="
            current === category.id
              ? 'border-primary bg-primary font-bold text-primary-foreground'
              : 'bg-card hover:bg-muted active:bg-muted'
          "
          :aria-current="current === category.id ? 'true' : undefined"
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
      <StateSection />
      <MockSection />
    </main>
  </div>
</template>
