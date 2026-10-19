<script setup>
// 首頁歡迎區的假手機：住戶端 App 首頁放在手機外框裡，後面有會呼吸的光、旁邊有閃爍的星星（2026-10-19）
//   手機只露出上面一段，下半截慢慢淡出、切掉（沒有下面的兩個圓角）
//   cropClass：露出的高度（Tailwind class，例如 'h-[280px]'），手機版、平板、桌機不一樣
//   寬度由外面給（class），光和星星的位置都是照手機寬度的百分比算的
import PhoneMockup from '@/components/PhoneMockup.vue'

defineProps({
  cropClass: { type: String, required: true },
})
</script>

<template>
  <div class="relative">
    <!-- 光暈動畫（參考 forestapp.cc）：會呼吸的光＋閃爍的星星，全部只是裝飾 -->
    <div class="phone-glow" aria-hidden="true">
      <span class="blob blob-1" />
      <span class="blob blob-2" />
      <span class="blob blob-3" />
    </div>
    <span v-for="n in 6" :key="n" :class="`sparkle sparkle-${n}`" aria-hidden="true" />
    <!-- 手機只留上面一段，下面切掉；overflow-y-clip 只切上下，左右的陰影還看得到 -->
    <!--   phone-crop：切掉的地方用漸層淡出，不會看到一條很硬的切線 -->
    <div class="phone-crop relative z-10 overflow-y-clip" :class="cropClass">
      <PhoneMockup
        file="resident-home.jpg"
        alt="好彼社區 App 的住戶首頁：問候語、我的通報、公告與動態，底部是分頁和「通報」按鈕"
      />
    </div>
  </div>
</template>

<style scoped>
/* ── 手機後面的光暈動畫 ── */

/* 手機後面的光：三團形狀不規則、模糊的光疊在一起（2026-10-19 從正圓改成不規則），
   每一團都慢慢變形、移動、變亮變暗，看起來像一片會呼吸、會流動的光 */
.phone-glow {
  position: absolute;
  left: -45%;
  right: -45%;
  top: -8%;
  bottom: 14%; /* 往上收，在歡迎區底邊之前就淡掉，才不會被切出一條橫線 */
  z-index: 0; /* 壓在手機後面（手機是 z-10） */
  pointer-events: none;
}
.blob {
  position: absolute;
  filter: blur(36px);
  animation:
    blob-morph var(--morph, 9s) ease-in-out infinite alternate,
    blob-breathe var(--breathe, 5s) ease-in-out infinite alternate;
}
/* 大的淡藍色：鋪在手機後面偏左上 */
.blob-1 { top: 5%; left: 8%; width: 62%; height: 62%; background: rgb(160 208 238 / 0.85); --morph: 10s; --breathe: 5s; }
/* 白色：在中間，讓手機看起來在發亮 */
.blob-2 { top: 18%; left: 28%; width: 46%; height: 50%; background: rgb(255 255 255 / 0.95); --morph: 8s; --breathe: 4s; animation-delay: -3s; }
/* 藍一點的：偏右下 */
.blob-3 { top: 30%; left: 40%; width: 52%; height: 48%; background: rgb(111 183 226 / 0.55); --morph: 11s; --breathe: 6s; animation-delay: -5s; }
/* 變形：八個圓角數字一直換，形狀就不會是正圓；同時微微移動、轉動 */
@keyframes blob-morph {
  0% { border-radius: 58% 42% 63% 37% / 45% 58% 42% 55%; transform: translate(0, 0) rotate(0deg); }
  50% { border-radius: 40% 60% 35% 65% / 60% 38% 62% 40%; transform: translate(4%, -3%) rotate(20deg); }
  100% { border-radius: 65% 35% 48% 52% / 38% 64% 36% 62%; transform: translate(-3%, 4%) rotate(-15deg); }
}
/* 呼吸：慢慢變亮變暗 */
@keyframes blob-breathe {
  from { opacity: 0.55; }
  to { opacity: 1; }
}

/* 小星星：四個角的星形（用 clip-path 剪出來），只有正中間一點淡藍、其他大部分是白色，外面一圈白光；慢慢亮起、停一下、再慢慢暗掉，微微往上飄 */
.sparkle {
  position: absolute;
  width: var(--size, 20px);
  aspect-ratio: 1;
  background: radial-gradient(circle, #a9d4ef 0%, #d8edf9 14%, #fff 32%);
  clip-path: polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%);
  filter: drop-shadow(0 0 3px rgb(255 255 255 / 1)) drop-shadow(0 0 10px rgb(255 255 255 / 1)) drop-shadow(0 0 20px rgb(255 255 255 / 0.8)) drop-shadow(0 0 22px rgb(111 183 226 / 0.25));
  opacity: 0;
  animation: sparkle-twinkle var(--speed, 5s) cubic-bezier(0.45, 0, 0.55, 1) infinite;
  animation-delay: var(--delay, 0s);
  pointer-events: none;
}
.sparkle-1 { top: 4%; left: -30%; --size: 34px; --speed: 5.2s; }
.sparkle-2 { top: 22%; right: -28%; --size: 26px; --speed: 4.6s; --delay: 1.4s; }
.sparkle-3 { top: 50%; left: -24%; --size: 20px; --speed: 5.8s; --delay: 2.8s; }
.sparkle-4 { top: -8%; right: -10%; --size: 28px; --speed: 5s; --delay: 0.6s; }
.sparkle-5 { top: 62%; right: -22%; --size: 22px; --speed: 4.8s; --delay: 3.6s; }
.sparkle-6 { top: 34%; left: -12%; --size: 14px; --speed: 4.4s; --delay: 2.2s; }
@keyframes sparkle-twinkle {
  0% { opacity: 0; transform: translateY(4px) scale(0.5) rotate(0deg); }
  35% { opacity: 0.9; transform: translateY(-2px) scale(0.95) rotate(12deg); }
  55% { opacity: 1; transform: translateY(-5px) scale(1) rotate(18deg); }
  100% { opacity: 0; transform: translateY(-12px) scale(0.6) rotate(30deg); }
}

/* 設定「減少動態效果」的人：光暈和星星都停住，只留靜態的樣子 */
@media (prefers-reduced-motion: reduce) {
  .blob,
  .sparkle {
    animation: none;
  }
  .sparkle {
    opacity: 0.8;
  }
}

/* 桌機：切掉的手機從一半多一點的高度開始變透明，還沒到切口就完全融進背景 */
/* 切掉的手機從一半多一點的高度開始變透明，還沒到切口就完全融進背景 */
.phone-crop {
  mask-image: linear-gradient(to bottom, #000 55%, transparent 92%);
}
</style>
