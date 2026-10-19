<script setup>
// 假手機：把 App 截圖放進手機外框，看起來像真的在手機上用（首頁歡迎區用，2026-10-19）
//   file：截圖檔名（src/assets/screenshots/ 裡的）；alt：圖上有什麼
//   外框、狀態列、動態島都是用 CSS 畫的，不是圖片
//   螢幕的高度＝狀態列＋整張截圖，截圖全部看得到（2026-10-19 起；原本固定 9 : 19.5，截圖下面的導覽列會被切掉）
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
  <!-- 外面這層只用來量寬度：外框的圓角、邊框厚度都照這個寬度的比例算（cqw），手機大小不同看起來都一樣 -->
  <div v-if="url" class="phone-wrap">
    <figure class="phone">
      <div class="phone-screen">
        <!-- 狀態列：時間、訊號、電池，只是裝飾，螢幕閱讀器跳過 -->
        <div class="phone-status" aria-hidden="true">
          <span class="font-semibold">9:41</span>
          <span class="phone-island" />
          <span class="flex items-center gap-1">
            <svg viewBox="0 0 18 12" class="h-[0.8em] w-auto"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
            <svg viewBox="0 0 26 12" class="h-[0.9em] w-auto"><rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="19" height="8" rx="1.5" /><rect x="24" y="4" width="1.5" height="4" rx="0.75" opacity="0.4" /></svg>
          </span>
        </div>
        <img :src="url" :alt="alt" class="block h-auto w-full" width="375" height="812" />
      </div>
    </figure>
  </div>
</template>

<style scoped>
/* 手機本體：深色邊框＋圓角，旁邊一點陰影讓它浮起來
   邊框厚度、圓角用 cqw（手機寬度的百分比），比例和真的手機差不多（2026-10-19 從固定 px 改來，
   原本小手機的圓角佔了寬度的三分之一，看起來像膠囊）；手機寬 300px 時和原本一樣是 9.6px、42px */
.phone-wrap {
  container-type: inline-size;
}
.phone {
  width: 100%;
  padding: 3.2cqw;
  border-radius: 14cqw;
  background: #1c2226;
  box-shadow:
    0 0 0 1.5px #3a4349 inset,
    0 24px 48px -16px rgb(6 38 48 / 0.35),
    0 8px 16px -8px rgb(6 38 48 / 0.25);
}
/* 螢幕：上面是狀態列、下面接整張截圖，高度由內容決定 */
.phone-screen {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 10.8cqw; /* 外框圓角減掉邊框厚度，內外的弧線才平行 */
  background: #f9fafc; /* 和 App 頂部的底色一樣，狀態列才接得起來 */
  container-type: inline-size; /* 讓狀態列可以用 cqw（螢幕寬度的百分比）跟著手機大小縮放 */
}
.phone-status {
  position: relative;
  display: flex;
  /* 大小跟著螢幕寬度縮放、最大到原本的尺寸（認識我們頁有很窄的小手機，2026-10-19 加） */
  height: min(30px, 13cqw);
  align-items: center;
  justify-content: space-between;
  padding: 2px min(22px, 9cqw) 0;
  color: #1c2226;
  fill: currentColor;
  font-size: min(11px, 5cqw);
}
/* 動態島：螢幕上方中間的黑色膠囊 */
.phone-island {
  position: absolute;
  top: min(7px, 3cqw);
  left: 50%;
  width: 30%;
  height: min(18px, 7.5cqw);
  border-radius: 999px;
  background: #0d1012;
  transform: translateX(-50%);
}
</style>
