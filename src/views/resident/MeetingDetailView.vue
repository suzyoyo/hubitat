<script setup>
// 住戶端・會議紀錄：看一場會議的重點摘要和全文記錄（全文已經遮蔽個資）
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { ArrowUpIcon, DownloadIcon, LockIcon, SearchIcon, XIcon } from '@lucide/vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import ArchiveSearchResultBar from '@/components/archive/ArchiveSearchResultBar.vue'
import MeetingCase from '@/components/meeting/MeetingCase.vue'
import MeetingHead from '@/components/meeting/MeetingHead.vue'
import MeetingHighlight from '@/components/meeting/MeetingHighlight.vue'
import { Accordion } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
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

// ── 全文搜尋 ──────────────────────────────────────────

const keyword = ref('') // 搜尋框裡的字
const searchWord = computed(() => keyword.value.trim()) // 去掉頭尾空白；空字串就是沒有在搜尋
const currentMatch = ref(1) // 現在跳到第幾處（從 1 開始）

// 把一段文字依搜尋的字切開，例如搜「廠商」：
//   '原合作廠商本年度' → [{ text: '原合作' }, { text: '廠商', match: 1 }, { text: '本年度' }]
// counter 記錄全文到目前為止找到幾處，讓編號可以一段一段接下去
function splitByWord(text, word, counter) {
  if (!word) return [{ text }]
  const parts = []
  // toLowerCase()：英文不分大小寫，搜 pdf 也找得到 PDF
  const lowerText = text.toLowerCase()
  const lowerWord = word.toLowerCase()
  let start = 0
  let found = lowerText.indexOf(lowerWord, start)
  // indexOf 找不到時是 -1；找得到就一直往後找
  while (found !== -1) {
    if (found > start) parts.push({ text: text.slice(start, found) })
    counter.count += 1
    parts.push({ text: text.slice(found, found + word.length), match: counter.count })
    start = found + word.length
    found = lowerText.indexOf(lowerWord, start)
  }
  if (start < text.length) parts.push({ text: text.slice(start) })
  return parts
}

// 全文每一段的標題和內容都切好，順便算出一共有幾處
// 例如 { parts: { 'section-1': { heading: [...], body: [...] } }, total: 2 }
const searchResult = computed(() => {
  const counter = { count: 0 }
  const parts = {}
  // 照畫面上的順序（標題、內容、下一段…）編號，「下一處」才會往下走
  for (const item of outline.value) {
    parts[item.id] = {
      heading: splitByWord(item.heading, searchWord.value, counter),
      body: splitByWord(item.body, searchWord.value, counter),
    }
  }
  return { parts, total: counter.count }
})

// 換了搜尋的字：回到第 1 處，並打開所有案由卡片（符合的字可能在收起來的卡片裡）
watch(searchWord, () => {
  currentMatch.value = 1
  if (searchWord.value) openAllCases()
})

// 跳到第幾處：標成目前這一處，再捲過去（捲到畫面中間，才不會被上面固定的列擋住）
async function goToMatch(number) {
  currentMatch.value = number
  await nextTick()
  document.getElementById(`match-${number}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// 上一處、下一處：到頭了就從另一頭繼續
function prevMatch() {
  goToMatch(currentMatch.value === 1 ? searchResult.value.total : currentMatch.value - 1)
}
function nextMatch() {
  goToMatch(currentMatch.value === searchResult.value.total ? 1 : currentMatch.value + 1)
}

// 在搜尋框按 Enter（手機鍵盤的「搜尋」）：跳到目前這一處，並收起鍵盤
function onSearchEnter(event) {
  if (searchResult.value.total) goToMatch(currentMatch.value)
  event.target.blur()
}

function clearSearch() {
  keyword.value = ''
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

          <!-- 搜尋框：左邊放大鏡，有字的時候右邊出現清除按鈕 -->
          <div class="relative">
            <SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
            <!-- enterkeyhint="search"：手機鍵盤的 Enter 鍵顯示成「搜尋」 -->
            <Input
              v-model="keyword"
              aria-label="搜尋全文"
              placeholder="搜尋全文關鍵字，例如：電梯、防水"
              enterkeyhint="search"
              class="pr-11 pl-10"
              @keydown.enter="onSearchEnter"
            />
            <button
              v-if="keyword"
              type="button"
              aria-label="清除搜尋"
              class="absolute top-0 right-0 flex size-11 items-center justify-center"
              @click="clearSearch"
            >
              <XIcon class="size-5" />
            </button>
          </div>

          <!-- 搜尋中、有找到：結果列取代目錄標籤，一樣固定在頂部列下面 -->
          <div v-if="searchWord && searchResult.total" class="sticky top-15 z-[5] -mx-5 bg-background px-5 py-2">
            <ArchiveSearchResultBar
              :keyword="searchWord"
              :current="currentMatch"
              :total="searchResult.total"
              @prev="prevMatch"
              @next="nextMatch"
            />
          </div>

          <!-- 搜尋中、沒找到 -->
          <Empty v-else-if="searchWord" class="gap-1 pt-6">
            <EmptyMedia>
              <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
            </EmptyMedia>
            <EmptyTitle class="type-greeting">找不到「{{ searchWord }}」相關內容</EmptyTitle>
            <EmptyDescription class="type-body">請換個關鍵字，例如：電梯、防水</EmptyDescription>
            <Button variant="outline" class="mt-4" @click="clearSearch">清除搜尋</Button>
          </Empty>

          <!-- 目錄標籤：捲動時固定在頂部列下面（top-15 是頂部列的高度 60px）。太多時可以左右滑 -->
          <!-- [scrollbar-width:none]、[&::-webkit-scrollbar]:hidden：藏起左右滑的捲軸 -->
          <nav
            v-if="!searchWord"
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

          <!-- 全文：搜尋沒找到時不顯示。標題和內容都用 MeetingHighlight，搜尋到的字會被標出來 -->
          <template
            v-for="block in searchWord && !searchResult.total ? [] : fullTextBlocks"
            :key="block.type === 'text' ? block.section.id : block.sections[0].id"
          >
            <!-- 一般段落。scroll-mt-32：跳過來時，上面留空間給頂部列和目錄標籤 -->
            <section v-if="block.type === 'text'" :id="block.section.id" class="scroll-mt-32 space-y-2">
              <h3 class="type-card-title text-heading">
                <MeetingHighlight :parts="searchResult.parts[block.section.id].heading" :current="currentMatch" />
              </h3>
              <p class="type-body whitespace-pre-line">
                <MeetingHighlight :parts="searchResult.parts[block.section.id].body" :current="currentMatch" />
              </p>
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
              >
                <template #heading>
                  <MeetingHighlight :parts="searchResult.parts[item.id].heading" :current="currentMatch" />
                </template>
                <template #body>
                  <MeetingHighlight :parts="searchResult.parts[item.id].body" :current="currentMatch" />
                </template>
              </MeetingCase>
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
