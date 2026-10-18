<script setup>
// 使用手冊首頁：以「快速找到教學」為核心
//   歡迎區 → 三種身分入口（搜尋在頂部列） → 熱門教學 → 依功能分類 → 常見問題 → 聯絡支援
import { ArrowRightIcon, HouseIcon, UserCogIcon, UsersIcon } from '@lucide/vue'
import pointing from '@app/assets/mascot/pointing.png'
import ArticleCard from '@/components/ArticleCard.vue'
import FaqList from '@/components/FaqList.vue'
import { FAQS } from '@/content/faqs'
import { ROLES } from '@/content/roles'
import {
  countRoleArticles,
  getArticles,
  getCategoriesForRole,
  getPopularArticles,
} from '@/lib/content'
import { CATEGORIES } from '@/content/categories'

const roleIcons = { resident: HouseIcon, committee: UsersIcon, staff: UserCogIcon }

const popular = getPopularArticles()

// 依功能分類：每個分類列出所有身分的文章，「看全部」連到第一個用得到它的身分專區
const topics = CATEGORIES.filter((c) => !c.shared)
  .map((category) => {
    const articles = getArticles().filter((a) => a.category === category.id)
    const roleId = ROLES.find((role) => getCategoriesForRole(role.id).some((c) => c.id === category.id))?.id
    return { ...category, articles, link: { path: `/${roleId}`, hash: `#${category.id}` } }
  })
  .filter((topic) => topic.articles.length > 0)

const featuredFaqs = FAQS.filter((faq) => faq.featured)
</script>

<template>
  <!-- 歡迎區 -->
  <section class="border-b border-brand-100 bg-gradient-to-b from-brand-50 to-page" aria-labelledby="home-title">
    <div class="page-container grid items-center gap-6 py-10 md:grid-cols-[minmax(0,1fr)_200px] md:py-14">
      <div class="min-w-0">
        <h1 id="home-title" class="text-[28px] font-bold leading-tight text-brand-950 md:text-[38px]">
          歡迎來到好彼社區使用指南
        </h1>
        <p class="lead-text">有好彼管家陪你，社區大小事都能輕鬆上手！</p>
      </div>
      <img :src="pointing" alt="" class="hidden h-52 w-auto justify-self-center md:block" width="150" height="208" />
    </div>
  </section>

  <!-- 三種身分入口 -->
  <section class="page-container mt-12" aria-labelledby="roles-title">
    <h2 id="roles-title" class="text-2xl font-bold text-brand-950">你是哪一種身分？</h2>
    <p class="mt-1 text-ink-soft">選擇身分，只看你用得到的教學。</p>
    <ul class="mt-5 grid gap-4 md:grid-cols-3">
      <li v-for="role in ROLES" :key="role.id">
        <RouterLink
          :to="`/${role.id}`"
          class="group flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] hover:border-brand-200"
        >
          <span class="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-800" aria-hidden="true">
            <component :is="roleIcons[role.id]" class="size-6" />
          </span>
          <span class="mt-4 text-xl font-bold text-brand-900 group-hover:underline">{{ role.entry }}</span>
          <span class="mt-1 flex-1 text-ink-soft">{{ role.description }}</span>
          <span class="mt-4 flex items-center justify-between font-bold text-brand-800">
            {{ countRoleArticles(role.id) }} 篇教學
            <ArrowRightIcon class="size-5" aria-hidden="true" />
          </span>
        </RouterLink>
      </li>
    </ul>
  </section>

  <!-- 熱門教學 -->
  <section class="page-container mt-14" aria-labelledby="popular-title">
    <h2 id="popular-title" class="text-2xl font-bold text-brand-950">熱門教學</h2>
    <ul class="mt-5 grid gap-4 md:grid-cols-2">
      <li v-for="article in popular" :key="article.id">
        <ArticleCard :article="article" />
      </li>
    </ul>
  </section>

  <!-- 依功能分類 -->
  <section class="page-container mt-14" aria-labelledby="topics-title">
    <h2 id="topics-title" class="text-2xl font-bold text-brand-950">依功能找教學</h2>
    <ul class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <li
        v-for="topic in topics"
        :key="topic.id"
        class="flex flex-col rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]"
      >
        <h3 class="text-lg font-bold text-brand-900">{{ topic.title }}</h3>
        <p class="mt-1 text-[15px] text-muted">{{ topic.description }}</p>
        <!-- 手機只列前 3 篇、平板以上列前 5 篇，其餘看「看全部」，首頁不會太長 -->
        <ul class="mt-3 flex-1 space-y-0.5">
          <li
            v-for="(article, index) in topic.articles.slice(0, 5)"
            :key="article.id"
            :class="index >= 3 && 'max-md:hidden'"
          >
            <RouterLink :to="`/articles/${article.id}`" class="flex min-h-11 items-center text-ink hover:text-brand-900 hover:underline">
              {{ article.title }}
            </RouterLink>
          </li>
        </ul>
        <RouterLink
          v-if="topic.articles.length > 3"
          :to="topic.link"
          class="mt-2 inline-flex min-h-11 items-center text-link"
          :class="topic.articles.length <= 5 && 'md:hidden'"
        >
          看全部 {{ topic.articles.length }} 篇
        </RouterLink>
      </li>
    </ul>
  </section>

  <!-- 常見問題：自己佔滿一整列 -->
  <section class="page-container mt-14" aria-labelledby="faq-title">
    <h2 id="faq-title" class="text-2xl font-bold text-brand-950">常見問題</h2>
    <FaqList class="mt-5" :faqs="featuredFaqs" />
    <RouterLink to="/faq" class="mt-3 inline-flex min-h-11 items-center gap-1 text-link">
      看全部常見問題
      <ArrowRightIcon class="size-5" aria-hidden="true" />
    </RouterLink>
  </section>

  <!-- 聯絡支援：放在常見問題下面，平板以上文字在左、按鈕在右 -->
  <section class="page-container mt-12" aria-labelledby="contact-title">
    <div
      class="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] md:flex-row md:items-center md:justify-between md:p-6"
    >
      <div>
        <h2 id="contact-title" class="text-xl font-bold text-brand-950">還是找不到答案？</h2>
        <p class="mt-1 text-ink-soft">可以聯絡社區管理室或客服，我們會協助你。</p>
      </div>
      <RouterLink to="/contact" class="btn btn-primary w-full shrink-0 md:w-auto">聯絡支援</RouterLink>
    </div>
  </section>
</template>
