<script setup>
// 基礎元件：button, card, badge, alert, avatar, separator, skeleton, spinner, empty
import { InboxIcon, InfoIcon, TriangleAlertIcon } from '@lucide/vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
</script>

<template>
  <!-- scroll-mt-40：跳轉時留出頂部 header 的高度，標題才不會被蓋住 -->
  <section id="basic" class="scroll-mt-40 space-y-6">
    <h2 class="text-lg font-bold">基礎</h2>

    <!-- Button：variant 決定樣式，size 決定大小 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Button</h3>
      <div class="flex flex-wrap gap-2">
        <Button>送出通報</Button>
        <Button variant="secondary">儲存草稿</Button>
        <Button variant="outline">取消</Button>
        <Button variant="ghost">略過</Button>
        <Button variant="destructive">刪除</Button>
        <Button variant="link">查看詳情</Button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button size="sm">小 sm</Button>
        <Button>預設</Button>
        <Button size="lg">大 lg</Button>
        <Button disabled>停用</Button>
      </div>
    </div>

    <!-- Card：由 Header / Content / Footer 組合而成 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Card</h3>
      <Card>
        <CardHeader>
          <CardTitle>B 棟電梯異音</CardTitle>
          <CardDescription>通報 #1024 · 2 小時前</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-sm">電梯運行時有明顯摩擦聲，已通知維修廠商。</p>
        </CardContent>
        <CardFooter class="gap-2">
          <Badge variant="destructive">施工中</Badge>
          <span class="text-sm text-muted-foreground">永安電梯</span>
        </CardFooter>
      </Card>
    </div>

    <!-- Badge：小標籤，適合顯示通報狀態 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Badge</h3>
      <div class="flex flex-wrap gap-2">
        <!-- 文字用住戶端的例子：紅＝正在影響你、橘＝要你動手、藍＝跟你有關、灰＝已結束或分類 -->
        <Badge variant="destructive">施工中</Badge>
        <Badge variant="secondary">請補充通報資料</Badge>
        <Badge>處理中</Badge>
        <Badge variant="outline">已完成</Badge>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Alert</h3>
      <!-- 圖示直接放在 Alert 裡面，第一個子元素是圖示時會自動排成左邊一欄 -->
      <Alert>
        <InfoIcon />
        <AlertTitle>法定效力說明</AlertTitle>
        <AlertDescription>逐一簽核僅為委員意見紀錄，不等於開會表決。需執行之提案仍送管委會決議。</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <TriangleAlertIcon />
        <AlertTitle>換屆交接尚未完成</AlertTitle>
        <AlertDescription>新一屆委員已就任，請在 10/31 前完成交接。</AlertDescription>
      </Alert>
    </div>

    <!-- Avatar：沒有圖片時顯示 Fallback 文字 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Avatar</h3>
      <div class="flex items-center gap-3">
        <Avatar size="sm"><AvatarFallback>王</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>林</AvatarFallback></Avatar>
        <Avatar size="lg"><AvatarFallback>管</AvatarFallback></Avatar>
      </div>
    </div>

    <!-- Separator：分隔線 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Separator</h3>
      <p class="text-sm">上方內容</p>
      <Separator />
      <p class="text-sm">下方內容</p>
    </div>

    <!-- Skeleton：資料載入中的灰色佔位框 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Skeleton</h3>
      <div class="flex items-center gap-3">
        <Skeleton class="size-10 rounded-full" />
        <div class="flex-1 space-y-2">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
        </div>
      </div>
    </div>

    <!-- Spinner：轉圈圈的載入圖示 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Spinner</h3>
      <div class="flex items-center gap-4">
        <Spinner />
        <Spinner class="size-6" />
        <Button disabled><Spinner />送出中…</Button>
      </div>
    </div>

    <!-- Empty：沒有資料時的畫面 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Empty</h3>
      <Empty class="border">
        <EmptyHeader>
          <EmptyMedia variant="icon"><InboxIcon /></EmptyMedia>
          <EmptyTitle>目前沒有通報</EmptyTitle>
          <EmptyDescription>社區一切正常，有問題隨時可以通報。</EmptyDescription>
        </EmptyHeader>
        <Button>我要通報</Button>
      </Empty>
    </div>
  </section>
</template>
