<script setup>
// 搜尋頁：/search?q=關鍵字&role=身分
// 邊打邊搜尋；可以只看某個身分的教學；搜尋字會寫進網址，可以分享
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import SearchBox from '@/components/SearchBox.vue'
import { ROLES } from '@/content/roles'
import { searchArticles } from '@/lib/content'

const route = useRoute()
const router = useRouter()

const query = computed(() => String(route.query.q ?? ''))
const roleFilter = computed(() => (ROLES.some((r) => r.id === route.query.role) ? route.query.role : null))
const results = computed(() => searchArticles(query.value, roleFilter.value))

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

    <!-- 身分篩選 -->
    <div role="group" aria-label="依身分篩選" class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="filter in filters"
        :key="filter.label"
        type="button"
        class="min-h-11 rounded-full px-4 font-medium"
        :class="roleFilter === filter.id ? 'bg-brand-800 font-bold text-white' : 'bg-white text-brand-900 shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-brand-50'"
        :aria-pressed="roleFilter === filter.id"
        @click="update({ role: filter.id || undefined })"
      >
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
      <p class="mt-8 font-medium text-ink-soft" aria-live="polite">
        「{{ query.trim() }}」找到 {{ results.length }} 篇教學
      </p>
      <ul v-if="results.length" class="mt-4 space-y-3">
        <li v-for="article in results" :key="article.id">
          <ArticleCard :article="article" heading-level="h2" />
        </li>
      </ul>
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
