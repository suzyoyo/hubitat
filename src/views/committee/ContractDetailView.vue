<script setup>
// 管委會端・合約詳情（設計稿 1134:16362）：廠商名稱（查看廠商）、合約資訊、合約文件、歷次合約
// 廠商合約列表、廠商詳細、設備詳情的「查看合約」都連到這裡
// 合約金額、合約檔案只有管委會看得到（假 API 給其他角色時會拿掉）
// 合約文件（2026-10-16 和 013 決定）：點縮圖在 App 裡全螢幕預覽，左右滑換頁；「下載 PDF」是次要按鈕
//   真的上線時，上傳 PDF 後由後端把每一頁轉成圖片，畫面只顯示圖片（手機上最穩、長輩不用去找下載的檔案）
//   假資料沒有真的檔案：每一頁先用兩張示意圖代替（第 1 頁封面、其他內文），「下載 PDF」按了只跳提示
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, XIcon } from '@lucide/vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { contractBadge } from '@/components/admin/contractBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate } from '@/lib/date'
import { getContractById } from '@/mocks/api'
import { CONTRACT_STATUSES } from '@/mocks/data/contracts'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家
import coverPageUrl from '@/assets/contract-pages/cover.svg' // 合約封面頁的示意圖
import bodyPageUrl from '@/assets/contract-pages/body.svg' // 合約內文頁的示意圖

// 網址是 /committee/contracts/:id
const route = useRoute()

const loading = ref(true)
const contract = ref(null) // 編號不存在時，假 API 會回傳 undefined

async function load() {
  if (!route.params.id) return // 正要離開這一頁，不用拿
  loading.value = true
  contract.value = await getContractById(route.params.id, 'committee')
  loading.value = false
}
// 從一份合約點到歷次合約的另一份時，Vue 會沿用同一個頁面，所以看網址有沒有變
watch(() => route.params.id, load, { immediate: true })

const badge = computed(() => contractBadge(contract.value))

function periodText(item) {
  return `${formatFullDate(item.startDate)}～${formatFullDate(item.endDate)}`
}

const infoRows = computed(() => {
  const item = contract.value
  const rows = [{ label: '合約期間', value: periodText(item) }]
  if (item.amount) rows.push({ label: '合約金額', value: `${item.amount.toLocaleString()} 元／年` })
  rows.push({ label: '服務內容', value: item.service })
  if (item.frequency) rows.push({ label: '承諾頻率', value: item.frequency })
  return rows
})

// 合約文件：每個檔案的每一頁一張圖；src 先用示意圖，真的上線換成後端轉好的圖片網址
const pages = computed(() => {
  const files = contract.value.files ?? []
  return files.flatMap((file) =>
    Array.from({ length: file.pages }, (_, index) => ({
      key: `${file.name}-${index + 1}`,
      src: index === 0 ? coverPageUrl : bodyPageUrl,
    })),
  )
})

// ── 全螢幕預覽 ─────────────────────────────────
// 一頁一張圖橫著排，左右滑換頁（scroll-snap 讓它停在整頁）；也有上一頁、下一頁按鈕
const previewOpen = ref(false)
const currentPage = ref(0) // 現在看第幾頁（從 0 開始）
const track = ref(null) // 橫向捲動的那一排

async function openPreview(index) {
  currentPage.value = index
  previewOpen.value = true
  await nextTick()
  // 彈窗打開後，直接捲到點的那一頁（不要動畫）
  requestAnimationFrame(() => track.value?.scrollTo({ left: index * track.value.clientWidth }))
}

// 滑動時，用捲了多遠算出現在是第幾頁
function onScroll() {
  const el = track.value
  if (el) currentPage.value = Math.round(el.scrollLeft / el.clientWidth)
}

function goPage(index) {
  const el = track.value
  if (!el) return
  el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
}

function download() {
  const file = contract.value.files?.[0]
  toast.success('已開始下載', { description: file ? file.name : '' })
}
</script>

<template>
  <div class="space-y-4 px-5 pt-4 pb-5">
    <template v-if="loading">
      <Skeleton class="h-[44px] rounded-xl" />
      <Skeleton class="h-[190px] rounded-xl" />
      <Skeleton class="h-[250px] rounded-xl" />
    </template>

    <!-- 找不到這份合約 -->
    <Empty v-else-if="!contract" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這份合約</EmptyTitle>
      <EmptyDescription class="type-body">可能已經刪除，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink to="/committee/contracts">回到廠商合約</RouterLink>
      </Button>
    </Empty>

    <template v-else>
      <!-- 廠商名稱，右邊「查看廠商」 -->
      <div class="flex items-center gap-3">
        <h2 class="min-w-0 flex-1 type-title text-foreground">{{ contract.vendorName }}</h2>
        <RouterLink
          :to="`/committee/vendors/${contract.vendorId}`"
          class="flex min-h-11 shrink-0 items-center gap-1 type-link text-foreground"
        >
          查看廠商
          <ChevronRightIcon class="size-4" />
        </RouterLink>
      </div>

      <!-- 合約資訊 -->
      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-start gap-2">
          <h2 class="min-w-0 flex-1 type-card-title text-foreground">合約資訊</h2>
          <Badge :variant="badge.variant" class="mt-0.5 shrink-0">{{ badge.text }}</Badge>
        </div>
        <div v-for="row in infoRows" :key="row.label" class="flex items-baseline gap-3">
          <p class="shrink-0 type-date text-muted-foreground">{{ row.label }}</p>
          <p class="min-w-0 flex-1 text-right type-body-strong text-foreground">{{ row.value }}</p>
        </div>
      </section>

      <!-- 合約文件：一頁一格縮圖、下載、誰在什麼時候上傳 -->
      <section v-if="contract.files" class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">合約文件</h2>
        <div v-if="pages.length" class="grid grid-cols-3 gap-3">
          <!-- 點縮圖：全螢幕預覽，從這一頁開始看 -->
          <button
            v-for="(page, index) in pages"
            :key="page.key"
            type="button"
            class="space-y-1 text-center"
            :aria-label="`看第 ${index + 1} 頁`"
            @click="openPreview(index)"
          >
            <img :src="page.src" alt="" class="aspect-[210/297] w-full rounded-lg border bg-white object-cover" />
            <span class="type-date text-muted-foreground">第 {{ index + 1 }} 頁</span>
          </button>
        </div>
        <p v-else class="type-body text-muted-foreground">還沒有上傳合約檔案</p>
        <Button v-if="pages.length" variant="secondary" class="w-full" @click="download">
          <DownloadIcon />
          下載 PDF
        </Button>
        <p v-if="pages.length" class="type-date text-muted-foreground">點頁面可以放大看</p>
        <p class="type-date text-muted-foreground">由{{ contract.uploadedByLabel }}於 {{ formatFullDate(contract.uploadedAt) }} 上傳</p>
      </section>

      <!-- 歷次合約：同一家廠商的其他合約，新的在前；點了看那一份 -->
      <section v-if="contract.history.length" class="space-y-1 rounded-xl bg-card p-4 shadow-card">
        <h2 class="pb-2 type-card-title text-foreground">歷次合約</h2>
        <template v-for="(item, index) in contract.history" :key="item.id">
          <Separator v-if="index > 0" />
          <RouterLink :to="`/committee/contracts/${item.id}`" class="flex items-center gap-3 py-3">
            <div class="min-w-0 flex-1">
              <p class="type-body-strong text-foreground">{{ periodText(item) }}</p>
              <p class="type-date text-muted-foreground">{{ CONTRACT_STATUSES[item.status].label }}</p>
            </div>
            <p v-if="item.amount" class="shrink-0 type-body text-foreground">{{ item.amount.toLocaleString() }} 元／年</p>
            <ChevronRightIcon class="size-5 shrink-0" />
          </RouterLink>
        </template>
      </section>
    </template>

    <!-- 全螢幕預覽：深色底、上面是頁數和關閉，中間左右滑換頁，下面是上一頁、下一頁 -->
    <Dialog v-model:open="previewOpen">
      <DialogContent
        v-if="contract"
        :show-close-button="false"
        class="flex h-dvh max-w-none flex-col gap-0 rounded-none bg-neutral-900 p-0 text-white ring-0 sm:max-w-none"
      >
        <div class="flex items-center gap-2 px-3 py-2">
          <DialogTitle class="min-w-0 flex-1 truncate type-body-strong! text-white">
            {{ contract.vendorName }}・第 {{ currentPage + 1 }} / {{ pages.length }} 頁
          </DialogTitle>
          <DialogDescription class="sr-only">左右滑動可以換頁，兩指可以放大</DialogDescription>
          <DialogClose as-child>
            <Button variant="ghost" size="icon" class="size-11 text-white hover:bg-white/10" aria-label="關閉預覽">
              <XIcon class="size-6" />
            </Button>
          </DialogClose>
        </div>
        <div ref="track" class="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto" @scroll.passive="onScroll">
          <div v-for="(page, index) in pages" :key="page.key" class="flex w-full shrink-0 snap-center items-center justify-center p-4">
            <img :src="page.src" :alt="`第 ${index + 1} 頁`" class="max-h-full max-w-full rounded bg-white" />
          </div>
        </div>
        <div class="flex items-center justify-between px-3 py-3">
          <Button variant="ghost" class="h-11 text-white hover:bg-white/10" :disabled="currentPage === 0" @click="goPage(currentPage - 1)">
            <ChevronLeftIcon />
            上一頁
          </Button>
          <Button
            variant="ghost"
            class="h-11 text-white hover:bg-white/10"
            :disabled="currentPage === pages.length - 1"
            @click="goPage(currentPage + 1)"
          >
            下一頁
            <ChevronRightIcon />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
