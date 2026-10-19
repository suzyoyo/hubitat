<script setup>
// 「認識 App 畫面」用的導覽輪播（2026-10-19）
//   上面用 tab 切換身分；每個身分是一組輪播，一張只亮一個地方、放一段說明
//   手機上用手指左右滑；平板、桌機另外有兩側的箭頭；下面的小圓點表示現在是第幾張
//
//   slides：[{ role, file, alt, marks: [{ boxes, text, zone, align, top }] }]
//     role：身分 id，tab 上的名稱用 roles.js 的
//     marks：輪播的每一張（照順序）
//       boxes：要亮起來的地方，可以好幾個 [[x, y, 寬, 高], …]，單位是截圖上的 px（截圖是 375×812）
//       zone：說明框放上半部（'top'）還是下半部（'bottom'）
//       top（選填）：說明框的上緣放在截圖的哪個高度（px），有寫就不看 zone；用來貼在亮的地方下面
//       align：靠左（'left'）、靠右（'right'）或置中（'center'）
//   一開始顯示「現在看哪個身分」那一組
import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { ROLES } from '@/content/roles'
import { currentRole } from '@/lib/role'
import { screenshotUrl } from '@/lib/screenshots'

const props = defineProps({
  slides: { type: Array, required: true },
})

const W = 375
const H = 812

// 截圖檔還沒有的身分不顯示
const list = computed(() =>
  props.slides
    .map((slide) => ({ ...slide, url: screenshotUrl(slide.file), label: ROLES.find((r) => r.id === slide.role)?.label }))
    .filter((slide) => slide.url),
)

// ── 身分 tab ──
const roleIndex = ref(Math.max(0, list.value.findIndex((slide) => slide.role === currentRole.value)))
const role = computed(() => list.value[roleIndex.value])

// ── 輪播 ──
const track = ref(null)
const page = ref(0) // 現在是第幾張（從 0 開始）

// 換身分時回到第 1 張
watch(roleIndex, () => {
  page.value = 0
  track.value?.scrollTo({ left: 0, behavior: 'instant' })
})

// 說明框的位置
//   上下：有 top 就從那個高度開始放；沒有就照 zone 放上半部或下半部
//   左右：靠左、靠右，或置中
function bubbleStyle(mark) {
  const style = {}
  if (mark.top !== undefined) style.top = `${(mark.top / H) * 100}%`
  else if (mark.zone === 'top') style.top = '9%'
  else style.bottom = '13%'

  if (mark.align === 'right') style.right = '12px'
  else if (mark.align === 'center') style.left = '50%'
  else style.left = '12px'

  // 置中時用 translate 往左移一半，中心才會對準
  if (mark.align === 'center') style.transform = 'translateX(-50%)'
  return style
}

// 過一下子，照畫面實際停在哪裡算出現在是第幾張
let syncTimer
function syncSoon(ms) {
  clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    const el = track.value
    if (el) page.value = Math.round(el.scrollLeft / el.clientWidth)
  }, ms)
}

// 用手指滑的時候，等停下來（0.1 秒沒有再動）才算
// 不等的話，按箭頭滑到一半時會算錯，快速連按兩下只會前進一張
function onScroll() {
  syncSoon(100)
}

// 按箭頭、小圓點：馬上換號碼，再慢慢滑過去
// 0.7 秒後再對一次：滑到一半被打斷（例如馬上往下捲頁面）時，號碼才不會和畫面對不上
function goTo(index) {
  page.value = index
  const el = track.value
  el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
  syncSoon(700)
}

</script>

<template>
  <div v-if="list.length" class="space-y-4">
    <!-- 身分 tab：靠左 -->
    <div class="flex gap-2" role="group" aria-label="選擇身分">
      <button
        v-for="(slide, index) in list"
        :key="slide.role"
        type="button"
        class="h-11 rounded-full px-5 text-base font-medium"
        :class="index === roleIndex ? 'bg-brand-800 text-white' : 'bg-brand-50 text-brand-900 hover:bg-brand-100'"
        :aria-pressed="index === roleIndex"
        @click="roleIndex = index"
      >
        {{ slide.label }}
      </button>
    </div>

    <!-- 輪播：箭頭疊在截圖左右兩邊，不另外佔寬度（2026-10-19 從「箭頭在截圖外面」改來，
         原本手機上截圖只剩 247px 寬，說明框太窄、換行很亂） -->
    <div class="relative">
      <button
        type="button"
        class="tour-arrow left-0"
        :disabled="page === 0"
        aria-label="上一張"
        @click="goTo(page - 1)"
      >
        <ChevronLeftIcon class="size-6" aria-hidden="true" />
      </button>

      <div
        ref="track"
        class="tour-track flex snap-x snap-mandatory overflow-x-auto"
        :aria-label="`${role.label}的畫面`"
        @scroll.passive="onScroll"
      >
        <figure
          v-for="(mark, index) in role.marks"
          :key="role.role + index"
          class="w-full shrink-0 snap-center py-2"
          :aria-label="`第 ${index + 1} 張，共 ${role.marks.length} 張`"
          :inert="index !== page"
        >
          <div class="relative mx-auto w-full max-w-[300px] overflow-hidden rounded-[18px] border border-line bg-white shadow-[var(--shadow-card)]">
            <img :src="role.url" :alt="role.alt" loading="lazy" class="block h-auto w-full" width="375" height="812" />

            <!-- 把截圖調暗，只留這一張要介紹的地方是亮的（用 SVG 的遮罩挖洞；亮的地方往外多留 4px）
                 原本外面還有一圈橘色框，2026-10-19 拿掉，有亮就夠清楚了 -->
            <svg class="absolute inset-0 size-full" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
              <mask :id="`tour-hole-${role.role}-${index}`">
                <rect :width="W" :height="H" fill="white" />
                <rect
                  v-for="([x, y, w, h], boxIndex) in mark.boxes"
                  :key="boxIndex"
                  :x="x - 4" :y="y - 4" :width="w + 8" :height="h + 8"
                  rx="18" fill="black"
                />
              </mask>
              <rect :width="W" :height="H" fill="#062630" opacity="0.6" :mask="`url(#tour-hole-${role.role}-${index})`" />
            </svg>

            <!-- 說明框：上半部接在頂部列下面、下半部接在導覽列上面，或用 top 貼在亮的地方下面（見 bubbleStyle）
                 break-keep：優先在逗號、頓號這些地方換行，不會只剩一兩個字掉到下一行；
                 一段太長、放不下時（overflow-wrap: anywhere）才在中間換行 -->
            <p
              class="absolute w-max max-w-[85%] break-keep [overflow-wrap:anywhere] rounded-xl bg-white p-3 text-[15px] leading-snug text-ink shadow-lg"
              :style="bubbleStyle(mark)"
            >
              {{ mark.text }}
            </p>
          </div>
        </figure>
      </div>

      <button
        type="button"
        class="tour-arrow right-0"
        :disabled="page === role.marks.length - 1"
        aria-label="下一張"
        @click="goTo(page + 1)"
      >
        <ChevronRightIcon class="size-6" aria-hidden="true" />
      </button>
    </div>

    <!-- 小圓點：現在是第幾張，點了也能跳過去（「1 / 3」的數字 2026-10-19 拿掉） -->
    <div class="flex items-center justify-center gap-1">
      <button
        v-for="(mark, index) in role.marks"
        :key="index"
        type="button"
        class="flex size-11 items-center justify-center"
        :aria-label="`第 ${index + 1} 張`"
        :aria-current="index === page ? 'true' : undefined"
        @click="goTo(index)"
      >
        <span class="block h-2.5 rounded-full" :class="index === page ? 'w-6 bg-brand-800' : 'w-2.5 bg-line'" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 隱藏捲軸（還是可以用手指滑、用箭頭切換） */
.tour-track {
  scrollbar-width: none;
}
.tour-track::-webkit-scrollbar {
  display: none;
}
/* 左右箭頭：44px 的圓形按鈕，疊在截圖左右兩邊的正中間；到第一張、最後一張時藏起來 */
.tour-arrow {
  position: absolute;
  top: 50%;
  z-index: 1;
  transform: translateY(-50%);
  display: none; /* 手機上不放箭頭，用手指左右滑就好（2026-10-19） */
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: white;
  color: var(--color-brand-900);
  box-shadow: var(--shadow-card);
}
/* 平板、桌機（640px 以上）才顯示箭頭：用滑鼠不好左右滑 */
@media (min-width: 640px) {
  .tour-arrow {
    display: flex;
  }
}
.tour-arrow:hover:not(:disabled) {
  background: var(--color-brand-50);
}
/* 第一張沒有「上一張」、最後一張沒有「下一張」：直接藏起來（疊在截圖上，變淡的箭頭看起來髒） */
.tour-arrow:disabled {
  visibility: hidden;
}
</style>
