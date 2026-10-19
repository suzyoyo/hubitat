<script setup>
// 教學文章頁
//   桌機（≥1200px）：左側是這篇文章的頁內目錄｜右邊是文章（兩欄一起置中）
//   平板、手機：單欄；頁內目錄收在標題下面，文章導覽在「☰」抽屜裡
import { ChevronRightIcon } from '@lucide/vue'
import { computed, watch } from 'vue'
import ArticleCard from '@/components/ArticleCard.vue'
import ArticleSteps from '@/components/ArticleSteps.vue'
import ArticleToc from '@/components/ArticleToc.vue'
import ContentBlock from '@/components/ContentBlock.vue'
import EmptyState from '@/components/EmptyState.vue'
import NoteBox from '@/components/NoteBox.vue'
import RichText from '@/components/RichText.vue'
import RolePills from '@/components/RolePills.vue'
import { findCategory } from '@/content/categories'
import { MASCOTS } from '@/lib/mascots'
import { appliesTo, defaultRoleOf, getArticle, getRelatedArticles, getSections, getToc, sectionId } from '@/lib/content'
import { currentRole, setCurrentRole } from '@/lib/role'
import { setPageTitle } from '@/lib/title'

const props = defineProps({
  id: { type: String, required: true },
})

const article = computed(() => getArticle(props.id))
const category = computed(() => article.value && findCategory(article.value.category))
const toc = computed(() => (article.value ? getToc(article.value) : []))
const sections = computed(() => (article.value ? getSections(article.value) : []))
const related = computed(() => (article.value ? getRelatedArticles(article.value) : []))

// 麵包屑的分類連到哪裡：共用分類連到「認識好彼社區」「開始使用」；其他連到身分專區的那個分類
const categoryLink = computed(() => {
  if (!category.value) return '/'
  if (category.value.shared) return `/${category.value.id}`
  return { path: `/${currentRole.value}`, hash: `#${category.value.id}` }
})

// 打開文章時：設定瀏覽器標題；文章不適用現在的身分時，抽屜裡的導覽換成適用的身分
watch(
  article,
  (value) => {
    if (!value) {
      setPageTitle('找不到這篇教學')
      return
    }
    setPageTitle(value.title)
    if (!appliesTo(value, currentRole.value)) setCurrentRole(defaultRoleOf(value))
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="!article" class="page-container py-12">
    <h1 class="sr-only">找不到這篇教學</h1>
    <EmptyState title="找不到這篇教學" description="網址可能打錯了，或這篇教學已經移除。可以用搜尋找找看。">
      <RouterLink to="/search" class="btn btn-primary">搜尋教學</RouterLink>
      <RouterLink to="/" class="btn btn-secondary">回使用指南首頁</RouterLink>
    </EmptyState>
  </div>

  <div
    v-else
    class="mx-auto max-w-[1440px] px-4 md:px-6 xl:grid xl:grid-cols-[220px_minmax(0,720px)] xl:justify-center xl:gap-16"
  >
    <!-- 左側：頁內目錄（桌機才顯示），捲動時固定在畫面上 -->
    <aside class="hidden xl:block">
      <div class="sticky top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto py-10">
        <ArticleToc v-if="toc.length > 1" :key="article.id" :toc="toc" />
      </div>
    </aside>

    <!-- 右側：文章 -->
    <article class="article-body mx-auto w-full min-w-0 max-w-[720px] py-6 md:py-10 xl:mx-0">
      <nav aria-label="目前位置" class="text-[15px]">
        <ol class="flex flex-wrap items-center gap-1 text-muted">
          <li><RouterLink to="/" class="inline-flex min-h-11 items-center hover:text-brand-900 hover:underline">使用指南</RouterLink></li>
          <li aria-hidden="true"><ChevronRightIcon class="size-4" /></li>
          <li>
            <RouterLink :to="categoryLink" class="inline-flex min-h-11 items-center hover:text-brand-900 hover:underline">
              {{ category?.title }}
            </RouterLink>
          </li>
        </ol>
      </nav>

      <header class="mt-1">
        <h1 class="text-[28px] font-bold leading-tight text-brand-950 md:text-[34px]">{{ article.title }}</h1>
        <p class="lead-text">{{ article.description }}</p>
        <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <RolePills :roles="article.applicableRoles" />
          <p v-if="article.audienceNote" class="text-[15px] text-muted">
            <RichText :text="article.audienceNote" />
          </p>
        </div>
      </header>

      <!-- 頁內目錄（平板、手機）：收在這裡，點了展開 -->
      <details v-if="toc.length > 2" class="group mt-6 rounded-xl border border-line bg-white xl:hidden">
        <summary class="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-bold text-brand-900">
          本頁目錄
          <ChevronRightIcon class="size-5 text-brand-800 transition-transform group-open:rotate-90" aria-hidden="true" />
        </summary>
        <ul class="border-t border-line px-2 py-2">
          <li v-for="item in toc" :key="item.id">
            <a :href="`#${item.id}`" class="flex min-h-11 items-center rounded-lg px-2 text-ink-soft hover:bg-brand-50 hover:text-brand-900">
              {{ item.title }}
            </a>
          </li>
        </ul>
      </details>

      <!-- 開始前要知道 -->
      <section v-if="article.before?.length" class="mt-10" aria-labelledby="before">
        <h2 id="before" class="scroll-mt-24 text-2xl font-bold text-brand-950">開始前要知道</h2>
        <!-- 和下面的步驟做出區隔：步驟是浮起來的白色卡片（要動手做的事），
             這裡是平貼的淺藍底＋左邊一條直線，沒有陰影（先讀一下的提醒） -->
        <ul class="mt-4 space-y-2 rounded-r-xl border-l-4 border-brand-500 bg-brand-50/70 py-4 pl-5 pr-5">
          <li v-for="item in article.before" :key="item" class="flex gap-3">
            <span class="mt-[0.72em] size-1.5 shrink-0 rounded-full bg-brand-800" aria-hidden="true" />
            <span><RichText :text="item" /></span>
          </li>
        </ul>
      </section>

      <!-- 操作步驟 -->
      <section v-if="article.steps?.length" class="mt-10" aria-labelledby="steps">
        <h2 id="steps" class="scroll-mt-24 text-2xl font-bold text-brand-950">操作步驟</h2>
        <ArticleSteps class="mt-4" :steps="article.steps" :walkthrough="article.walkthrough" />
      </section>

      <!-- 其他段落 -->
      <section
        v-for="(section, index) in sections"
        :key="section.heading"
        class="mt-10"
        :aria-labelledby="sectionId(index)"
      >
        <h2 :id="sectionId(index)" class="scroll-mt-24 text-2xl font-bold text-brand-950">{{ section.heading }}</h2>
        <!-- 段落有設 mascot 的放好彼管家（圖只是裝飾，alt 留空）：
               平板、桌機：右下角一隻，底部和段落最後一行對齊
               手機：放在文字下面排成一列（有 mascotRow 就排那幾隻），不擠到文字 -->
        <div class="mt-4 flex items-end gap-4">
          <div class="min-w-0 flex-1 space-y-4">
            <ContentBlock v-for="(block, blockIndex) in section.blocks" :key="blockIndex" :block="block" />
          </div>
          <img v-if="section.mascot" :src="MASCOTS[section.mascot]" alt="" class="hidden h-24 w-auto shrink-0 md:block" />
        </div>
        <div v-if="section.mascot" class="mt-6 grid grid-cols-4 justify-items-center gap-2 md:hidden">
          <img v-for="name in section.mascotRow ?? [section.mascot]" :key="name" :src="MASCOTS[name]" alt="" class="h-20 w-auto" />
        </div>
      </section>

      <!-- 完成後 -->
      <section v-if="article.result" class="mt-10" aria-labelledby="result">
        <h2 id="result" class="scroll-mt-24 text-2xl font-bold text-brand-950">完成後</h2>
        <NoteBox class="mt-4" tone="done" :mascot="!!article.steps?.length">
          <p><RichText :text="article.result" /></p>
        </NoteBox>
      </section>

      <!-- 注意事項 -->
      <section v-if="article.notes?.length" class="mt-10" aria-labelledby="notes">
        <h2 id="notes" class="scroll-mt-24 text-2xl font-bold text-brand-950">注意事項</h2>
        <NoteBox class="mt-4" tone="warning" :mascot="!!article.walkthrough">
          <ul class="space-y-2">
            <li v-for="note in article.notes" :key="note" class="flex gap-3">
              <span class="mt-[0.72em] size-1.5 shrink-0 rounded-full bg-orange-800" aria-hidden="true" />
              <span><RichText :text="note" /></span>
            </li>
          </ul>
        </NoteBox>
      </section>

      <!-- 相關教學 -->
      <section v-if="related.length" class="mt-12 border-t border-line pt-8" aria-labelledby="related">
        <h2 id="related" class="scroll-mt-24 text-2xl font-bold text-brand-950">相關教學</h2>
        <ul class="mt-4 grid gap-3 md:grid-cols-2">
          <li v-for="item in related" :key="item.id">
            <ArticleCard :article="item" :show-roles="false" />
          </li>
        </ul>
      </section>
    </article>
  </div>
</template>
