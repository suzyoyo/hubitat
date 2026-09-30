<script setup>
// 清單元件：item（適合廠商名冊、施工日誌列表）
import { ChevronRightIcon, WrenchIcon } from '@lucide/vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'

// 假資料：之後 Step 9 會改成 src/mocks/ 裡的資料
const vendors = [
  { id: 1, name: '永安電梯', category: '電梯保養', rating: 4.6 },
  { id: 2, name: '大同水電', category: '水電維修', rating: 4.2 },
  { id: 3, name: '清新清潔', category: '環境清潔', rating: 3.8 },
]
</script>

<template>
  <section id="list" class="scroll-mt-40 space-y-6">
    <h2 class="text-lg font-bold">清單</h2>

    <!-- Item：一列資料 = Media（左側圖示）+ Content（文字）+ Actions（右側動作） -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Item（外框樣式）</h3>
      <Item variant="outline">
        <ItemMedia variant="icon"><WrenchIcon /></ItemMedia>
        <ItemContent>
          <ItemTitle>B 棟電梯異音</ItemTitle>
          <ItemDescription>永安電梯 · 預計明天到場</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge>施工中</Badge>
        </ItemActions>
      </Item>
    </div>

    <!-- ItemGroup + v-for：用陣列資料產生一整串清單 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">ItemGroup（廠商名冊）</h3>
      <!-- gap-0 / my-0：覆蓋元件預設的間距，讓外框清單排得緊密 -->
      <ItemGroup class="gap-0 rounded-lg border">
        <!-- template 本身不會產生 HTML，只是用來包住要重複的內容 -->
        <template v-for="(vendor, index) in vendors" :key="vendor.id">
          <!-- 第一筆之前不需要分隔線 -->
          <ItemSeparator v-if="index > 0" class="my-0" />
          <Item>
            <ItemMedia>
              <Avatar><AvatarFallback>{{ vendor.name[0] }}</AvatarFallback></Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{{ vendor.name }}</ItemTitle>
              <ItemDescription>{{ vendor.category }} · ★ {{ vendor.rating }}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="ghost" size="icon" aria-label="查看廠商">
                <ChevronRightIcon />
              </Button>
            </ItemActions>
          </Item>
        </template>
      </ItemGroup>
    </div>
  </section>
</template>
