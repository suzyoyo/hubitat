<script setup>
// 使用手冊首頁：以「快速找到教學」為核心
//   歡迎區（下載 App 區塊＋「從這裡開始」小連結；搜尋在頂部列） → 三種身分入口 → 新手教學 → 依功能分類 → 常見問題（聯絡支援 2026-10-19 拿掉，頂部列和頁尾都有連結）
import { ArrowRightIcon, HouseIcon, UserCogIcon, UsersIcon } from '@lucide/vue'
import pointing from '@/assets/mascot/pointing.png'
import ArticleCard from '@/components/ArticleCard.vue'
import DownloadPanel from '@/components/DownloadPanel.vue'
import FaqList from '@/components/FaqList.vue'
import { FAQS } from '@/content/faqs'
import { ROLES } from '@/content/roles'
import {
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
  <!-- 歡迎區（2026-10-19 參考智生活首頁：左邊標題＋「從這裡開始」按鈕，右邊好彼管家） -->
  <section class="hero-gradient" aria-labelledby="home-title">
    <div class="page-container grid items-center gap-8 py-10 md:grid-cols-[minmax(0,1fr)_200px] md:py-14">
      <div class="min-w-0">
        <!-- 手機版：好彼管家縮小，放在標題右邊 -->
        <div class="flex items-center justify-between gap-4">
          <h1 id="home-title" class="text-[28px] font-bold leading-tight text-brand-950 md:text-[38px]">
            <!-- 分成兩段，換行時不會把「使用」拆開；「好彼」「社區」用 logo 原本的藍＋紅（2026-10-19 決定；淺藍底上對比約 2 : 1，是刻意的品牌裝飾） -->
            <span class="inline-block">歡迎來到<span class="text-brand-500">好彼</span><span class="text-accent">社區</span></span><span class="inline-block">使用指南</span>
          </h1>
          <img :src="pointing" alt="" class="h-24 w-auto shrink-0 md:hidden" width="150" height="208" />
        </div>
        <p class="lead-text"><span class="inline-block">有好彼管家陪你，</span><span class="inline-block">社區大小事都能輕鬆上手！</span></p>

        <!-- 下載 App（2026-10-19）：最顯眼的是下載區塊，「第一次使用」改成下面一行小連結 -->
        <DownloadPanel class="mt-6 max-w-lg" />
        <RouterLink to="/start" class="mt-2 inline-flex min-h-11 items-center gap-1 text-link">
          第一次使用？從這裡開始
          <ArrowRightIcon class="size-4" aria-hidden="true" />
        </RouterLink>
      </div>

      <!-- 平板、桌機版：好彼管家放在右邊 -->
      <img :src="pointing" alt="" class="hidden h-52 w-auto justify-self-center md:block" width="150" height="208" />
    </div>
  </section>

  <!-- 三種身分入口 -->
  <section class="page-container mt-12" aria-labelledby="roles-title">
    <h2 id="roles-title" class="section-title text-2xl font-bold text-brand-950">你是哪一種身分？</h2>
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
          <!-- 右下角的箭頭（不寫教學篇數，2026-10-19 拿掉） -->
          <span class="mt-4 flex justify-end text-brand-800">
            <ArrowRightIcon class="size-5" aria-hidden="true" />
          </span>
        </RouterLink>
      </li>
    </ul>
  </section>

  <!-- 新手教學（2026-10-19 從「熱門教學」改名；文章還是用 popular 欄位挑） -->
  <section class="page-container mt-14" aria-labelledby="popular-title">
    <h2 id="popular-title" class="section-title text-2xl font-bold text-brand-950">新手教學</h2>
    <ul class="mt-5 grid gap-4 md:grid-cols-2">
      <li v-for="article in popular" :key="article.id">
        <ArticleCard :article="article" />
      </li>
    </ul>
  </section>

  <!-- 依功能分類 -->
  <section class="page-container mt-14" aria-labelledby="topics-title">
    <h2 id="topics-title" class="section-title text-2xl font-bold text-brand-950">依功能找教學</h2>
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
          看全部<span class="sr-only">{{ topic.title }}的教學</span>
        </RouterLink>
      </li>
    </ul>
  </section>

  <!-- 常見問題：自己佔滿一整列 -->
  <section class="page-container mt-14" aria-labelledby="faq-title">
    <h2 id="faq-title" class="section-title text-2xl font-bold text-brand-950">常見問題</h2>
    <FaqList class="mt-5" :faqs="featuredFaqs" />
    <RouterLink to="/faq" class="mt-3 inline-flex min-h-11 items-center gap-1 text-link">
      看全部常見問題
      <ArrowRightIcon class="size-5" aria-hidden="true" />
    </RouterLink>
  </section>
</template>
