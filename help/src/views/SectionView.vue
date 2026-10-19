<script setup>
// 三種身分共用的章節頁：/start（開始使用）
import { computed } from 'vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { findCategory } from '@/content/categories'
import { getArticles } from '@/lib/content'

const props = defineProps({
  categoryId: { type: String, required: true },
})

const category = computed(() => findCategory(props.categoryId))
const articles = computed(() => getArticles().filter((a) => a.category === props.categoryId))
</script>

<template>
  <section aria-labelledby="section-title">
    <div class="page-container flex items-center gap-6 py-10 md:py-12">
      <div class="min-w-0 flex-1">
        <h1 id="section-title" class="text-[28px] font-bold leading-tight text-brand-950 md:text-[36px]">{{ category.title }}</h1>
        <p class="lead-text">{{ category.description }}</p>
      </div>
    </div>
  </section>

  <div class="page-container">
    <ul class="mt-8 grid gap-4 md:grid-cols-2">
      <li v-for="article in articles" :key="article.id">
        <ArticleCard :article="article" heading-level="h2" :show-roles="false" :show-description="false" />
      </li>
    </ul>
  </div>
</template>
