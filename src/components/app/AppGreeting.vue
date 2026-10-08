<script setup>
// 首頁問候列：左邊兩行問候語，右邊是好彼管家（對應 Figma 的 App/Greeting）
import mascotUrl from '@/assets/mascot/pointing.png' // 指著左邊的好彼管家

defineProps({
  // 第一行，例如「早安！今天有」
  title: { type: String, required: true },
  // 第二行，例如「A 棟電梯定期保養喔！」；沒有就只顯示一行
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <!-- items-end：文字和吉祥物都貼齊底部 -->
  <section class="flex items-end gap-3 overflow-hidden rounded-b-3xl bg-header-panel px-5 pt-4">
    <div class="min-w-0 flex-1 space-y-1 pb-5 type-greeting text-blue-800">
      <p>{{ title }}</p>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <!-- 外框 98×88 只露出吉祥物的上半身，超出的部分用 overflow-hidden 裁掉 -->
    <!-- 圖片的位置與大小（百分比）照設計稿，相對於這個外框 -->
    <div class="relative h-[88px] w-[98px] shrink-0 overflow-hidden">
      <img
        :src="mascotUrl"
        alt=""
        width="233"
        height="330"
        class="absolute top-[-20.71%] left-[-8.88%] h-[185.11%] w-[117.78%] max-w-none"
      />
    </div>
  </section>
</template>
