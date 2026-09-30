<script setup>
// 進度元件：stepper, progress
import { CheckIcon } from '@lucide/vue'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'

// 報修閉環的四個階段
const steps = [
  { step: 1, title: '已送出', description: '住戶提交報修' },
  { step: 2, title: '已派工', description: '管委會指派廠商' },
  { step: 3, title: '施工中', description: '廠商到場處理' },
  { step: 4, title: '已完成', description: '住戶確認結案' },
]
const currentStep = ref(2)

const progress = ref(40)

// 每按一次多 20%，到 100% 後從 0 重新開始
function addProgress() {
  progress.value = progress.value >= 100 ? 0 : progress.value + 20
}
</script>

<template>
  <section id="progress" class="scroll-mt-40 space-y-6">
    <h2 class="text-lg font-bold">進度</h2>

    <!-- Stepper：直向排列，適合手機顯示報修進度 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Stepper（報修進度）</h3>
      <Stepper v-model="currentStep" orientation="vertical" class="flex-col">
        <StepperItem
          v-for="item in steps"
          :key="item.step"
          :step="item.step"
          class="relative w-full items-start gap-4"
        >
          <!-- 步驟之間的連接線（最後一步不需要）；left 對準圓圈中心 -->
          <StepperSeparator
            v-if="item.step !== steps.length"
            class="absolute top-10 left-[19px] h-[calc(100%-2.5rem)] w-0.5 bg-muted group-data-[state=completed]:bg-primary"
          />
          <!-- flex-row：覆蓋元件預設的 flex-col，讓圓圈和文字左右排列 -->
          <StepperTrigger class="flex-row items-start gap-3 text-left">
            <StepperIndicator class="shrink-0 border bg-background">
              <!-- 已完成的步驟顯示打勾，其他顯示數字 -->
              <CheckIcon v-if="item.step < currentStep" class="size-4" />
              <span v-else>{{ item.step }}</span>
            </StepperIndicator>
            <div class="pb-6">
              <StepperTitle class="text-sm font-medium">{{ item.title }}</StepperTitle>
              <StepperDescription class="text-xs text-muted-foreground">
                {{ item.description }}
              </StepperDescription>
            </div>
          </StepperTrigger>
        </StepperItem>
      </Stepper>
      <p class="text-xs text-muted-foreground">點任一步驟可以切換；目前在第 {{ currentStep }} 步</p>
    </div>

    <!-- Progress：進度條，值是 0～100 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Progress（進度條）</h3>
      <Progress :model-value="progress" />
      <div class="flex items-center justify-between">
        <span class="text-sm">{{ progress }}%</span>
        <Button size="sm" variant="outline" @click="addProgress">增加進度</Button>
      </div>
    </div>
  </section>
</template>
