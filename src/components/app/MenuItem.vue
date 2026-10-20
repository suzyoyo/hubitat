<script setup>
// 選單的一列：左邊圖示、中間標題（下面可以多一行說明）、右邊箭頭（對應 Figma 的 App/Menu Item）
// 用法：把圖示放在標籤中間，例如
//   <MenuItem title="通知設定" to="/resident/me/notifications"><BellIcon /></MenuItem>
// 連到 App 外面的網站用 href，例如
//   <MenuItem title="使用說明" :href="HELP_CENTER_URL"><CircleHelpIcon /></MenuItem>
import { computed } from 'vue'
import { ChevronRightIcon, ExternalLinkIcon } from '@lucide/vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  // 標題下面的灰色說明；不傳就只有一行
  description: { type: String, default: '' },
  // 點了要連到 App 裡的哪一頁；to 和 href 都不傳，就只是一列文字，不能點、也沒有箭頭
  to: { type: String, default: '' },
  // 點了要開的外部網址（完整網址），一般會開新分頁（主畫面 App 例外，見下面的 linkProps）；右邊的箭頭換成「開到外面」的圖示
  href: { type: String, default: '' },
})

// App 是不是從手機主畫面打開的（沒有網址列的「App 模式」）；iPhone 舊版用 navigator.standalone
const isHomeScreenApp =
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

// 網址是不是和 App 在同一個網站（origin 是「https://網域」那一段）
function isSameSite(url) {
  return new URL(url, window.location.href).origin === window.location.origin
}

// 要放在連結上的屬性：外部網址給 <a>，App 裡的頁面給 RouterLink，都沒有就什麼都不放
const linkProps = computed(() => {
  // 主畫面 App：在同一個視窗打開（2026-10-20）
  //   開新視窗的話，新視窗拿不到 App 暫存的假資料（mocks/api/persist.js 存在 sessionStorage，一個視窗一份），
  //   在新視窗按手冊的「回到好彼社區」會打開一個全新的 App，剛新增的通報就不見了。
  //   同一個視窗打開，手冊頂部的「回到好彼社區」會用上一頁退回來，資料還在
  //   只限同一個網站（手冊和 App 都在 suzyoyo.github.io）；別的網站還是開新視窗
  if (props.href && isHomeScreenApp && isSameSite(props.href)) return { href: props.href }
  // 一般瀏覽器：開新分頁，原本的 App 分頁留著
  // rel="noopener"：新分頁不能反過來控制 App 這一頁（開新分頁的安全寫法）
  if (props.href) return { href: props.href, target: '_blank', rel: 'noopener' }
  if (props.to) return { to: props.to }
  return {}
})
</script>

<template>
  <!-- 有 href 就是一般的 <a>；有 to 就是 App 裡的連結（RouterLink）；都沒有就是 div -->
  <!-- py-3.5 加上文字的行高，一列至少 52px，超過 44px 好按 -->
  <!-- [&>svg]:size-5：放進來的圖示固定 20px -->
  <!-- v-bind="linkProps"：只把這一種用得到的屬性傳進去（RouterLink 收到 href 會蓋掉自己算好的網址） -->
  <component
    :is="href ? 'a' : to ? RouterLink : 'div'"
    v-bind="linkProps"
    class="flex items-center gap-3 py-3.5 [&>svg]:size-5 [&>svg]:shrink-0"
  >
    <slot />
    <div class="min-w-0 flex-1">
      <p class="type-body">{{ title }}</p>
      <p v-if="description" class="type-date text-muted-foreground">{{ description }}</p>
    </div>
    <ExternalLinkIcon v-if="href" />
    <ChevronRightIcon v-else-if="to" />
  </component>
</template>
