<script setup>
// 搜尋框
//   沒有綁 v-model 時：按 Enter 或放大鏡，到搜尋頁顯示結果
//   有綁 v-model 時（搜尋頁、首頁）：邊打邊更新，由外面決定怎麼顯示結果
import { SearchIcon } from '@lucide/vue'
import { ref, useId, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: { type: String, default: undefined },
  size: { type: String, default: 'md' }, // 'sm' 頂部列用；'lg' 首頁大搜尋框
  placeholder: { type: String, default: '搜尋教學，例如「通報」' },
  label: { type: String, default: '搜尋教學' },
})
const emit = defineEmits(['update:modelValue', 'submit'])

const router = useRouter()
const inputId = useId()
const text = ref(props.modelValue ?? '')

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined && value !== text.value) text.value = value
  },
)

function onInput(event) {
  text.value = event.target.value
  emit('update:modelValue', text.value)
}

function onSubmit() {
  emit('submit', text.value)
  // 沒有綁 v-model 的搜尋框，送出後到搜尋頁
  if (props.modelValue === undefined && text.value.trim()) {
    router.push({ path: '/search', query: { q: text.value.trim() } })
  }
}

const sizes = {
  sm: 'h-11 text-base pl-10 pr-3',
  md: 'h-12 text-base pl-11 pr-4',
  lg: 'h-14 text-lg pl-13 pr-4',
}
const iconPositions = { sm: 'left-3 size-5', md: 'left-3.5 size-5', lg: 'left-4.5 size-6' }
</script>

<template>
  <form role="search" class="relative" @submit.prevent="onSubmit">
    <label :for="inputId" class="sr-only">{{ label }}</label>
    <input
      :id="inputId"
      type="search"
      :value="text"
      :placeholder="placeholder"
      enterkeyhint="search"
      autocomplete="off"
      class="w-full rounded-xl border border-[#c9cbcd] bg-white text-ink shadow-[inset_0_1px_2px_rgb(0_0_0/0.04)] placeholder:text-muted focus:border-brand-800 focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-brand-800"
      :class="sizes[size]"
      @input="onInput"
    />
    <!-- 放大鏡只是裝飾；按 Enter（手機鍵盤的「搜尋」）就會送出 -->
    <SearchIcon
      class="pointer-events-none absolute top-1/2 -translate-y-1/2 text-brand-800"
      :class="iconPositions[size]"
      aria-hidden="true"
    />
  </form>
</template>
