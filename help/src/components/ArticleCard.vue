<script setup>
// 文章卡片：標題、一句話介紹、適用身分；整張卡片都可以點
import { ChevronRightIcon } from '@lucide/vue'
import RolePills from './RolePills.vue'

defineProps({
  article: { type: Object, required: true },
  showRoles: { type: Boolean, default: true },
  showDescription: { type: Boolean, default: true }, // 身分專區只列標題，不顯示一句話介紹
  headingLevel: { type: String, default: 'h3' },
})
</script>

<template>
  <RouterLink
    :to="`/articles/${article.id}`"
    class="group flex h-full items-start gap-3 rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-[var(--shadow-card)] transition-colors hover:border-brand-200 md:p-5"
  >
    <div class="min-w-0 flex-1">
      <component :is="headingLevel" class="text-lg font-bold leading-snug text-brand-900 group-hover:underline">
        {{ article.title }}
      </component>
      <p v-if="showDescription" class="mt-1 text-ink-soft">{{ article.description }}</p>
      <RolePills v-if="showRoles" :roles="article.applicableRoles" class="mt-3" />
    </div>
    <ChevronRightIcon class="mt-1 size-5 shrink-0 text-brand-800" aria-hidden="true" />
  </RouterLink>
</template>
