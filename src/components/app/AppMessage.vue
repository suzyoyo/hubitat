<script setup>
// 右下角圓形的「留言」按鈕（對應 Kit 的 App/Message）
// 會議紀錄頁用來打開「留言給管委會」。這個元件只是按鈕，要放在哪裡（固定在右下角）由頁面決定
// 按下去會送出 click 事件
import chatEditUrl from '@/assets/icons/chat-edit.svg' // 設計稿的圖示（對話框＋筆），lucide 沒有一樣的
</script>

<template>
  <!-- 68px 的圓、半透明的品牌藍（和「通報」按鈕一樣大，顏色不同） -->
  <button
    type="button"
    class="flex size-[68px] flex-col items-center justify-center gap-0.5 rounded-full bg-primary/62 type-nav text-white shadow-[0_4px_7px_rgb(0_0_0/0.18)]"
  >
    <!-- 圖示放在 26px 的框裡置中（設計稿的大小）。alt 留空：旁邊已經有「留言」兩個字 -->
    <span class="flex size-[26px] items-center justify-center">
      <img :src="chatEditUrl" alt="" />
    </span>
    留言
  </button>
</template>
