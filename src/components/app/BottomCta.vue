<script setup>
// 固定在畫面底部的按鈕區（對應 Figma 的 App/Bottom CTA）
// 用法：把按鈕放在標籤中間，一個或兩個都可以，會自動平分寬度；加上 vertical 會改成上下排、每個都滿版
//   <BottomCta note="送出後無法修改">
//     <Button variant="outline">取消</Button>
//     <Button>送出</Button>
//   </BottomCta>
// 注意：這一區會蓋住頁面最下面的內容，頁面自己要在底部留空間
//   （例如 pb-24；有 note 那一行、或兩個按鈕上下排時要留多一點，例如 pb-32、pb-40）

defineProps({
  // 按鈕下面的一行灰色說明；不傳就不顯示
  note: { type: String, default: '' },
  // 按鈕要不要上下排（預設是左右排）。完成頁這種「主要動作＋回首頁」的時候用
  vertical: { type: Boolean, default: false },
})
</script>

<template>
  <!-- fixed：固定在畫面底部；max-w-md + mx-auto：和頁面內容一樣置中 -->
  <!-- pb 用 max()：避開 iPhone 底部的橫條（safe-area-inset-bottom） -->
  <div
    class="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md space-y-2 border-t border-border bg-card px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]"
  >
    <!-- 左右排時 *:flex-1 讓每個按鈕平分寬度；上下排時每個按鈕本來就會撐滿 -->
    <div class="flex" :class="vertical ? 'flex-col gap-2.5' : 'gap-3 *:flex-1'">
      <slot />
    </div>
    <p v-if="note" class="text-center type-date text-muted-foreground">{{ note }}</p>
  </div>
</template>
