<script setup>
// 身分專區：/resident、/committee、/staff
// 依分類列出這個身分用得到的教學；每個分類有自己的 #錨點（例如 /committee#case），可以直接連過來
import { computed, watch } from 'vue'
import waving from '@/assets/mascot/waving.png'
import ArticleCard from '@/components/ArticleCard.vue'
import FaqList from '@/components/FaqList.vue'
import { FAQS } from '@/content/faqs'
import { findRole, ROLES } from '@/content/roles'
import { getArticle, getCategoriesForRole } from '@/lib/content'
import { setCurrentRole } from '@/lib/role'

const props = defineProps({
  roleId: { type: String, required: true },
})

const role = computed(() => findRole(props.roleId))
const categories = computed(() => getCategoriesForRole(props.roleId).filter((c) => !c.shared))
// 第一次使用的人先看這幾篇（文章 id 寫在 content/roles.js 的 quickStart）
const quickStart = computed(() => (role.value.quickStart ?? []).map(getArticle).filter(Boolean))
const faqs = computed(() => FAQS.filter((faq) => faq.roles.includes(props.roleId)).slice(0, 5))
const otherRoles = computed(() => ROLES.filter((r) => r.id !== props.roleId))

// 進到身分專區，側邊導覽也換成這個身分
watch(() => props.roleId, setCurrentRole, { immediate: true })
</script>

<template>
  <section class="hero-gradient" aria-labelledby="role-title">
    <!-- 右邊放揮手的好彼管家；手機版縮小、放在標題右邊（和首頁一樣，2026-10-19 起手機也顯示） -->
    <div class="page-container grid items-center gap-6 py-10 md:grid-cols-[minmax(0,1fr)_200px] md:py-12">
      <div class="min-w-0">
        <!-- 手機版：好彼管家縮小，放在標題右邊 -->
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="font-bold text-brand-800">{{ role.label }}使用指南</p>
            <h1 id="role-title" class="mt-1 text-[28px] font-bold leading-tight text-brand-950 md:text-[36px]">{{ role.entry }}</h1>
          </div>
          <img :src="waving" alt="" class="h-24 w-auto shrink-0 md:hidden" width="147" height="208" />
        </div>
        <p class="lead-text">{{ role.description }}</p>

        <!-- 分類捷徑 -->
        <nav aria-label="本頁分類" class="mt-6">
          <ul class="flex flex-wrap gap-2">
            <li v-for="category in categories" :key="category.id">
              <a :href="`#${category.id}`" class="inline-flex min-h-11 items-center rounded-full border border-brand-100 bg-white px-4 font-medium text-brand-900 hover:bg-brand-50">
                {{ category.title }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <img :src="waving" alt="" class="hidden h-52 w-auto justify-self-center md:block" width="147" height="208" />
    </div>
  </section>

  <div class="page-container">
    <!-- 第一次使用？從這裡開始：依序看這三篇 -->
    <section v-if="quickStart.length" class="mt-10" aria-labelledby="quick-start">
      <h2 id="quick-start" class="section-title text-2xl font-bold text-brand-950">第一次使用？從這裡開始</h2>
      <ol class="mt-5 grid gap-4 lg:grid-cols-3">
        <li v-for="(article, index) in quickStart" :key="article.id">
          <ArticleCard :article="article" :show-roles="false" :step="index + 1" />
        </li>
      </ol>
    </section>

    <section v-for="category in categories" :key="category.id" class="mt-12" :aria-labelledby="category.id">
      <h2 :id="category.id" class="section-title scroll-mt-24 text-2xl font-bold text-brand-950">{{ category.title }}</h2>
      <ul class="mt-5 grid gap-4 md:grid-cols-2">
        <li v-for="article in category.articles" :key="article.id">
          <ArticleCard :article="article" :show-roles="false" :show-description="false" />
        </li>
      </ul>
    </section>

    <section v-if="faqs.length" class="mt-14" aria-labelledby="role-faq">
      <h2 id="role-faq" class="section-title text-2xl font-bold text-brand-950">{{ role.label }}常問的問題</h2>
      <FaqList class="mt-5" :faqs="faqs" />
      <RouterLink to="/faq" class="mt-3 inline-flex min-h-11 items-center text-link">看全部常見問題</RouterLink>
    </section>

    <p class="mt-12 text-ink-soft">
      不是{{ role.label }}？看
      <template v-for="(other, index) in otherRoles" :key="other.id">
        <RouterLink :to="`/${other.id}`" class="text-link">{{ other.label }}使用指南</RouterLink>
        <template v-if="index < otherRoles.length - 1">、</template>
      </template>
      。
    </p>
  </div>
</template>
