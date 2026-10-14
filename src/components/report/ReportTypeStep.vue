<script setup>
// 新增通報・第 3 步：選類型（住戶端、管委會端的新增通報共用）
// 兩種選一種：公共設施問題（公開）、涉及住戶行為（保密）。這個選擇決定其他住戶看不看得到這筆通報
import { LockIcon, UsersIcon } from '@lucide/vue'
import FeedbackHaobiTip from '@/components/feedback/FeedbackHaobiTip.vue'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { REPORT_TYPES } from '@/lib/report'

defineProps({
  // 管委會、管理人員代住戶登記通報時傳 true：說明改成「通報住戶」，不是「你」
  management: { type: Boolean, default: false },
})

// 選到的類型：'public' 公開、'private' 保密，還沒選是空字串。頁面用 v-model 綁定
// 值和假資料的 CASE_VISIBILITY 用同一組（public / private）
const visibility = defineModel({ type: String, default: '' })

// 兩個選項的文字和圖示。類型名稱和「公開處理／保密處理」放在 src/lib/report.js，後面的步驟也會用到
const OPTIONS = [
  {
    value: 'public',
    title: REPORT_TYPES.public.label,
    badge: REPORT_TYPES.public.tag,
    example: '例：設備故障、走道漏水、地下室照明太暗、門禁感應異常',
    icon: UsersIcon,
    note: '會公開給全體住戶，其他住戶可以看到，也能按「我也遇到了」。',
  },
  {
    value: 'private',
    title: REPORT_TYPES.private.label,
    badge: REPORT_TYPES.private.tag,
    example: '例：鄰居深夜噪音、私自違規停車、走廊雜物堆放',
    icon: LockIcon,
    note: '只有管委會與管理室看得到，不會顯示給其他住戶。',
  },
]
</script>

<template>
  <div class="space-y-4">
    <FeedbackHaobiTip
      title="這是哪一類問題？"
      :description="`無論哪一類，${management ? '通報住戶' : '你'}的姓名與戶號都不會被其他住戶看到。`"
    />

    <!-- RadioGroup：一組單選，v-model 會記住選到哪一個 -->
    <RadioGroup v-model="visibility" class="gap-4">
      <!-- 用 label 包住整張卡片：點卡片任何地方，都等於點裡面那個圓圈 -->
      <!-- 選到的那張有藍色外框 -->
      <label
        v-for="option in OPTIONS"
        :key="option.value"
        class="block space-y-3 rounded-xl border bg-card px-4 py-3.5 shadow-card"
        :class="option.value === visibility ? 'border-primary' : 'border-transparent'"
      >
        <span class="flex items-center gap-3">
          <span class="min-w-0 flex-1 space-y-1">
            <span class="flex items-center gap-2">
              <span class="type-greeting text-foreground">{{ option.title }}</span>
              <Badge variant="outline">{{ option.badge }}</Badge>
            </span>
            <span class="block type-date text-muted-foreground">{{ option.example }}</span>
          </span>
          <!-- size-5：圓圈 20px（設計稿 16px），比較看得清楚 -->
          <RadioGroupItem :value="option.value" class="size-5" />
        </span>
        <span class="flex items-center gap-2 rounded-md bg-background px-3 py-2.5">
          <component :is="option.icon" class="size-[18px] shrink-0" />
          <span class="min-w-0 flex-1 type-body text-foreground">{{ option.note }}</span>
        </span>
      </label>
    </RadioGroup>
  </div>
</template>
