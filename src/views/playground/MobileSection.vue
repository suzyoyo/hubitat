<script setup>
// 手機互動元件：drawer, sheet, sonner, tabs
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 跳出通知（Toast）；畫面上要有 <Toaster />，放在 App.vue
function showSuccessToast() {
  toast.success('報修已送出', {
    description: '好彼管家已通知管委會，會盡快處理！',
  })
}

function showErrorToast() {
  toast.error('送出失敗', { description: '請檢查網路後再試一次' })
}
</script>

<template>
  <section id="mobile" class="scroll-mt-40 space-y-6">
    <h2 class="text-lg font-bold">手機互動</h2>

    <!-- Drawer：從底部滑上來的面板，手機上很常用，可以往下拖曳關閉 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Drawer（底部抽屜）</h3>
      <Drawer>
        <!-- as-child：不額外包一層，直接把觸發功能交給裡面的 Button -->
        <DrawerTrigger as-child>
          <Button variant="outline">選擇報修類別</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>報修類別</DrawerTitle>
            <DrawerDescription>請選擇最接近的問題類型</DrawerDescription>
          </DrawerHeader>
          <div class="grid gap-2 px-4">
            <Button variant="outline">水電</Button>
            <Button variant="outline">電梯</Button>
            <Button variant="outline">公共設施</Button>
          </div>
          <DrawerFooter>
            <DrawerClose as-child>
              <Button variant="ghost">取消</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>

    <!-- Sheet：從側邊（或上下）滑出的面板，side 決定方向 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Sheet（側邊面板）</h3>
      <div class="flex flex-wrap gap-2">
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline">從右邊開啟</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>篩選條件</SheetTitle>
              <SheetDescription>依狀態、廠商、日期篩選報修單</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline">從底部開啟</Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>分享報修進度</SheetTitle>
              <SheetDescription>把進度傳給家人或鄰居</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </div>

    <!-- Sonner：畫面角落跳出的短暫通知 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Sonner（通知）</h3>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" @click="showSuccessToast">成功通知</Button>
        <Button variant="outline" @click="showErrorToast">失敗通知</Button>
      </div>
    </div>

    <!-- Tabs：切換分頁；TabsTrigger 與 TabsContent 用相同的 value 配對 -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-muted-foreground">Tabs（分頁）</h3>
      <Tabs default-value="ongoing">
        <TabsList>
          <TabsTrigger value="ongoing">進行中</TabsTrigger>
          <TabsTrigger value="done">已完成</TabsTrigger>
        </TabsList>
        <TabsContent value="ongoing" class="text-sm">目前有 3 件報修正在處理。</TabsContent>
        <TabsContent value="done" class="text-sm">本月已完成 12 件報修。</TabsContent>
      </Tabs>
      <Tabs default-value="resident">
        <!-- variant="line"：底線樣式 -->
        <TabsList variant="line">
          <TabsTrigger value="resident">住戶</TabsTrigger>
          <TabsTrigger value="committee">管委會</TabsTrigger>
          <TabsTrigger value="vendor">廠商</TabsTrigger>
        </TabsList>
        <TabsContent value="resident" class="text-sm">住戶看到的內容</TabsContent>
        <TabsContent value="committee" class="text-sm">管委會看到的內容</TabsContent>
        <TabsContent value="vendor" class="text-sm">廠商看到的內容</TabsContent>
      </Tabs>
    </div>
  </section>
</template>
