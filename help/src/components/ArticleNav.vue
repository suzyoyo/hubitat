<script setup>
// 文章導覽：依「現在的身分」列出分類與文章，分類可以展開、收合
// 正在看的文章：左邊一條深藍線＋粗體＋淺藍底（不只靠顏色區分）
import { ChevronDownIcon } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { getCategoriesForRole } from '@/lib/content'
import { currentRole } from '@/lib/role'

const props = defineProps({
  activeId: { type: String, default: undefined },
})

const categories = computed(() => getCategoriesForRole(currentRole.value))

// 展開中的分類：預設展開「正在看的文章」所在的分類；不在文章頁時全部展開
const expanded = ref(new Set())

function resetExpanded() {
  const active = categories.value.find((c) => c.articles.some((a) => a.id === props.activeId))
  expanded.value = new Set(active ? [active.id] : categories.value.map((c) => c.id))
}
watch([() => props.activeId, currentRole], resetExpanded, { immediate: true })

function toggle(id) {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}
</script>

<template>
  <nav aria-label="教學文章">
    <ul class="space-y-1">
      <li v-for="category in categories" :key="category.id">
        <button
          type="button"
          class="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-2 text-left font-bold text-brand-900 hover:bg-brand-50"
          :aria-expanded="expanded.has(category.id)"
          :aria-controls="`nav-${category.id}`"
          @click="toggle(category.id)"
        >
          <span>{{ category.title }}</span>
          <ChevronDownIcon
            class="size-5 shrink-0 text-muted transition-transform"
            :class="!expanded.has(category.id) && '-rotate-90'"
            aria-hidden="true"
          />
        </button>
        <ul v-show="expanded.has(category.id)" :id="`nav-${category.id}`" class="mb-2 space-y-0.5">
          <li v-for="article in category.articles" :key="article.id">
            <RouterLink
              :to="`/articles/${article.id}`"
              class="flex min-h-11 items-center rounded-r-lg border-l-[3px] py-2 pl-4 pr-2 leading-snug"
              :class="
                article.id === activeId
                  ? 'border-brand-800 bg-brand-50 font-bold text-brand-900'
                  : 'border-line text-ink-soft hover:border-brand-200 hover:bg-page hover:text-brand-900'
              "
              :aria-current="article.id === activeId ? 'page' : undefined"
            >
              {{ article.title }}
            </RouterLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
