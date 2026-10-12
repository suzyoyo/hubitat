<script setup>
// 管委會端・首頁：問候列、我的待辦、捷徑、住戶意見、公告與動態
import { computed, onMounted, ref } from 'vue'
import AppGreeting from '@/components/app/AppGreeting.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { MOCK_NOW, getCurrentUser, getMyTodos } from '@/mocks/api'

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 我的待辦：getMyTodos() 回傳 items（每一筆待辦）和 total（共幾件）
const todos = ref({ items: [], total: 0 })

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('committee')
  todos.value = await getMyTodos(user.id, 'committee')
  loading.value = false
})

// 依現在幾點決定問候語
const hello = computed(() => {
  const hour = Number(MOCK_NOW.split('T')[1].split(':')[0]) // '2026-10-01T13:42' → 13
  if (hour < 11) return '早安'
  if (hour < 18) return '午安'
  return '晚安'
})

// 問候列的兩行字：提醒今天有幾件待辦
const greeting = computed(() => {
  // 設計稿沒畫沒有待辦的樣子，先用這句
  if (todos.value.total === 0) return { title: `${hello.value}！`, subtitle: '今天沒有待辦事項喔！' }
  return { title: `${hello.value}！今天有`, subtitle: `${todos.value.total} 件待辦事項喔！` }
})
</script>

<template>
  <div>
    <AppGreeting v-if="!loading" :title="greeting.title" :subtitle="greeting.subtitle" />
    <Skeleton v-else class="h-[104px] rounded-t-none rounded-b-3xl" />
  </div>
</template>
