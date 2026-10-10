<script setup>
// 頂部標題列（對應 Figma 的 App/Header），有兩種：
//   Brand：左邊 logo、右邊通知鈴鐺，用在底部分頁的那幾頁（首頁、社區、我的 …）
//   Page： 左邊返回、中間標題，用在其他所有頁面（內頁、通知 …）
// 有傳 title 就是 Page，沒傳就是 Brand
// 首頁的問候語與吉祥物是另一個元件 AppGreeting，由首頁自己放
import { ArrowLeftIcon, BellIcon } from '@lucide/vue'
import { useRouter } from 'vue-router'
import logoUrl from '@/assets/logo/logo3.svg' // 橫式 logo

const props = defineProps({
  // 頁面標題，例如「我的通報」；不傳就顯示 logo 與鈴鐺
  title: { type: String, default: '' },
  // 通知頁的網址，例如 /resident/notifications
  notificationsTo: { type: String, required: true },
  // 沒有上一頁可以回去時要去哪裡，例如 /resident/home
  homeTo: { type: String, required: true },
})

const router = useRouter()

// 按下返回：回到上一頁
// 如果是直接打網址或重新整理進來的，沒有上一頁，就回這一端的首頁
function goBack() {
  // history.state.back 是 Vue Router 記下來的「上一頁的網址」，沒有的話是 null
  if (window.history.state?.back) {
    router.back()
  } else {
    router.replace(props.homeTo)
  }
}
</script>

<template>
  <!-- Page：返回＋置中標題 -->
  <!-- sticky top-0：往下捲時標題列會黏在畫面最上面 -->
  <!-- pt 用 max()：一般 8px；有瀏海的手機則避開瀏海（safe-area-inset-top） -->
  <header
    v-if="title"
    class="sticky top-0 z-10 flex items-center gap-1 bg-background px-2 pb-2 pt-[max(8px,env(safe-area-inset-top))]"
  >
    <!-- 按鈕 44px 是可點擊範圍（長輩好按）；設計稿是 36px，所以外面的留白少 4px，整列一樣高 -->
    <button
      type="button"
      aria-label="返回"
      class="flex size-11 shrink-0 items-center justify-center rounded-full"
      @click="goBack"
    >
      <ArrowLeftIcon class="size-4" />
    </button>
    <h1 class="min-w-0 flex-1 truncate text-center type-title">{{ title }}</h1>
    <!-- 右邊放一個和返回按鈕一樣寬的空格，標題才會在正中間 -->
    <div class="size-11 shrink-0" />
  </header>

  <!-- Brand：logo＋通知鈴鐺 -->
  <header
    v-else
    class="sticky top-0 z-10 flex items-center justify-between bg-background pr-3 pb-2.5 pl-5 pt-[max(10px,env(safe-area-inset-top))]"
  >
    <!-- width / height 寫原圖尺寸，讓瀏覽器先算好比例；實際顯示高度由 h-[26px] 決定 -->
    <img :src="logoUrl" alt="好彼社區" width="303" height="67" class="h-[26px] w-auto" />
    <!-- 外層 44px 是可點擊範圍（長輩好按），裡面的藍色圓形是設計稿的 40px -->
    <RouterLink
      :to="notificationsTo"
      aria-label="通知"
      class="-mr-0.5 flex size-11 items-center justify-center"
    >
      <span class="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <BellIcon class="size-4" />
      </span>
    </RouterLink>
  </header>
</template>
