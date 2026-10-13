<script setup>
// 新增通報流程最上面的進度（對應 Figma 的 Report/Flow Progress）
// 左邊是這一步的名稱，右邊是百分比，下面是進度條。一共 5 步，每一步 20%
import { computed } from 'vue'
import { Progress } from '@/components/ui/progress'

const props = defineProps({
  // 現在是第幾步：1～5
  step: { type: Number, required: true },
})

// 每一步的名稱，照順序排
const STEP_LABELS = ['選擇地點', '確認是否重複', '選擇類型', '描述問題', '確認送出']

const label = computed(() => STEP_LABELS[props.step - 1]) // 陣列從 0 開始數，所以要減 1
const percent = computed(() => props.step * 20)
</script>

<template>
  <div class="space-y-2 bg-card px-5 pt-2 pb-3">
    <div class="flex items-center gap-2 type-body-strong">
      <p class="min-w-0 flex-1 text-muted-foreground">{{ label }}</p>
      <p class="text-foreground">{{ percent }}%</p>
    </div>
    <!-- h-2：進度條高 8px；bg-primary/20：還沒走到的部分是淡藍色 -->
    <Progress :model-value="percent" class="h-2 bg-primary/20" />
  </div>
</template>
