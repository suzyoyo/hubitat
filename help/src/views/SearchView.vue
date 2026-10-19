<script setup>
// 搜尋頁：/search?q=關鍵字&role=身分
// 邊打邊搜尋；可以只看某個身分的教學；搜尋字會寫進網址，可以分享
//   沒選身分：結果依身分分組（我的身分排第一組），多個身分共用的文章另外放在「共用教學」，每篇只出現一次
//   有選身分：只列這個身分用得到的，只給這個身分的文章排前面
//   標題、介紹裡符合搜尋字的地方用黃色底標出來
import { CheckIcon } from '@lucide/vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import SearchBox from '@/components/SearchBox.vue'
import { ROLES } from '@/content/roles'
import { searchArticles, searchWords } from '@/lib/content'
import { currentRole } from '@/lib/role'

const route = useRoute()
const router = useRouter()

const query = computed(() => String(route.query.q ?? ''))
const words = computed(() => searchWords(query.value))
const roleFilter = computed(() => (ROLES.some((r) => r.id === route.query.role) ? route.query.role : null))
const results = computed(() => searchArticles(query.value, roleFilter.value))

// 沒選身分時的分組（每篇只出現一次，各組加起來就是總數）：
//   只給一個身分看的文章 → 放進那個身分的組，我的身分排第一組
//   兩個以上身分都用得到的文章 → 放進最後的「共用教學」
const groups = computed(() => {
  if (roleFilter.value) return []
  const order = [currentRole.value, ...ROLES.map((r) => r.id).filter((id) => id !== currentRole.value)]
  const roleGroups = order.map((roleId) => ({
    id: roleId,
    title: `${ROLES.find((r) => r.id === roleId).label}的教學`,
    articles: results.value.filter((a) => a.applicableRoles.length === 1 && a.applicableRoles[0] === roleId),
  }))
  const shared = { id: 'shared', title: '共用教學', articles: results.value.filter((a) => a.applicableRoles.length > 1) }
  return [...roleGroups, shared].filter((group) => group.articles.length > 0)
})

const filters = [{ id: null, label: '全部身分' }, ...ROLES.map((r) => ({ id: r.id, label: r.label }))]
const suggestions = ['通報', '進度', '公告', '廠商', '結案']

function update(changes) {
  const next = { q: query.value || undefined, role: roleFilter.value || undefined, ...changes }
  router.replace({ query: next })
}
</script>

<template>
  <div class="page-container max-w-[880px] py-8 md:py-12">
    <h1 class="text-[28px] font-bold text-brand-950 md:text-[34px]">搜尋教學</h1>
    <SearchBox
      class="mt-5"
      size="lg"
      :model-value="query"
      placeholder="輸入關鍵字，例如「通報」「結案」"
      @update:model-value="(value) => update({ q: value || undefined })"
    />

    <!-- 身分篩選：選到的那個是深藍底＋勾勾，不只靠顏色；aria-pressed 讓螢幕閱讀器念出「已按下」 -->
    <div role="group" aria-label="依身分篩選" class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="filter in filters"
        :key="filter.label"
        type="button"
        class="flex min-h-11 items-center gap-1.5 rounded-full px-4 font-medium"
        :class="
          roleFilter === filter.id
            ? 'bg-brand-800 font-bold text-white'
            : 'bg-white text-brand-900 shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-brand-50'
        "
        :aria-pressed="roleFilter === filter.id"
        @click="update({ role: filter.id || undefined })"
      >
        <CheckIcon v-if="roleFilter === filter.id" class="size-4" aria-hidden="true" />
        {{ filter.label }}
      </button>
    </div>

    <!-- 還沒輸入：給幾個常用關鍵字 -->
    <div v-if="!query.trim()" class="mt-8">
      <p class="font-bold text-ink-soft">大家常搜尋</p>
      <ul class="mt-3 flex flex-wrap gap-2">
        <li v-for="word in suggestions" :key="word">
          <button type="button" class="btn btn-secondary rounded-full" @click="update({ q: word })">{{ word }}</button>
        </li>
      </ul>
    </div>

    <template v-else>
      <!-- 不寫找到幾篇（2026-10-19 拿掉）；找不到時下面會顯示空狀態 -->
      <p v-if="results.length" class="mt-8 font-medium text-ink-soft" aria-live="polite">
        「{{ query.trim() }}」的搜尋結果
      </p>

      <!-- 有選身分：一個清單 -->
      <ul v-if="results.length && roleFilter" class="mt-4 space-y-3">
        <li v-for="article in results" :key="article.id">
          <ArticleCard :article="article" heading-level="h2" :highlight="words" show-all-roles />
        </li>
      </ul>

      <!-- 沒選身分：依身分分組 -->
      <template v-else-if="results.length">
        <section v-for="group in groups" :key="group.id" class="mt-8" :aria-labelledby="`result-${group.id}`">
          <h2 :id="`result-${group.id}`" class="text-xl font-bold text-brand-950">{{ group.title }}</h2>
          <ul class="mt-3 space-y-3">
            <li v-for="article in group.articles" :key="article.id">
              <ArticleCard :article="article" :highlight="words" show-all-roles />
            </li>
          </ul>
        </section>
      </template>

      <EmptyState
        v-else
        class="mt-4"
        title="好彼管家找不到相關的教學"
        description="少打幾個字、或換個說法試試看；也可以看看常見問題，或直接聯絡我們。"
      >
        <RouterLink to="/faq" class="btn btn-primary">看常見問題</RouterLink>
        <RouterLink to="/contact" class="btn btn-secondary">聯絡支援</RouterLink>
      </EmptyState>
    </template>
  </div>
</template>
