<script setup>
// 會議全文的案由卡片（對應 Figma 的 Meeting/Case）：結果徽章、案由標題，點標題可以展開或收合內容
// 要放在 <Accordion> 裡面用，例如：
//   <Accordion type="multiple" :default-value="['案由一']"><MeetingCase value="案由一" :section="section" /></Accordion>
// 標題和內容想換成別的（例如把搜尋到的字標出來），可以用 #heading、#body 兩個 slot
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

defineProps({
  // 全文的一個段落：heading 標題、tag 結果（例如「通過」）、body 內容
  section: { type: Object, required: true },
  // 這張卡片在 Accordion 裡的名字，Accordion 靠它記住哪幾張是展開的
  value: { type: String, required: true },
})
</script>

<template>
  <!-- 覆蓋 AccordionItem 原本的樣子：改成白色卡片，卡片之間不要分隔線 -->
  <AccordionItem :value="value" class="rounded-xl border-b-0 bg-card px-4 shadow-card">
    <!-- 標題列：py-3 加上兩行文字，整列超過 44px 好按；字放大成 16px -->
    <AccordionTrigger class="items-center gap-3 py-3 text-base hover:no-underline">
      <span class="flex min-w-0 flex-col items-start gap-1.5">
        <!-- 結果只是分類，用灰色徽章 -->
        <Badge v-if="section.tag" variant="outline">{{ section.tag }}</Badge>
        <span class="type-body-strong"><slot name="heading">{{ section.heading }}</slot></span>
      </span>
    </AccordionTrigger>
    <!-- whitespace-pre-line：內容裡的換行（\n）照樣換行 -->
    <AccordionContent class="border-t pt-3 pb-4 type-body whitespace-pre-line">
      <slot name="body">{{ section.body }}</slot>
    </AccordionContent>
  </AccordionItem>
</template>
