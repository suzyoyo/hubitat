<script setup>
// 常見問題：點問題展開答案，再點一次收合（鍵盤用 Enter 或空白鍵）
import { ChevronDownIcon } from '@lucide/vue'
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from 'reka-ui'
import { getArticle } from '@/lib/content'
import RichText from './RichText.vue'

defineProps({
  faqs: { type: Array, required: true },
  headingLevel: { type: Number, default: 3 },
})
</script>

<template>
  <AccordionRoot type="multiple" class="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
    <AccordionItem v-for="faq in faqs" :key="faq.id" :value="faq.id">
      <AccordionHeader :as="`h${headingLevel}`">
        <AccordionTrigger
          class="group flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left text-[17px] font-bold text-brand-900 hover:bg-page md:px-5"
        >
          <span>{{ faq.question }}</span>
          <ChevronDownIcon
            class="size-5 shrink-0 text-brand-800 transition-transform group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="px-4 pb-5 text-ink md:px-5">
        <p v-for="text in faq.answer" :key="text" class="mt-2 first:mt-0"><RichText :text="text" /></p>
        <p v-if="faq.article && getArticle(faq.article)" class="mt-3">
          <RouterLink
            :to="`/articles/${faq.article}`"
            class="inline-flex min-h-11 items-center font-bold text-brand-800 underline underline-offset-4 hover:text-brand-900"
          >
            看教學：{{ getArticle(faq.article).title }}
          </RouterLink>
        </p>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>
