<script setup>
// 管委會端的案件卡（對應 Figma 的 Admin/Case Card）
// 第一行標題＋狀態徽章＋›；第二行地點；第三行一句說明（誰、什麼時候、做到哪裡）
import { computed } from 'vue'
import { ChevronRightIcon } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { caseStatusBadge } from './caseStatusBadge'

const props = defineProps({
  // getCases() 回傳的其中一筆
  item: { type: Object, required: true },
  // 點卡片要連到哪一頁
  to: { type: String, default: '' },
})

// 狀態徽章的規則放在 caseStatusBadge.js，案件詳情頁也用同一份
const statusBadge = computed(() => caseStatusBadge(props.item))
</script>

<template>
  <RouterLink :to="to" class="block space-y-3 rounded-xl bg-card p-4 shadow-card">
    <!-- 第一行：標題、狀態徽章、›（徽章放在箭頭左邊，dev-guide 第 5 節） -->
    <div class="flex items-start gap-2">
      <h3 class="min-w-0 flex-1 type-card-title text-foreground">{{ item.title }}</h3>
      <!-- mt-0.5、mt-1：徽章和箭頭對齊標題第一行 -->
      <Badge :variant="statusBadge.variant" class="mt-0.5 shrink-0">{{ statusBadge.text }}</Badge>
      <ChevronRightIcon class="mt-1 size-4 shrink-0" />
    </div>
    <div>
      <Badge variant="outline">{{ item.areaName }}</Badge>
    </div>
    <!-- 第三行：假 API 算好的說明（cases.js 的 caseCardHint，和待辦卡同一套），只顯示一行，太長用「…」截掉 -->
    <p class="truncate type-body text-muted-foreground">{{ item.hint }}</p>
  </RouterLink>
</template>
