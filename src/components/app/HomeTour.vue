<script setup>
// 首頁導覽（新手引導，2026-10-22 013）：第一次進首頁時，把畫面蓋暗，一次亮一個真的按鈕或區塊，旁邊放說明
//   亮哪裡：頁面上加 data-tour="名稱" 的元素，打開時才去量它們在畫面上的位置，所以大手機、小手機、大字都對得上
//   看過或按「跳過使用說明」就記在瀏覽器裡（localStorage），之後不再出現
//   想再看一次：網址後面加 ?tour，例如 /resident/home?tour
//   說明文字沿用使用手冊「認識住戶首頁」（help/src/content/home-tour.js）
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'

const props = defineProps({
  // 每一步：{ target: data-tour 的名稱, text: 說明, merge: 同名的好幾塊合成一個亮框, place: 'above' | 'below' 說明放上面或下面（不寫就自動） }
  steps: { type: Array, required: true },
  // 記在瀏覽器裡的名稱，三端分開記，例如 hubitat-tour-resident
  storageKey: { type: String, required: true },
  // 頁面資料載入完才開始（不然要亮的區塊還是灰色的佔位方塊）
  ready: { type: Boolean, default: false },
})

const PAD = 6 // 亮框比元素大一圈
const GAP = 12 // 說明框和亮框的距離

const route = useRoute()
const open = ref(false)
const index = ref(0)
const holes = ref([]) // 這一步要亮的框：[{ x, y, w, h }]
const tipStyle = ref({})
const nextButton = ref(null)
const tipEl = ref(null)

const step = computed(() => props.steps[index.value])
const isLast = computed(() => index.value === props.steps.length - 1)

// 看過了嗎（瀏覽器不讓用 localStorage 時當作沒看過）
function seen() {
  try {
    return localStorage.getItem(props.storageKey) === 'done'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    localStorage.setItem(props.storageKey, 'done')
  } catch {
    // 存不了就算了，下次會再出現一次
  }
}

// 頁面準備好了：沒看過、或網址有 ?tour，就打開
watch(
  () => props.ready,
  (ready) => {
    if (!ready || open.value) return
    if (seen() && !('tour' in route.query)) return
    index.value = 0
    window.scrollTo(0, 0)
    open.value = true
  },
  { immediate: true },
)

// 打開時：畫面不能被手指捲動（程式還是可以幫忙捲到要亮的地方）
watch(open, (value) => {
  document.documentElement.style.overflow = value ? 'hidden' : ''
  if (value) window.addEventListener('resize', measure)
  else window.removeEventListener('resize', measure)
})
onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
  window.removeEventListener('resize', measure)
})

// 換一步就重新量位置
watch([open, index], async () => {
  if (!open.value) return
  await nextTick()
  scrollIntoView()
  measure()
  nextButton.value?.$el?.focus()
})

function targetsOf(name) {
  return [...document.querySelectorAll(`[data-tour="${name}"]`)]
}

// 要亮的東西在畫面外面（例如公告在比較下面）：先捲過去
// 鈴鐺、底部分頁這種固定在畫面上的，捲不捲都一樣
function scrollIntoView() {
  const els = targetsOf(step.value.target).filter((el) => !isPinned(el))
  if (!els.length) return
  const top = Math.min(...els.map((el) => el.getBoundingClientRect().top))
  const bottom = Math.max(...els.map((el) => el.getBoundingClientRect().bottom))
  // 上面留給頂部列，下面留給底部導覽列
  if (top < 80 || bottom > window.innerHeight - 120) {
    window.scrollTo(0, window.scrollY + top - 100)
  }
}

// 自己或外層是 fixed / sticky（頂部列、底部導覽）：不會跟著頁面捲動
function isPinned(el) {
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    const position = getComputedStyle(node).position
    if (position === 'fixed' || position === 'sticky') return true
  }
  return false
}

function measure() {
  const els = targetsOf(step.value.target)
  let rects = els.map((el) => el.getBoundingClientRect())
  if (step.value.merge && rects.length > 1) {
    const left = Math.min(...rects.map((r) => r.left))
    const top = Math.min(...rects.map((r) => r.top))
    const right = Math.max(...rects.map((r) => r.right))
    const bottom = Math.max(...rects.map((r) => r.bottom))
    rects = [{ left, top, width: right - left, height: bottom - top }]
  }
  holes.value = rects.map((r) => ({ x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 }))

  // 說明框跟著第一個亮框：亮框在畫面上半部就放下面，在下半部就放上面
  const anchor = holes.value[0]
  if (!anchor) {
    tipStyle.value = { top: '50%', transform: 'translateY(-50%)' }
    return
  }
  let place = step.value.place ?? (anchor.y + anchor.h / 2 < window.innerHeight / 2 ? 'below' : 'above')
  // 放下面會超出畫面（矮的手機）就改放上面
  const tipHeight = tipEl.value?.offsetHeight ?? 140
  if (place === 'below' && anchor.y + anchor.h + GAP + tipHeight > window.innerHeight - GAP) place = 'above'
  tipStyle.value =
    place === 'below'
      ? { top: `${anchor.y + anchor.h + GAP}px` }
      : { bottom: `${window.innerHeight - anchor.y + GAP}px` }
}

function next() {
  if (isLast.value) finish()
  else index.value += 1
}

// 看完或跳過：回到首頁最上面
function finish() {
  markSeen()
  open.value = false
  window.scrollTo(0, 0)
}
</script>

<template>
  <!-- z-50：蓋在頂部列（z-10）和底部導覽（z-20）上面 -->
  <!-- 整片都擋住點擊：導覽時亮起來的按鈕只是給你看，不會真的按到 -->
  <div
    v-if="open"
    class="fixed inset-0 z-50"
    role="dialog"
    aria-modal="true"
    aria-label="首頁使用說明"
    @keydown.esc="finish"
  >
    <!-- 暗色遮罩挖洞：mask 裡白色是「蓋暗」、黑色是「挖空」 -->
    <!-- 黑色 50%：彈窗背景的 40% 再加 10%（2026-10-22 013） -->
    <svg class="absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <mask id="home-tour-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect v-for="(hole, i) in holes" :key="i" :x="hole.x" :y="hole.y" :width="hole.w" :height="hole.h" rx="14" fill="black" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="black" opacity="0.5" mask="url(#home-tour-mask)" />
    </svg>

    <!-- 說明框：寬度和內容一樣，最寬 343px（375 的手機左右各留 16px） -->
    <div ref="tipEl" class="absolute inset-x-0 mx-auto w-[calc(100%-32px)] max-w-[343px] rounded-xl bg-card p-4 shadow-card" :style="tipStyle">
      <p class="type-body text-foreground">{{ step.text }}</p>
      <div class="mt-3 flex items-center gap-2">
        <span class="type-date text-muted-foreground">{{ index + 1 }} / {{ steps.length }}</span>
        <!-- 主要按鈕只有「下一步」；跳過是不強調的動作，用 ghost -->
        <Button variant="ghost" class="ml-auto" @click="finish">跳過使用說明</Button>
        <Button ref="nextButton" @click="next">{{ isLast ? '開始使用' : '下一步' }}</Button>
      </div>
    </div>
  </div>
</template>
