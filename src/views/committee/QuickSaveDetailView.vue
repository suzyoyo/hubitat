<script setup>
// 管委會端、管理人員端共用・留存詳情（待辦「需補資料」的留存點進來，2026-10-18）
// 設計稿沒有這一頁，版面照快速留存（1134:19280）和案件詳情的卡片
//   還沒補齊：底部選一件處理中的案件 →「歸到這件案件」→ 跳到那件案件的詳情（接著可以完工驗收）
//   已經補齊：顯示歸到哪裡，可以點過去
// 設備不在這裡選：到案件詳情的「關聯設備」選
import { ChevronRightIcon } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomCta from '@/components/app/BottomCta.vue'
import CaseFileGrid from '@/components/case/CaseFileGrid.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFullDate, formatTime } from '@/lib/date'
import { getCases, getCurrentUser, getQuickSaveById, linkQuickSaveToCase } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// 網址是 /committee/quick-saves/:id 或 /staff/quick-saves/:id；route.meta.roleId 是目前在哪一端
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const item = ref(null) // 這一筆留存；編號不存在時是 undefined
const userId = ref('')
const openCases = ref([]) // 下拉選單可以選的案件
const pickedCaseId = ref('')
const pending = ref(false) // 送出還在路上

async function load() {
  if (!route.params.id) return // 正要離開這一頁，不用拿
  loading.value = true
  const [user, save, caseList] = await Promise.all([
    getCurrentUser(route.meta.roleId),
    getQuickSaveById(route.params.id),
    getCases(),
  ])
  userId.value = user.id
  // 已經歸到案件的，直接換到那件案件的詳情（2026-10-19）：要看的是案件，留存只是附在處理紀錄裡
  if (save?.linked?.type === 'case') {
    router.replace(`/${route.meta.roleId}/cases/${save.linked.id}`)
    return
  }
  item.value = save
  // 只列處理中的案件（已受理、處理中）：還沒受理的先去受理，待結案的已經完工了
  openCases.value = caseList.filter((entry) => ['accepted', 'in_progress'].includes(entry.status))
  loading.value = false
}
watch(() => route.params.id, load, { immediate: true })

// 能不能補齊：自己留存的、還沒補齊的
const canLink = computed(() => item.value?.ownerId === userId.value && !item.value.resolved)

// 管委會、管理人員端的日期有年份：2026/10/01 13:42
const savedText = computed(() => `${formatFullDate(item.value.savedAt)} ${formatTime(item.value.savedAt)}`)

// 已補齊的：歸到哪裡、點了去哪裡
const linkedPath = computed(() => {
  const linked = item.value?.linked
  if (!linked) return ''
  return `/${route.meta.roleId}/${linked.type === 'case' ? 'cases' : 'equipment'}/${linked.id}`
})

async function submit() {
  pending.value = true
  const save = await linkQuickSaveToCase(item.value.id, userId.value, pickedCaseId.value)
  pending.value = false
  if (!save) {
    toast.error('沒有歸檔成功', { description: '案件的狀態可能已經改變，請重新整理後再試一次' })
    return
  }
  const picked = openCases.value.find((entry) => entry.id === pickedCaseId.value)
  toast.success('已歸到案件', { description: `已附在「${picked.title}」的處理紀錄` })
  // 換到那件案件的詳情；用 replace，按返回不會回到這一頁（已經補齊了）
  router.replace(`/${route.meta.roleId}/cases/${pickedCaseId.value}`)
}
</script>

<template>
  <div class="space-y-4 px-5 pt-4" :class="canLink ? 'pb-56' : 'pb-5'">
    <template v-if="loading">
      <Skeleton class="h-[83px] rounded-xl" />
      <Skeleton class="h-[180px] rounded-xl" />
    </template>

    <Empty v-else-if="!item" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這筆留存</EmptyTitle>
      <EmptyDescription class="type-body">可能已經刪除，或是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink :to="`/${route.meta.roleId}/home`">回到首頁</RouterLink>
      </Button>
    </Empty>

    <template v-else>
      <!-- 名稱、狀態、誰什麼時候留存的 -->
      <section class="space-y-1.5 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-start justify-between gap-2">
          <h2 class="type-card-title text-foreground">{{ item.name || '未命名的留存' }}</h2>
          <!-- 管理端的徽章：輪到你處理的橘、已結束的灰 -->
          <Badge :variant="item.resolved ? 'outline' : 'secondary'" class="shrink-0">
            {{ item.resolved ? '已補齊' : '尚待補齊' }}
          </Badge>
        </div>
        <p class="type-date text-muted-foreground">{{ item.ownerLabel }}・{{ savedText }} 留存</p>
      </section>

      <section class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">收據或單據照片</h2>
        <CaseFileGrid v-if="item.photos.length" :files="item.photos" title="留存照片" />
        <p v-else class="type-body text-muted-foreground">沒有照片</p>
      </section>

      <section v-if="item.note" class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <h2 class="type-card-title text-foreground">備註</h2>
        <p class="type-body whitespace-pre-line text-foreground">{{ item.note }}</p>
      </section>

      <!-- 已補齊：歸到哪裡，整列可以點 -->
      <RouterLink
        v-if="item.resolved && linkedPath"
        :to="linkedPath"
        class="flex items-center gap-3 rounded-xl bg-card p-4 shadow-card"
      >
        <div class="min-w-0 flex-1 space-y-0.5">
          <p class="type-date text-muted-foreground">已歸到{{ item.linked.type === 'case' ? '案件' : '設備' }}</p>
          <p class="type-body-strong text-foreground">{{ item.linkedTitle }}</p>
        </div>
        <ChevronRightIcon class="size-5 shrink-0 text-muted-foreground" />
      </RouterLink>
    </template>

    <!-- 還沒補齊：選一件案件，歸過去 -->
    <BottomCta v-if="!loading && canLink" vertical note="會附在案件的處理紀錄，接著可以完工驗收">
      <div class="space-y-2">
        <Label for="quick-save-case" class="text-base">歸到哪一件案件</Label>
        <Select v-model="pickedCaseId">
          <!-- ui/select 本身會把高度蓋成 32px、字蓋成 14px，要這樣寫才是 44px、16px（同新增交辦） -->
          <SelectTrigger id="quick-save-case" class="w-full bg-card type-body! data-[size=default]:h-11">
            <SelectValue placeholder="選擇處理中的案件" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="entry in openCases" :key="entry.id" :value="entry.id" class="min-h-11 px-3 type-body!">
              {{ entry.title }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button :disabled="!pickedCaseId || pending" @click="submit">歸到這件案件</Button>
    </BottomCta>
  </div>
</template>
