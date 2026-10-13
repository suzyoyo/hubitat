<script setup>
// 相似通報卡（對應 Figma 的 Report/Similar Card），新增通報時「確認是否重複」用。有兩種：
//   similar：別人通報過的類似問題，下面有「我也遇到了」按鈕
//   joined： 按了「我也遇到了」之後的完成頁用，沒有按鈕，內容前面多一行「原始通報內容」
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/date'
import { reportBadgeVariant } from '@/lib/report'

const props = defineProps({
  // getSimilarReports() 回傳的其中一筆
  report: { type: Object, required: true },
  // 'similar' 或 'joined'
  type: { type: String, default: 'similar' },
  // 「我也遇到了」還在送出時傳 true，按鈕先不能按，避免連按兩次
  pending: { type: Boolean, default: false },
})

// support：按了「我也遇到了」，會把這筆通報傳出去
defineEmits(['support'])

// 不能按「我也遇到了」的時候，改顯示這句說明；可以按的話是空字串
const note = computed(() => {
  if (props.report.isMine) return '這是你自己通報的'
  if (props.report.hasSupported) return '你已經按過「我也遇到了」'
  return ''
})
</script>

<template>
  <article class="space-y-3 rounded-xl bg-card p-4 shadow-card">
    <div class="flex items-center gap-2">
      <p class="min-w-0 flex-1 type-date text-muted-foreground">{{ formatDate(report.submittedAt) }} 送出</p>
      <Badge variant="outline">{{ report.place }}</Badge>
      <Badge :variant="reportBadgeVariant(report)">{{ report.statusLabel }}</Badge>
    </div>
    <h3 class="type-greeting text-foreground">{{ report.subject }}</h3>
    <div class="space-y-1">
      <p v-if="type === 'joined'" class="type-date text-muted-foreground">原始通報內容</p>
      <p class="type-body text-foreground">{{ report.description }}</p>
    </div>
    <!-- 只有 similar 才有下面這一塊 -->
    <template v-if="type === 'similar'">
      <p v-if="note" class="type-date text-muted-foreground">{{ note }}</p>
      <Button v-else variant="secondary" class="w-full" :disabled="pending" @click="$emit('support', report)">
        我也遇到了
      </Button>
    </template>
  </article>
</template>
