<script setup>
// 住戶端・會議紀錄：看一場會議的重點摘要和全文記錄（全文已經遮蔽個資）
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { ArrowUpIcon, DownloadIcon, LockIcon } from '@lucide/vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import MeetingCase from '@/components/meeting/MeetingCase.vue'
import MeetingHead from '@/components/meeting/MeetingHead.vue'
import { Accordion } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCurrentUser, getMeetingById } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// 網址是 /resident/meetings/:id，所以 route.params.id 就是這場會議的編號
const route = useRoute()

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 這場會議。找不到時（編號不存在，或是還沒發布給住戶）假 API 會回傳 undefined
const meeting = ref(null)
const currentTab = ref('summary') // 目前選到的分頁：'summary' 重點摘要 / 'full' 全文記錄

// 兩個分頁
const tabs = [
  { value: 'summary', label: '重點摘要' },
  { value: 'full', label: '全文記錄' },
]

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('resident')
  meeting.value = await getMeetingById(route.params.id, 'resident', user.id)
  // 案由卡片一開始全部展開（長輩不一定知道要點開）
  if (meeting.value) openAllCases()
  loading.value = false
})

// ── 全文記錄 ──────────────────────────────────────────

// 全文的每一段：有 tag（例如「通過」）的是案由，畫成可以展開收合的卡片；其他是一般段落
// 連在一起的案由放進同一組卡片，所以把段落分成一塊一塊：
//   { type: 'text', section }      一般段落
//   { type: 'cases', sections: [] } 一組案由卡片
const fullTextBlocks = computed(() => {
  const blocks = []
  meeting.value.fullText.forEach((section, index) => {
    // 每一段都給一個 id，目錄標籤點了要跳到這裡
    const item = { ...section, id: `section-${index}`, shortLabel: shortLabel(section.heading) }
    const last = blocks.at(-1)
    if (!section.tag) blocks.push({ type: 'text', section: item })
    else if (last?.type === 'cases') last.sections.push(item)
    else blocks.push({ type: 'cases', sections: [item] })
  })
  return blocks
})

// 目錄標籤用的短名稱
//   '案由一：電梯年度保養合約續簽案' → '案由一'（冒號前面）
//   '參、散會' → '散會'（頓號後面）
function shortLabel(heading) {
  if (heading.includes('：')) return heading.split('：')[0]
  if (heading.includes('、')) return heading.split('、')[1]
  return heading
}

// 目錄標籤：每一段一個
const outline = computed(() =>
  fullTextBlocks.value.flatMap((block) => (block.type === 'text' ? [block.section] : block.sections)),
)

// 每一組案由卡片展開了哪幾張，例如 { 'section-1': ['section-1', 'section-2'] }
// key 是那一組第一張卡片的 id；資料拿到之後（onMounted 裡）先設成全部展開
const openCases = ref({})
function openAllCases() {
  for (const block of fullTextBlocks.value) {
    if (block.type === 'cases') openCases.value[block.sections[0].id] = block.sections.map((item) => item.id)
  }
}

// 點目錄標籤：捲到那一段。如果是收起來的案由，先打開
async function jumpTo(item) {
  for (const block of fullTextBlocks.value) {
    if (block.type !== 'cases' || !block.sections.includes(item)) continue
    const opened = openCases.value[block.sections[0].id]
    if (!opened.includes(item.id)) opened.push(item.id)
  }
  // nextTick：等卡片打開、畫面更新完再捲，不然捲到一半畫面變長，會停在錯的地方
  await nextTick()
  // scrollIntoView：把那一段捲到畫面上；上面留的空間由那一段的 scroll-mt 決定
  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
}

// 「回到頂端」按鈕：往下捲超過 300px（大約過了頁首和分頁）才出現
const showBackToTop = ref(false)
function onScroll() {
  showBackToTop.value = window.scrollY > 300
}
onMounted(() => window.addEventListener('scroll', onScroll))
// 離開這一頁時把監聽拿掉，不然換到別頁還會一直執行
onUnmounted(() => window.removeEventListener('scroll', onScroll))

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 議案的編號：第 1 個是 '01'，第 12 個是 '12'
function agendaNumber(index) {
  return String(index + 1).padStart(2, '0')
}

// 下載會議紀錄：下載的是管委會遮蔽過個資的版本
// 假資料沒有真的檔案，先跳提示
function download() {
  toast.success('已開始下載', { description: `${meeting.value.title}.pdf` })
}
</script>

<template>
  <div class="space-y-6 px-5 pt-4 pb-8">
    <!-- 載入中 -->
    <template v-if="loading">
      <Skeleton class="h-[110px] rounded-xl" />
      <Skeleton class="h-11 rounded-lg" />
      <Skeleton class="h-[300px] rounded-xl" />
    </template>

    <!-- 找不到這場會議 -->
    <Empty v-else-if="!meeting" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這份會議紀錄</EmptyTitle>
      <EmptyDescription class="type-body">可能還沒公開，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink to="/resident/home">回到首頁</RouterLink>
      </Button>
    </Empty>

    <!-- 有資料 -->
    <template v-else>
      <div class="space-y-4">
        <MeetingHead :meeting="meeting" />
        <Button variant="outline" class="w-full" @click="download">
          <DownloadIcon />
          下載會議紀錄（PDF）
        </Button>
      </div>

      <!-- v-model：分頁切換時，currentTab 會跟著變 -->
      <Tabs v-model="currentTab" class="gap-4">
        <TabsList class="h-11! w-full rounded-xl border border-border bg-background p-1">
          <!-- before:…：按鈕看起來大約 35px 高，用看不見的 before 往上下各補 8px，可以點的範圍超過 44px -->
          <TabsTrigger
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            class="text-base text-muted-foreground before:absolute before:inset-x-0 before:-inset-y-2 data-active:bg-secondary data-active:text-secondary-foreground"
          >
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>

        <!-- 兩個分頁的內容：下一步再做 -->
        <!-- 重點摘要：核心決議＋議案列表 -->
        <TabsContent value="summary" class="space-y-6">
          <div class="space-y-2 rounded-xl bg-secondary p-4">
            <p class="type-date text-muted-foreground">本次會議核心決議</p>
            <p class="type-body text-secondary-foreground">{{ meeting.summary }}</p>
          </div>

          <section class="space-y-1">
            <SectionHeader title="議案" />
            <ol>
              <!-- 每一項：左邊編號，右邊標題、結果徽章和一行說明；項目之間有分隔線 -->
              <li
                v-for="(item, index) in meeting.agenda"
                :key="item.id"
                class="flex gap-3 border-b py-3.5 last:border-b-0"
              >
                <span class="type-body-strong text-muted-foreground">{{ agendaNumber(index) }}</span>
                <div class="min-w-0 flex-1 space-y-1.5">
                  <p class="type-body-strong">{{ item.title }}</p>
                  <!-- 結果只是分類（已經決定好的事），用灰色徽章 -->
                  <div class="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{{ item.resultText }}</Badge>
                    <span class="type-date text-muted-foreground">{{ item.note }}</span>
                  </div>
                </div>
              </li>
            </ol>
          </section>
        </TabsContent>
        <!-- 全文記錄：遮蔽聲明、目錄標籤、全文 -->
        <TabsContent value="full" class="space-y-4">
          <div class="flex gap-3 rounded-xl border bg-card p-4">
            <LockIcon class="mt-0.5 size-5 shrink-0" />
            <div class="space-y-1">
              <p class="type-body-strong">個人隱私資訊遮蔽聲明</p>
              <p class="type-date text-muted-foreground">
                為保護住戶個資權益，簽到名冊、戶號電話及未公開的廠商報價細節，已由系統遮蔽處理。
              </p>
            </div>
          </div>

          <!-- 目錄標籤：捲動時固定在頂部列下面（top-15 是頂部列的高度 60px）。太多時可以左右滑 -->
          <!-- [scrollbar-width:none]、[&::-webkit-scrollbar]:hidden：藏起左右滑的捲軸 -->
          <nav
            class="sticky top-15 z-[5] -mx-5 flex gap-2 overflow-x-auto bg-background px-5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <button
              v-for="item in outline"
              :key="item.id"
              type="button"
              class="h-11 max-w-36 shrink-0 truncate rounded-full border bg-card px-4 type-body"
              @click="jumpTo(item)"
            >
              {{ item.shortLabel }}
            </button>
          </nav>

          <template v-for="block in fullTextBlocks" :key="block.type === 'text' ? block.section.id : block.sections[0].id">
            <!-- 一般段落。scroll-mt-32：跳過來時，上面留空間給頂部列和目錄標籤 -->
            <section v-if="block.type === 'text'" :id="block.section.id" class="scroll-mt-32 space-y-2">
              <h3 class="type-card-title text-heading">{{ block.section.heading }}</h3>
              <p class="type-body whitespace-pre-line">{{ block.section.body }}</p>
            </section>
            <!-- 一組案由卡片：type="multiple" 可以同時展開好幾張 -->
            <Accordion v-else v-model="openCases[block.sections[0].id]" type="multiple" class="gap-3">
              <MeetingCase
                v-for="item in block.sections"
                :id="item.id"
                :key="item.id"
                :value="item.id"
                :section="item"
                class="scroll-mt-32"
              />
            </Accordion>
          </template>
        </TabsContent>
      </Tabs>
    </template>

    <!-- 回到頂端：往下捲之後才出現，固定在右下角 -->
    <button
      v-if="showBackToTop"
      type="button"
      aria-label="回到頂端"
      class="fixed right-5 bottom-6 z-10 flex size-11 items-center justify-center rounded-full border bg-card shadow-card"
      @click="backToTop"
    >
      <ArrowUpIcon class="size-5" />
    </button>
  </div>
</template>
