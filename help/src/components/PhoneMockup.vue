<script setup>
// 假手機：把 App 截圖放進手機外框，看起來像真的在手機上用（首頁歡迎區用，2026-10-19）
//   file：截圖檔名（src/assets/screenshots/ 裡的）；alt：圖上有什麼
//   外框、狀態列、動態島都是用 CSS 畫的，不是圖片
//   螢幕比例和真的手機一樣；截圖比螢幕長一點，下面多的部分會被裁掉
//   截圖檔還沒有時，整個元件不顯示
import { computed } from 'vue'
import { screenshotUrl } from '@/lib/screenshots'

const props = defineProps({
  file: { type: String, required: true },
  alt: { type: String, required: true },
})

const url = computed(() => screenshotUrl(props.file))
</script>

<template>
  <figure v-if="url" class="phone">
    <div class="phone-screen">
      <!-- 狀態列：時間、訊號、電池，只是裝飾，螢幕閱讀器跳過 -->
      <div class="phone-status" aria-hidden="true">
        <span class="font-semibold">9:41</span>
        <span class="phone-island" />
        <span class="flex items-center gap-1">
          <svg viewBox="0 0 18 12" class="h-[9px] w-auto"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
          <svg viewBox="0 0 26 12" class="h-[10px] w-auto"><rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="19" height="8" rx="1.5" /><rect x="24" y="4" width="1.5" height="4" rx="0.75" opacity="0.4" /></svg>
        </span>
      </div>
      <img :src="url" :alt="alt" class="block min-h-0 w-full flex-1 object-cover object-top" width="375" height="812" />
    </div>
  </figure>
</template>

<style scoped>
/* 手機本體：深色邊框＋圓角，旁邊一點陰影讓它浮起來 */
.phone {
  width: 100%;
  padding: 9px;
  border-radius: 42px;
  background: #1c2226;
  box-shadow:
    0 0 0 1.5px #3a4349 inset,
    0 24px 48px -16px rgb(6 38 48 / 0.35),
    0 8px 16px -8px rgb(6 38 48 / 0.25);
}
/* 螢幕比例 9 : 19.5（和真的手機一樣），截圖從上面開始放，下面超出的部分裁掉 */
.phone-screen {
  display: flex;
  flex-direction: column;
  aspect-ratio: 9 / 19.5;
  overflow: hidden;
  border-radius: 33px;
  background: #f9fafc; /* 和 App 頂部的底色一樣，狀態列才接得起來 */
}
.phone-status {
  position: relative;
  display: flex;
  height: 30px;
  align-items: center;
  justify-content: space-between;
  padding: 2px 22px 0;
  color: #1c2226;
  fill: currentColor;
  font-size: 11px;
}
/* 動態島：螢幕上方中間的黑色膠囊 */
.phone-island {
  position: absolute;
  top: 7px;
  left: 50%;
  width: 30%;
  height: 18px;
  border-radius: 999px;
  background: #0d1012;
  transform: translateX(-50%);
}
</style>
