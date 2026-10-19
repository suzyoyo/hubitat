<script setup>
// 頁尾：連結置中，最下面是版權聲明
import { MAIN_LINKS } from './links'

// 版權年份用今年，每年不用手動改
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-16 border-t border-line bg-white">
    <div class="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <nav aria-label="頁尾導覽">
        <ul class="flex flex-wrap justify-center gap-x-2 gap-y-1">
          <li><RouterLink to="/" class="flex min-h-11 items-center px-2 text-ink-soft hover:text-brand-900 hover:underline">首頁</RouterLink></li>
          <li v-for="link in MAIN_LINKS" :key="link.to">
            <RouterLink :to="link.to" class="flex min-h-11 items-center px-2 text-ink-soft hover:text-brand-900 hover:underline">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
      <p class="mt-4 text-center text-sm text-muted">© {{ year }} 好彼社區 Hubitat. All rights reserved.</p>
    </div>
  </footer>
</template>
