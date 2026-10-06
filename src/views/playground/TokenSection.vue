<script setup>
// 設計 Token：顏色與文字樣式一覽（定義在 src/style.css）
// 注意：Tailwind 只會產生「程式碼裡完整寫出來」的 class，
// 所以下面每個 class 都寫完整名稱，不能用字串拼出來（例如 'bg-' + name）

// 基礎色階
const scales = [
  {
    name: 'blue',
    steps: [
      { step: 50, class: 'bg-blue-50' },
      { step: 100, class: 'bg-blue-100' },
      { step: 200, class: 'bg-blue-200' },
      { step: 300, class: 'bg-blue-300' },
      { step: 400, class: 'bg-blue-400' },
      { step: 500, class: 'bg-blue-500' },
      { step: 600, class: 'bg-blue-600' },
      { step: 700, class: 'bg-blue-700' },
      { step: 800, class: 'bg-blue-800' },
      { step: 900, class: 'bg-blue-900' },
      { step: 950, class: 'bg-blue-950' },
    ],
  },
  {
    name: 'red',
    steps: [
      { step: 50, class: 'bg-red-50' },
      { step: 100, class: 'bg-red-100' },
      { step: 200, class: 'bg-red-200' },
      { step: 300, class: 'bg-red-300' },
      { step: 400, class: 'bg-red-400' },
      { step: 500, class: 'bg-red-500' },
      { step: 600, class: 'bg-red-600' },
      { step: 700, class: 'bg-red-700' },
      { step: 800, class: 'bg-red-800' },
      { step: 900, class: 'bg-red-900' },
      { step: 950, class: 'bg-red-950' },
    ],
  },
  {
    name: 'orange',
    steps: [
      { step: 50, class: 'bg-orange-50' },
      { step: 100, class: 'bg-orange-100' },
      { step: 200, class: 'bg-orange-200' },
      { step: 300, class: 'bg-orange-300' },
      { step: 400, class: 'bg-orange-400' },
      { step: 500, class: 'bg-orange-500' },
      { step: 600, class: 'bg-orange-600' },
      { step: 700, class: 'bg-orange-700' },
      { step: 800, class: 'bg-orange-800' },
      { step: 900, class: 'bg-orange-900' },
      { step: 950, class: 'bg-orange-950' },
    ],
  },
  {
    name: 'gray',
    steps: [
      { step: 50, class: 'bg-gray-50' },
      { step: 100, class: 'bg-gray-100' },
      { step: 200, class: 'bg-gray-200' },
      { step: 300, class: 'bg-gray-300' },
      { step: 400, class: 'bg-gray-400' },
      { step: 500, class: 'bg-gray-500' },
      { step: 600, class: 'bg-gray-600' },
      { step: 700, class: 'bg-gray-700' },
      { step: 800, class: 'bg-gray-800' },
      { step: 900, class: 'bg-gray-900' },
      { step: 950, class: 'bg-gray-950' },
    ],
  },
]

// 語意色：用「用途」命名
const semanticColors = [
  { class: 'bg-background', name: 'background', note: '頁面背景' },
  { class: 'bg-card', name: 'card', note: '卡片底色' },
  { class: 'bg-primary', name: 'primary', note: '品牌主色' },
  { class: 'bg-brand-strong', name: 'brand-strong', note: '品牌深色' },
  { class: 'bg-brand-subtle', name: 'brand-subtle', note: '品牌淺色' },
  { class: 'bg-heading', name: 'heading', note: '大標文字' },
  { class: 'bg-foreground', name: 'foreground', note: '主要文字' },
  { class: 'bg-text-secondary', name: 'text-secondary', note: '卡片內文' },
  { class: 'bg-muted-foreground', name: 'muted-foreground', note: '次要說明' },
  { class: 'bg-border', name: 'border', note: '邊框' },
  { class: 'bg-remind', name: 'remind', note: '提醒' },
  { class: 'bg-remind-subtle', name: 'remind-subtle', note: '提醒淺色' },
  { class: 'bg-warning', name: 'warning', note: '警告' },
  { class: 'bg-warning-subtle', name: 'warning-subtle', note: '警告淺色' },
  { class: 'bg-progress', name: 'progress', note: '進行中' },
  { class: 'bg-success', name: 'success', note: '完成' },
]

// 文字樣式
const textStyles = [
  { class: 'type-title', spec: '22 / 33 粗體', sample: '我的通報' },
  { class: 'type-card-title', spec: '18 / 25 粗體', sample: '1F 大廳｜感應門故障' },
  { class: 'type-greeting', spec: '18 / 24 粗體', sample: '早安！今天有管委會常會喔！' },
  { class: 'type-body', spec: '16 / 24', sample: '住戶反應自動感應門反應遲緩且有摩擦異音。' },
  { class: 'type-body-strong', spec: '16 / 24 中粗', sample: '影響範圍：A 棟前門電梯暫停使用' },
  { class: 'type-link', spec: '16 / 20 中粗', sample: '看全部' },
  { class: 'type-date', spec: '14 / 21', sample: '更新於 9/25 14:30' },
  { class: 'type-button', spec: '14 / 20 粗體', sample: '閱讀完整會議紀錄' },
  { class: 'type-nav', spec: '13 / 21 中粗', sample: '社區檔案' },
  { class: 'type-label', spec: '12 / 16 中粗', sample: '處理中' },
]
</script>

<template>
  <section id="token" class="scroll-mt-40 space-y-6">
    <h2 class="text-lg font-bold">設計 Token</h2>

    <!-- 基礎色階：class 例如 bg-blue-500、text-blue-800 -->
    <div class="space-y-3">
      <h3 class="text-sm font-medium text-muted-foreground">基礎色階（50 → 950）</h3>
      <div v-for="scale in scales" :key="scale.name" class="space-y-1">
        <p class="text-xs">{{ scale.name }}</p>
        <div class="flex overflow-hidden rounded-lg border">
          <div
            v-for="item in scale.steps"
            :key="item.step"
            class="h-10 flex-1"
            :class="item.class"
            :title="`${scale.name}-${item.step}`"
          />
        </div>
      </div>
    </div>

    <!-- 語意色：class 例如 bg-primary、text-heading、border-remind -->
    <div class="space-y-3">
      <h3 class="text-sm font-medium text-muted-foreground">語意色</h3>
      <div class="grid grid-cols-2 gap-3">
        <div v-for="color in semanticColors" :key="color.name" class="flex items-center gap-2">
          <span class="size-10 shrink-0 rounded-lg border" :class="color.class" />
          <div class="min-w-0">
            <p class="truncate text-xs font-medium">{{ color.name }}</p>
            <p class="text-xs text-muted-foreground">{{ color.note }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 文字樣式：一個 class 同時設定字級、行高、粗細 -->
    <div class="space-y-3">
      <h3 class="text-sm font-medium text-muted-foreground">文字樣式（字級 / 行高）</h3>
      <div v-for="style in textStyles" :key="style.class" class="border-b pb-2">
        <p class="text-xs text-muted-foreground">{{ style.class }} · {{ style.spec }}</p>
        <p :class="style.class">{{ style.sample }}</p>
      </div>
    </div>

    <!-- 圓角與陰影 -->
    <div class="space-y-3">
      <h3 class="text-sm font-medium text-muted-foreground">卡片圓角與陰影</h3>
      <div class="rounded-card bg-card p-4 shadow-card">
        <p class="type-card-title">rounded-card + shadow-card</p>
        <p class="type-body text-text-secondary">白底、圓角 20px、帶藍色調的陰影</p>
      </div>
    </div>
  </section>
</template>
