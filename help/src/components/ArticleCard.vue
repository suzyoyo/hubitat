<script setup>
// 文章卡片：標題、一句話介紹、適用身分；整張卡片都可以點
import { ChevronRightIcon } from '@lucide/vue'
import HighlightText from './HighlightText.vue'
import RolePills from './RolePills.vue'

defineProps({
  article: { type: Object, required: true },
  showRoles: { type: Boolean, default: true },
  showDescription: { type: Boolean, default: true }, // 身分專區只列標題，不顯示一句話介紹
  headingLevel: { type: String, default: 'h3' },
  highlight: { type: Array, default: () => [] }, // 搜尋結果用：標題、介紹裡要標出來的字
  showAllRoles: { type: Boolean, default: false }, // 搜尋結果用：三種身分都適用也顯示標籤
})
</script>

<template>
  <RouterLink
    :to="`/articles/${article.id}`"
    class="group flex h-full items-start gap-3 rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-[var(--shadow-card)] transition-colors hover:border-brand-200 md:p-5"
  >
    <div class="min-w-0 flex-1">
      <component :is="headingLevel" class="text-lg font-bold leading-snug text-brand-900 group-hover:underline">
        <HighlightText :text="article.title" :words="highlight" />
      </component>
      <p v-if="showDescription" class="mt-1 text-ink-soft"><HighlightText :text="article.description" :words="highlight" /></p>
      <RolePills v-if="showRoles" :roles="article.applicableRoles" :show-all="showAllRoles" class="mt-3" />
    </div>
    <ChevronRightIcon class="mt-1 size-5 shrink-0 text-brand-800" aria-hidden="true" />
  </RouterLink>
</template>
