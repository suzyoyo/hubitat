<script setup>
// 認識我們（/about）：介紹好彼社區有哪些服務（2026-10-19 從一篇文章改成獨立的介紹頁，參考智生活首頁下半部）
//   頁首（名稱的由來） → 我們的服務（一個服務一個區塊，桌機左右交替） → 認識好彼管家比比 → 從這裡開始
//   文字都在 src/content/about.js；內文用 .article-body（17px、字距 0.05em），和文章內頁讀起來一樣
import { ArrowRightIcon } from '@lucide/vue'
import ContentBlock from '@/components/ContentBlock.vue'
import RichText from '@/components/RichText.vue'
import { ABOUT_INTRO, ABOUT_MASCOT, ABOUT_NAME, ABOUT_SERVICES } from '@/content/about'
import { MASCOTS } from '@/lib/mascots'
</script>

<template>
  <section class="hero-gradient" aria-labelledby="about-title">
    <div class="page-container py-10 md:py-14">
      <h1 id="about-title" class="text-[28px] font-bold leading-tight text-brand-950 md:text-[38px]">{{ ABOUT_INTRO.title }}</h1>
      <p class="lead-text">{{ ABOUT_INTRO.lead }}</p>
      <p class="mt-3 max-w-2xl leading-loose text-ink-soft">{{ ABOUT_NAME }}</p>
    </div>
  </section>

  <!-- 我們的服務 -->
  <section class="page-container mt-12" aria-labelledby="services-title">
    <h2 id="services-title" class="section-title text-2xl font-bold text-brand-950">我們的服務</h2>
    <ul class="mt-6 space-y-8 md:space-y-12">
      <li
        v-for="(service, index) in ABOUT_SERVICES"
        :key="service.title"
        class="grid items-center gap-5 md:grid-cols-2 md:gap-10"
      >
        <!-- 圖：手機放在文字上面；桌機第 1、3 個放右邊，第 2、4 個放左邊（左右交替） -->
        <div
          class="order-first grid place-items-center rounded-[var(--radius-card)] bg-brand-50 py-6 md:py-10"
          :class="index % 2 === 0 && 'md:order-last'"
        >
          <img :src="MASCOTS[service.mascot]" alt="" class="h-28 w-auto md:h-40" />
        </div>
        <div class="min-w-0">
          <h3 class="text-xl font-bold text-brand-900 md:text-2xl">{{ service.title }}</h3>
          <p class="article-body mt-3"><RichText :text="service.body" /></p>
          <ul class="mt-4 flex flex-wrap gap-2">
            <li v-for="link in service.links" :key="link.to">
              <RouterLink
                :to="link.to"
                class="inline-flex min-h-11 items-center gap-1 rounded-full border border-brand-100 bg-white px-4 font-medium text-brand-900 hover:bg-brand-50"
              >
                {{ link.label }}
                <ArrowRightIcon class="size-4" aria-hidden="true" />
              </RouterLink>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </section>

  <!-- 認識好彼管家比比 -->
  <section class="page-container mt-14" aria-labelledby="mascot-title">
    <h2 id="mascot-title" class="section-title text-2xl font-bold text-brand-950">認識好彼管家{{ ABOUT_MASCOT.name }}</h2>

    <div class="mt-6 grid items-center gap-5 md:grid-cols-[180px_minmax(0,1fr)] md:gap-8">
      <!-- 用朝右的姿勢（happy），視線看向右邊的對話框；不把揮手那張左右翻轉，翻了眼鏡的紅藍會對調 -->
      <img :src="MASCOTS.happy" alt="" class="h-36 w-auto justify-self-center md:h-44" />
      <div class="min-w-0">
        <p class="text-xl font-bold text-brand-900">
          {{ ABOUT_MASCOT.name }}
          <span class="ml-2 text-base font-medium text-ink-soft">{{ ABOUT_MASCOT.title }}</span>
        </p>
        <!-- 比比的自我介紹：做成對話框（一般文字，「」不變成按鈕名稱的深藍粗體） -->
        <p class="mt-3 rounded-2xl rounded-tl-sm border border-brand-100 bg-white p-5 text-lg leading-loose tracking-[0.05em] shadow-[var(--shadow-card)]">
          {{ ABOUT_MASCOT.bio }}
        </p>
      </div>
    </div>

    <h3 class="mt-8 text-xl font-bold text-brand-900">{{ ABOUT_MASCOT.name }}會在這些地方出現</h3>
    <ContentBlock class="article-body mt-3" :block="{ type: 'list', items: ABOUT_MASCOT.appearances }" />
  </section>

  <!-- 結尾：和首頁一樣的「從這裡開始」 -->
  <section class="page-container mt-14" aria-labelledby="about-start">
    <div class="rounded-[var(--radius-card)] bg-brand-50 px-5 py-8 text-center md:py-10">
      <h2 id="about-start" class="text-xl font-bold text-brand-950 md:text-2xl">第一次使用好彼社區？</h2>
      <RouterLink to="/start" class="btn btn-primary mt-5 bg-[#3d7290] hover:bg-brand-800">
        從這裡開始
        <ArrowRightIcon class="size-5" aria-hidden="true" />
      </RouterLink>
    </div>
  </section>
</template>
