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
import { roles } from '@/config/roles'
</script>

<template>
  <div class="mx-auto min-h-dvh max-w-md bg-background px-5 pt-[max(48px,env(safe-area-inset-top))] pb-10">
    <div class="flex items-center gap-2">
      <span class="h-6 w-2 rounded bg-foreground" />
      <h1 class="text-xl font-bold">好彼社區</h1>
    </div>
    <p class="mt-2 text-sm text-muted-foreground">開發預覽：請選擇要查看的角色</p>

    <ItemGroup class="mt-6 gap-3">
      <!-- as-child：讓整個 Item 變成可以點的連結 -->
      <Item v-for="role in roles" :key="role.id" variant="outline" as-child>
        <RouterLink :to="`/${role.id}`">
          <ItemContent>
            <ItemTitle class="text-base">{{ role.label }}</ItemTitle>
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
