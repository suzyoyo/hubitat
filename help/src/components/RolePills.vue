<script setup>
// 適用身分的膠囊標籤，例如「住戶」「管委會」
// 三種身分都適用的文章（例如「好彼社區是什麼？」）不顯示，因為等於沒有區分
import { findRole, ROLE_IDS } from '@/content/roles'

defineProps({
  roles: { type: Array, required: true },
  label: { type: String, default: '適用' },
})
</script>

<template>
  <p v-if="roles.length < ROLE_IDS.length" class="flex flex-wrap items-center gap-1.5">
    <span class="text-sm text-muted">{{ label }}：</span>
    <span
      v-for="roleId in roles"
      :key="roleId"
      class="inline-flex h-7 items-center rounded-full bg-brand-50 px-3 text-sm font-medium text-brand-900"
    >
      {{ findRole(roleId)?.label }}
    </span>
  </p>
</template>
