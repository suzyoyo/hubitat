<script setup>
// 常見問題：依主題分組；最後是「疑難排解」
import surprised from '@/assets/mascot/surprised.png'
import FaqList from '@/components/FaqList.vue'
import { FAQ_GROUPS, FAQS } from '@/content/faqs'

const groups = FAQ_GROUPS.map((group) => ({
  ...group,
  faqs: FAQS.filter((faq) => faq.group === group.id),
})).filter((group) => group.faqs.length > 0)
</script>

<template>
  <div class="page-container max-w-[880px] py-8 md:py-12">
    <h1 class="text-[28px] font-bold text-brand-950 md:text-[34px]">常見問題</h1>
    <p class="lead-text">點問題就會展開答案。找不到的話，可以用搜尋或聯絡我們。</p>

    <nav aria-label="問題分類" class="mt-6">
      <ul class="flex flex-wrap gap-2">
        <li v-for="group in groups" :key="group.id">
          <a :href="`#${group.id}`" class="inline-flex min-h-11 items-center rounded-full border border-brand-100 bg-white px-4 font-medium text-brand-900 hover:bg-brand-50">
            {{ group.title }}
          </a>
        </li>
      </ul>
    </nav>

    <section v-for="group in groups" :key="group.id" class="mt-12" :aria-labelledby="group.id">
      <div class="flex items-center gap-3">
        <!-- 疑難排解才放好彼管家，放在標題左邊 -->
        <img v-if="group.id === 'trouble'" :src="surprised" alt="" class="h-24 w-auto shrink-0" width="68" height="96" />
        <div class="min-w-0 flex-1">
          <h2 :id="group.id" class="scroll-mt-24 text-2xl font-bold text-brand-950">{{ group.title }}</h2>
          <p v-if="group.description" class="mt-1 text-ink-soft">{{ group.description }}</p>
        </div>
      </div>
      <FaqList class="mt-5" :faqs="group.faqs" />
    </section>

    <p class="mt-12 rounded-xl bg-white p-5 text-ink-soft shadow-[var(--shadow-card)]">
      還是沒有解決？
      <RouterLink to="/contact" class="text-link">聯絡支援</RouterLink>
    </p>
  </div>
</template>
