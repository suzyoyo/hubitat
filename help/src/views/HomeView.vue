<script setup>
// 使用手冊首頁：以「快速找到教學」為核心
//   歡迎區（「開始使用好彼社區」區塊＋假手機裡的 App 首頁；搜尋在頂部列） → 三種身分入口 → 新手教學 → 依功能分類 → 常見問題（聯絡支援 2026-10-19 拿掉，頂部列和頁尾都有連結）
import { ArrowRightIcon, HouseIcon, UserCogIcon, UsersIcon } from '@lucide/vue'
import ArticleCard from '@/components/ArticleCard.vue'
import OpenAppPanel from '@/components/OpenAppPanel.vue'
import FaqList from '@/components/FaqList.vue'
import HeroPhone from '@/components/HeroPhone.vue'
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
  <!-- 歡迎區（2026-10-19）：左邊標題＋開始使用區塊，右邊（手機版在下面）是假手機裡的 App 首頁，後面有會動的光 -->
  <!-- overflow-clip：手機後面的光暈比手機大，超出歡迎區的部分裁掉，才不會出現捲軸、也不會蓋到頂部列 -->
  <section class="hero-gradient overflow-clip" aria-labelledby="home-title">
    <!-- 欄位：手機版一欄（假手機在說明和開始使用區塊中間）；平板、桌機兩欄（文字在左、假手機在右） -->
    <div
      class="page-container grid items-center gap-8 py-10 md:grid-cols-[minmax(0,1fr)_280px] md:py-14 xl:grid-cols-[600px_minmax(0,1fr)] xl:gap-12"
    >
      <div class="min-w-0">
        <!-- 好彼管家 2026-10-19 拿掉了（手機版原本在標題右邊、桌機在原本下載區塊的右下角） -->
        <h1 id="home-title" class="title-glow text-[28px] font-bold leading-tight text-brand-950 md:text-[38px]">
          <!-- 分成兩段，換行時不會把「使用」拆開；「好彼」「社區」用 logo 原本的藍＋紅（2026-10-19 決定；淺藍底上對比約 2 : 1，是刻意的品牌裝飾） -->
          <span class="inline-block">歡迎來到<span class="text-brand-500">好彼</span><span class="text-accent">社區</span></span><span class="inline-block">使用指南</span>
        </h1>
        <p class="lead-text"><span class="inline-block">有好彼管家陪你，</span><span class="inline-block">社區大小事都能輕鬆上手！</span></p>

        <!-- 手機版：假手機放在說明和開始使用區塊中間（2026-10-19 suzy 決定） -->
        <HeroPhone class="mx-auto mt-6 w-[220px] md:hidden" crop-class="h-[280px]" />

        <!-- 開始使用好彼社區（2026-10-20 從「下載 App」改來，從 App 裡打開時不顯示）
             下面原本有「第一次使用？從這裡開始」小連結，2026-10-20 拿掉（按鈕太多；頂部列有「開始使用」） -->
        <div class="mt-2 max-w-lg md:mt-6">
          <OpenAppPanel />
        </div>
      </div>

      <!-- 平板、桌機：假手機在右邊，貼著歡迎區底部（self-end＋-mb-14 抵掉下面的留白），下半截被歡迎區的底邊切掉 -->
      <HeroPhone
        class="-mb-14 hidden w-[240px] self-end justify-self-center md:block xl:w-[300px]"
        crop-class="h-[390px] xl:h-[480px]"
      />
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

<style scoped>
/* 標題後面一圈白色的光暈（2026-10-19），讓字在淺藍底上更突出 */
.title-glow {
  text-shadow:
    0 0 24px rgb(255 255 255 / 0.55),
    0 0 60px rgb(255 255 255 / 0.4),
    0 0 110px rgb(255 255 255 / 0.35);
}
</style>
