<script setup>
// 頁尾：連結置中
import { MAIN_LINKS } from './links'
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
    </div>
  </footer>
</template>
