<script setup>
// 管委會端・我的待辦：列出所有還沒完成的待辦
// 篩選（類型）和排序的下拉選單之後再加
import { onMounted, ref } from 'vue'
import AdminActionCard from '@/components/admin/AdminActionCard.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { todoLink } from '@/lib/todo'
import { getCurrentUser, getMyTodos } from '@/mocks/api'

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
</script>

<template>
  <div class="space-y-3 px-5 pt-4 pb-5">
    <template v-if="loading">
      <Skeleton v-for="n in 3" :key="n" class="h-[220px] rounded-xl" />
    </template>
    <div v-else-if="!todos.items.length" class="rounded-xl bg-card p-4 shadow-card">
      <p class="type-body text-muted-foreground">目前沒有待辦事項</p>
    </div>
    <template v-else>
      <p class="type-date text-muted-foreground">共 {{ todos.total }} 個待辦</p>
      <AdminActionCard v-for="todo in todos.items" :key="todo.id" :todo="todo" :to="todoLink(todo)" />
    </template>
  </div>
</template>
