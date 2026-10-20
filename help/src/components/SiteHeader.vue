<script setup>
// 頂部列：Logo、主要導覽、搜尋
//   桌機（≥1200px）：左 Logo｜中間導覽（置中）｜右搜尋；「使用身分」是下拉選單
//   平板、手機：左邊「☰」打開側邊抽屜；手機的搜尋是一個圖示，按了到搜尋頁
//   在搜尋頁時，右邊改成「✕」，按了離開搜尋（2026-10-19 加）
import { ChevronDownIcon, MenuIcon, SearchIcon, XIcon } from '@lucide/vue'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logo from '@app/assets/logo/logo3.svg'
import BackToAppBar from './BackToAppBar.vue'
import NavDrawer from './NavDrawer.vue'
import SearchBox from './SearchBox.vue'
import { NAV_ITEMS } from './links'

const route = useRoute()
const router = useRouter()
const drawerOpen = ref(false)

// 離開搜尋：回到上一頁；直接打開搜尋頁（沒有上一頁）就回首頁
//   history.state.back 是 Vue Router 記的「上一頁網址」，沒有就是 null
function closeSearch() {
  if (window.history.state?.back) router.back()
  else router.push('/')
}

// 換頁後自動關掉抽屜
watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false
  },
)

// 目前在哪一區（文章頁不標，因為文章可能屬於好幾個身分）
//   下拉選單：在任何一個身分專區時，「使用身分」也標成目前位置
function isActive(item) {
  if (item.children) return item.children.some((child) => route.path === child.to)
  return route.path === item.to
}

const itemClass = 'flex min-h-11 items-center gap-1 rounded-lg px-4 font-medium text-ink-soft hover:bg-brand-50 hover:text-brand-900'
const activeClass = 'bg-brand-50 font-bold text-brand-900'
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
    <!-- 從 App 裡打開手冊時，最上面多一條「回到好彼社區」（2026-10-20） -->
    <BackToAppBar />
    <!-- 桌機用三欄：logo 那欄佔掉剩下的空間，導覽和搜尋欄就一起靠右，導覽緊貼在搜尋欄左邊（2026-10-19 從導覽置中改過來） -->
    <div class="mx-auto flex h-16 max-w-[1440px] items-center gap-1 px-3 md:px-6 xl:grid xl:grid-cols-[1fr_auto_auto] xl:gap-3">
      <div class="flex min-w-0 items-center gap-1">
        <button
          type="button"
          class="grid size-11 shrink-0 place-items-center rounded-lg text-brand-900 hover:bg-brand-50 xl:hidden"
          aria-label="打開選單"
          @click="drawerOpen = true"
        >
          <MenuIcon class="size-6" aria-hidden="true" />
        </button>

        <!-- 只放 Logo；替代文字讓螢幕閱讀器知道按了會回使用指南首頁 -->
        <RouterLink to="/" class="flex min-h-11 min-w-0 items-center rounded-lg px-1">
          <img :src="logo" alt="好彼社區使用指南首頁" class="h-7 w-auto shrink-0" width="127" height="28" />
        </RouterLink>
      </div>

      <nav aria-label="主要導覽" class="hidden xl:block">
        <ul class="flex items-center gap-1">
          <li v-for="item in NAV_ITEMS" :key="item.label">
            <!-- 下拉選單：使用身分 → 住戶、管委會、管理人員（鍵盤可以用方向鍵選、Esc 關閉） -->
            <DropdownMenuRoot v-if="item.children" :modal="false">
              <DropdownMenuTrigger :class="[itemClass, isActive(item) && activeClass]" class="group">
                {{ item.label }}
                <ChevronDownIcon class="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent
                  align="center"
                  :side-offset="6"
                  class="z-50 min-w-40 rounded-xl border border-line bg-white p-1.5 shadow-[var(--shadow-card)]"
                >
                  <DropdownMenuItem v-for="child in item.children" :key="child.to" as-child>
                    <RouterLink
                      :to="child.to"
                      class="flex min-h-11 items-center rounded-lg px-3 font-medium text-ink outline-none data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-900"
                      :class="route.path === child.to && 'font-bold text-brand-900'"
                      :aria-current="route.path === child.to ? 'page' : undefined"
                    >
                      {{ child.label }}
                    </RouterLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenuRoot>

            <RouterLink
              v-else
              :to="item.to"
              :class="[itemClass, isActive(item) && activeClass]"
              :aria-current="isActive(item) ? 'page' : undefined"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="ml-auto flex items-center justify-end xl:ml-0">
        <SearchBox v-if="route.path !== '/search'" size="sm" placeholder="搜尋教學" class="hidden w-56 md:block xl:w-64" />
        <RouterLink
          v-if="route.path !== '/search'"
          to="/search"
          class="grid size-11 place-items-center rounded-lg text-brand-900 hover:bg-brand-50 md:hidden"
          aria-label="搜尋教學"
        >
          <SearchIcon class="size-6" aria-hidden="true" />
        </RouterLink>
        <button
          v-else
          type="button"
          class="grid size-11 place-items-center rounded-lg text-brand-900 hover:bg-brand-50"
          aria-label="關閉搜尋"
          @click="closeSearch"
        >
          <XIcon class="size-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  </header>

  <NavDrawer v-model:open="drawerOpen" />
</template>
