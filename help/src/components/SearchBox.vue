<script setup>
// 搜尋框
//   沒有綁 v-model 時（頂部列）：點開會在下面顯示建議，按 Enter 或「看全部」到搜尋頁
//     還沒打字 → 「大家常搜尋」的關鍵字；打字之後 → 最符合的 5 篇教學，找不到也會直接說（2026-10-19 加）
//     鍵盤：↑↓ 選、Enter 打開、Esc 關閉
//   有綁 v-model 時（搜尋頁）：邊打邊更新，由外面決定怎麼顯示結果，不顯示下面的建議
import { SearchIcon } from '@lucide/vue'
import { computed, ref, useId, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HighlightText from './HighlightText.vue'
import { SEARCH_SUGGESTIONS } from '@/content/search'
import { searchArticles, searchWords } from '@/lib/content'

const props = defineProps({
  modelValue: { type: String, default: undefined },
  size: { type: String, default: 'md' }, // 'sm' 頂部列用；'lg' 搜尋頁大搜尋框
  placeholder: { type: String, default: '搜尋教學，例如「通報」' },
  label: { type: String, default: '搜尋教學' },
})
const emit = defineEmits(['update:modelValue', 'submit'])

const route = useRoute()
const router = useRouter()
const inputId = useId()
const listId = useId()
const text = ref(props.modelValue ?? '')

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined && value !== text.value) text.value = value
  },
)

// ── 下面的建議（只有沒綁 v-model 時才有） ──
const hasSuggest = computed(() => props.modelValue === undefined)
const open = ref(false)
const activeIndex = ref(-1) // 用鍵盤選到第幾個，-1 是都沒選

const query = computed(() => text.value.trim())
const words = computed(() => searchWords(text.value))
const allResults = computed(() => searchArticles(text.value))

// 下面可以選的項目，排成一個清單，鍵盤上下鍵照這個順序走
//   word：常搜尋的關鍵字；article：教學；all：看全部搜尋結果
const options = computed(() => {
  if (!query.value) return SEARCH_SUGGESTIONS.map((word) => ({ type: 'word', key: `w-${word}`, word }))
  if (allResults.value.length === 0) return []
  return [
    ...allResults.value.slice(0, 5).map((article) => ({ type: 'article', key: `a-${article.id}`, article })),
    { type: 'all', key: 'all' },
  ]
})
const wordOptions = computed(() => options.value.filter((o) => o.type === 'word'))
const articleOptions = computed(() => options.value.filter((o) => o.type === 'article'))
const showPanel = computed(() => hasSuggest.value && open.value)
const optionId = (index) => `${listId}-${index}`

// 換頁就關掉，搜尋框清空
watch(
  () => route.fullPath,
  () => {
    open.value = false
    if (hasSuggest.value) text.value = ''
  },
)

function onInput(event) {
  text.value = event.target.value
  activeIndex.value = -1
  open.value = true
  emit('update:modelValue', text.value)
}

function goSearch() {
  emit('submit', text.value)
  // 沒有綁 v-model 的搜尋框，送出後到搜尋頁
  if (props.modelValue === undefined && query.value) {
    router.push({ path: '/search', query: { q: query.value } })
  }
}

function choose(option) {
  if (option.type === 'word') {
    // 點了常搜尋的字：填進搜尋框，直接看下面的結果
    text.value = option.word
    activeIndex.value = -1
  } else if (option.type === 'article') {
    router.push(`/articles/${option.article.id}`)
  } else {
    goSearch()
  }
}

function onSubmit() {
  const option = options.value[activeIndex.value]
  if (showPanel.value && option) choose(option)
  else goSearch()
}

function onKeydown(event) {
  if (!hasSuggest.value) return
  const count = options.value.length
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    open.value = true
    if (count === 0) return
    const step = event.key === 'ArrowDown' ? 1 : -1
    activeIndex.value = (activeIndex.value + step + count) % count
  } else if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    open.value = false
    activeIndex.value = -1
  }
}

// 焦點離開整個搜尋框（包含下面的建議）就關掉
function onFocusout(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) open.value = false
}

const sizes = {
  sm: 'h-11 text-base pl-10 pr-3',
  md: 'h-12 text-base pl-11 pr-4',
  lg: 'h-14 text-lg pl-13 pr-4',
}
const iconPositions = { sm: 'left-3 size-5', md: 'left-3.5 size-5', lg: 'left-4.5 size-6' }
// 鍵盤選到的那一項用淺藍底標出來
const activeClass = (index) => activeIndex.value === index && 'bg-brand-50'
</script>

<template>
  <form role="search" class="relative" @submit.prevent="onSubmit" @focusout="onFocusout">
    <label :for="inputId" class="sr-only">{{ label }}</label>
    <input
      :id="inputId"
      type="search"
      :value="text"
      :placeholder="placeholder"
      enterkeyhint="search"
      autocomplete="off"
      :role="hasSuggest ? 'combobox' : undefined"
      :aria-expanded="hasSuggest ? showPanel : undefined"
      :aria-controls="hasSuggest ? listId : undefined"
      :aria-activedescendant="showPanel && activeIndex >= 0 ? optionId(activeIndex) : undefined"
      class="w-full rounded-xl border border-[#c9cbcd] bg-white text-ink shadow-[inset_0_1px_2px_rgb(0_0_0/0.04)] placeholder:text-muted focus:border-brand-800 focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-brand-800"
      :class="sizes[size]"
      @input="onInput"
      @focus="open = true"
      @click="open = true"
      @keydown="onKeydown"
    />
    <!-- 放大鏡只是裝飾；按 Enter（手機鍵盤的「搜尋」）就會送出 -->
    <SearchIcon
      class="pointer-events-none absolute top-1/2 -translate-y-1/2 text-brand-800"
      :class="iconPositions[size]"
      aria-hidden="true"
    />

    <!-- 下面的建議：和搜尋框一樣寬、左右對齊，不超出搜尋框（2026-10-19 從比搜尋框寬改來） -->
    <!-- 點選項時用 mousedown.prevent，焦點留在搜尋框，下拉才不會先被關掉 -->
    <div
      v-if="showPanel"
      class="absolute inset-x-0 top-full z-50 mt-2 rounded-xl border border-line bg-white p-2 shadow-[var(--shadow-card)]"
    >
      <!-- 還沒打字：大家常搜尋 -->
      <template v-if="!query">
        <p class="px-2 pt-1 text-sm font-bold text-ink-soft">大家常搜尋</p>
        <ul :id="listId" role="listbox" aria-label="大家常搜尋" class="flex flex-wrap gap-2 p-2">
          <li
            v-for="(option, index) in wordOptions"
            :id="optionId(index)"
            :key="option.key"
            role="option"
            :aria-selected="activeIndex === index"
            class="flex min-h-11 cursor-pointer items-center rounded-full bg-brand-50 px-4 font-medium text-brand-900 hover:bg-brand-100"
            :class="activeIndex === index && 'outline-3 outline-brand-800'"
            @mousedown.prevent
            @click="choose(option)"
          >
            {{ option.word }}
          </li>
        </ul>
      </template>

      <!-- 打字之後：最符合的教學＋看全部（不寫篇數，和搜尋頁一樣） -->
      <ul v-else-if="options.length" :id="listId" role="listbox" aria-label="搜尋建議">
        <li
          v-for="(option, index) in articleOptions"
          :id="optionId(index)"
          :key="option.key"
          role="option"
          :aria-selected="activeIndex === index"
          class="flex min-h-11 cursor-pointer items-center rounded-lg px-3 py-2 text-ink hover:bg-brand-50"
          :class="activeClass(index)"
          @mousedown.prevent
          @click="choose(option)"
        >
          <HighlightText :text="option.article.title" :words="words" />
        </li>
        <!-- 分隔線：單獨一行，不和下面的圓角混在一起 -->
        <li role="none" class="mx-1 my-1 border-t border-line" />
        <li
          :id="optionId(articleOptions.length)"
          role="option"
          :aria-selected="activeIndex === articleOptions.length"
          class="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-3 font-medium text-brand-800 hover:bg-brand-50"
          :class="activeClass(articleOptions.length)"
          @mousedown.prevent
          @click="choose({ type: 'all' })"
        >
          <SearchIcon class="size-4 shrink-0" aria-hidden="true" />
          <span class="min-w-0 truncate">看全部「{{ query }}」的搜尋結果</span>
        </li>
      </ul>

      <!-- 找不到：直接告訴使用者，不用按 Enter 才知道 -->
      <p v-else :id="listId" class="px-3 py-3 text-ink-soft" role="status">
        找不到「{{ query }}」相關的教學，換個說法試試看。
      </p>
    </div>
  </form>
</template>
