<script setup>
// 身分切換：住戶／管委會／管理人員
// 切換後，側邊導覽只列出這個身分用得到的教學
import { ROLES } from '@/content/roles'
import { currentRole, setCurrentRole } from '@/lib/role'
</script>

<template>
  <div>
    <p id="role-switcher-label" class="mb-2 text-sm font-bold text-muted">我的身分</p>
    <div role="group" aria-labelledby="role-switcher-label" class="grid grid-cols-3 gap-1 rounded-xl bg-brand-50 p-1">
      <button
        v-for="role in ROLES"
        :key="role.id"
        type="button"
        class="min-h-11 rounded-lg px-1 text-[15px] font-medium text-brand-900 transition-colors"
        :class="currentRole === role.id ? 'bg-brand-800 font-bold text-white shadow-sm' : 'hover:bg-white/70'"
        :aria-pressed="currentRole === role.id"
        @click="setCurrentRole(role.id)"
      >
        {{ role.label }}
      </button>
    </div>
  </div>
</template>
