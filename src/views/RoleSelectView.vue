<script setup>
// 角色選擇頁：還沒有登入功能前，用來切換三端；之後會換成登入頁
import { ChevronRightIcon } from '@lucide/vue'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import logoUrl from '@/assets/logo/logo2.svg' // 直式 logo（含 HUBITAT）
import { roles } from '@/config/roles'
</script>

<template>
  <div class="mx-auto min-h-dvh max-w-md bg-background px-5 pt-[max(48px,env(safe-area-inset-top))] pb-10">
    <h1><img :src="logoUrl" alt="好彼社區 Hubitat" width="215" height="172" class="mx-auto h-28 w-auto" /></h1>
    <p class="mt-6 text-center type-body text-muted-foreground">開發預覽：請選擇要查看的角色</p>

    <ItemGroup class="mt-6 gap-3">
      <!-- as-child：讓整個 Item 變成可以點的連結 -->
      <Item v-for="role in roles" :key="role.id" class="rounded-card bg-card shadow-card" as-child>
        <RouterLink :to="`/${role.id}`">
          <ItemContent>
            <ItemTitle class="type-card-title">{{ role.label }}</ItemTitle>
            <ItemDescription>{{ role.description }}</ItemDescription>
          </ItemContent>
          <ItemActions><ChevronRightIcon class="size-4" /></ItemActions>
        </RouterLink>
      </Item>
    </ItemGroup>

    <RouterLink to="/playground" class="mt-8 inline-block py-3 text-sm underline underline-offset-4">
      元件盤點頁
    </RouterLink>
  </div>
</template>
