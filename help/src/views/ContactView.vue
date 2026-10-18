<script setup>
// 聯絡支援
// 目前是測試資料：頁面上方有明顯的標示，電話和信箱也不做成可以點的連結，避免有人真的打過去
import { ClockIcon, MailIcon, PhoneIcon, TriangleAlertIcon } from '@lucide/vue'
import NoteBox from '@/components/NoteBox.vue'
import { CONTACT } from '@/content/contact'

const icons = { office: PhoneIcon, email: MailIcon }
</script>

<template>
  <div class="page-container max-w-[880px] py-8 md:py-12">
    <h1 class="text-[28px] font-bold text-brand-950 md:text-[34px]">聯絡支援</h1>
    <p class="lead-text">看完教學還是不會操作，或遇到問題時，可以用下面的方式聯絡。</p>

    <div v-if="CONTACT.isTestData" class="mt-6 flex gap-3 rounded-xl border-2 border-dashed border-orange-400 bg-orange-50 p-4" role="note">
      <TriangleAlertIcon class="mt-0.5 size-6 shrink-0 text-orange-800" aria-hidden="true" />
      <p class="text-orange-950">
        <strong>這一頁目前是測試資料。</strong>下面的電話和信箱都是範例，不是正式的客服管道，請不要撥打或寄信。正式的聯絡方式確定後會更新。
      </p>
    </div>

    <ul class="mt-6 grid gap-4 md:grid-cols-2">
      <li
        v-for="channel in CONTACT.channels"
        :key="channel.id"
        class="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]"
      >
        <div class="flex items-center gap-3">
          <span class="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-800" aria-hidden="true">
            <component :is="icons[channel.id]" class="size-6" />
          </span>
          <h2 class="text-lg font-bold text-brand-900">{{ channel.title }}</h2>
          <span v-if="CONTACT.isTestData" class="ml-auto rounded-full bg-orange-200 px-2.5 py-0.5 text-sm font-medium text-orange-900">測試資料</span>
        </div>
        <p class="mt-4 break-all text-2xl font-bold tracking-wide text-ink">{{ channel.value }}</p>
        <p class="mt-2 flex items-center gap-1.5 text-muted">
          <ClockIcon class="size-4" aria-hidden="true" />
          {{ channel.hours }}
        </p>
        <p class="mt-3 text-ink-soft">{{ channel.description }}</p>
      </li>
    </ul>

    <NoteBox class="mt-6" tone="warning" title="緊急狀況">
      <p>{{ CONTACT.emergency }}</p>
    </NoteBox>
  </div>
</template>
