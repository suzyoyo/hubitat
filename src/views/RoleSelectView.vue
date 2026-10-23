<script setup>
// 角色選擇頁：還沒有登入功能前，用來切換三端；之後會換成登入頁
import { ChevronRightIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
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
    <!-- 說明這頁怎麼用：還沒有登入，靠這頁切換三端 -->
    <div class="mt-6 space-y-2 text-center">
      <p class="type-body-strong text-foreground">開發預覽：點選角色，即可進入該角色介面。</p>
      <!-- 補充說明用 14px 的 type-note（2026-10-22 013） -->
      <p class="type-note text-muted-foreground">
        如需切換角色，請至「我的」點選<span class="whitespace-nowrap">「登出帳號」</span><br />
        返回此頁重新選擇。
      </p>
    </div>

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

    <!-- 這頁沒有主要動作，元件盤點頁是內容裡的連結，用淺藍 secondary；寬度和上面的角色卡一樣 -->
    <Button as-child variant="secondary" class="mt-12 w-full">
      <RouterLink to="/playground">元件盤點頁</RouterLink>
    </Button>
  </div>
</template>
