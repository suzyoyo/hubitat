<script setup>
// 整頁的狀態畫面：資料載入失敗、找不到資料、找不到頁面、沒有權限
// 用 kind 選一種，文字和按鈕都已經寫好；需要時可以用 title、description 換掉文字
// 例：<FeedbackState v-if="error" kind="load-failed" @retry="load" />
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import searchingUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家
import surprisedUrl from '@/assets/mascot/surprised.png' // 驚訝坐著的好彼管家
import thinkingUrl from '@/assets/mascot/thinking.png' // 托著下巴思考的好彼管家

const props = defineProps({
  // load-failed：載入失敗 / not-found：找不到資料 / page-not-found：網址打錯 / no-permission：沒有權限
  kind: { type: String, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
})

// 按「重新整理」時通知頁面重新拿資料（只有 load-failed 有這個按鈕）
const emit = defineEmits(['retry'])

// 每一種的預設長相
const KINDS = {
  'load-failed': {
    mascot: surprisedUrl,
    title: '資料載入失敗',
    description: '可能是網路不穩，請再試一次。',
  },
  'not-found': {
    mascot: searchingUrl,
    title: '找不到這筆資料',
    description: '可能已經刪除或撤回了。',
  },
  'page-not-found': {
    mascot: searchingUrl,
    title: '找不到這個頁面',
    description: '網址可能打錯了，或是這個頁面已經不在了。',
  },
  'no-permission': {
    mascot: thinkingUrl,
    title: '你沒有權限看這個頁面',
    description: '如果需要，請聯絡主委或副主委。',
  },
}

const preset = computed(() => KINDS[props.kind])

// 「回首頁」回到目前這一端的首頁；不在任何一端（例如網址整個打錯）就回角色選擇頁
const route = useRoute()
const homeTo = computed(() => (route.meta.roleId ? `/${route.meta.roleId}/home` : '/'))
</script>

<template>
  <Empty class="gap-1 px-5 pt-10">
    <EmptyMedia>
      <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
      <img :src="preset.mascot" alt="" class="h-[120px] w-auto" />
    </EmptyMedia>
    <EmptyTitle class="type-greeting">{{ title || preset.title }}</EmptyTitle>
    <EmptyDescription class="type-body">{{ description || preset.description }}</EmptyDescription>
    <EmptyContent class="mt-4">
      <Button v-if="kind === 'load-failed'" class="w-full" @click="emit('retry')">重新整理</Button>
      <Button v-else as-child class="w-full">
        <RouterLink :to="homeTo">回首頁</RouterLink>
      </Button>
    </EmptyContent>
  </Empty>
</template>
