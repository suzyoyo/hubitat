<script setup>
// 管委會端、管理人員端共用・快速留存（「＋」選單的「快速留存」，設計稿 1134:19280）
// 先拍下收據、單據或現場照片，之後再補齊資料：照片、名稱、備註都是選填，但至少要有一樣
// 留存後會出現在自己的待辦「需補資料」裡；一開始就選了關聯案件的，直接附到那件案件的處理紀錄（2026-10-19），不會進待辦
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import LeaveConfirmDialog from '@/components/feedback/LeaveConfirmDialog.vue'
import BottomCta from '@/components/app/BottomCta.vue'
import CaseAttachmentList from '@/components/case/CaseAttachmentList.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { restoreDraft } from '@/lib/draft'
import { addQuickSave, getCases, getCurrentUser, linkQuickSaveToCase } from '@/mocks/api'

const PHOTO_MAX = 5 // 照片最多幾張（和回報完成的附件一樣）
const NAME_MAX = 40 // 名稱最多幾個字
const NOTE_MAX = 300 // 備註最多幾個字（設計稿寫 0 / 300）

// 網址是 /committee/quick-saves/new 或 /staff/quick-saves/new；route.meta.roleId 是目前在哪一端
const route = useRoute()
const router = useRouter()

const photos = ref([]) // 照片的檔名
const name = ref('')
const note = ref('')
const pending = ref(false) // 送出還在路上

// 關聯案件（選填）：NONE 代表不關聯；下拉選單只列處理中的案件（和留存詳情的「歸到案件」一樣）
const NONE = 'none'
const caseId = ref(NONE)
const openCases = ref([])
const pickedCase = computed(() => openCases.value.find((entry) => entry.id === caseId.value))

// 之前存成草稿的話，打開時帶回來
onMounted(async () => {
  const [user, caseList] = await Promise.all([getCurrentUser(route.meta.roleId), getCases()])
  openCases.value = caseList.filter((entry) => ['accepted', 'in_progress'].includes(entry.status))
  await restoreDraft(user.id, route.fullPath, (data) => {
    photos.value = data.photos
    name.value = data.name
    note.value = data.note
    caseId.value = data.caseId ?? NONE
  })
})

// 三樣都沒填就不能留存（留一筆空的沒有意義）
const isEmpty = computed(() => !photos.value.length && !name.value.trim() && !note.value.trim())

async function submit() {
  pending.value = true
  const user = await getCurrentUser(route.meta.roleId)
  const item = await addQuickSave(user.id, { name: name.value.trim(), note: note.value.trim(), photos: photos.value })
  // 選了關聯案件：直接附到那件案件（留存變成已補齊，不會進待辦）
  const linked = pickedCase.value ? await linkQuickSaveToCase(item.id, user.id, caseId.value) : null
  pending.value = false
  saved.value = true // 送出成功，換頁時不用再問
  if (linked) toast.success('已留存', { description: `已附在「${pickedCase.value.title}」的處理紀錄` })
  else toast.success('已留存', { description: '已加到你的待辦，之後再補齊資料' })
  // 回到上一頁；直接打網址進來的沒有上一頁，就回首頁
  if (window.history.state?.back) router.back()
  else router.replace(`/${route.meta.roleId}/home`)
}

// 有沒有填東西（離開前確認用）；留存成功後 saved 變 true，換頁不用再問
const saved = ref(false)
const isDirty = computed(() => !saved.value && Boolean(photos.value.length || name.value.trim() || note.value.trim()))
</script>

<template>
  <!-- 底部按鈕下面還有一行說明，pb-32 留空間給它 -->
  <form class="space-y-6 px-5 pt-4 pb-32" novalidate @submit.prevent="submit">
    <!-- 關聯案件（2026-10-19）：一開始就知道是哪件案件的，選了就直接附過去 -->
    <div class="space-y-2">
      <Label for="quick-save-case" class="text-base">
        關聯案件<span class="type-date text-muted-foreground">選填</span>
      </Label>
      <Select v-model="caseId">
        <!-- ui/select 本身會把高度蓋成 32px、字蓋成 14px，要這樣寫才是 44px、16px（同新增交辦） -->
        <SelectTrigger id="quick-save-case" class="w-full bg-card type-body! data-[size=default]:h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="NONE" class="min-h-11 px-3 type-body!">不關聯，之後再補</SelectItem>
          <SelectItem v-for="entry in openCases" :key="entry.id" :value="entry.id" class="min-h-11 px-3 type-body!">
            {{ entry.title }}
          </SelectItem>
        </SelectContent>
      </Select>
      <p class="type-date text-muted-foreground">只列出處理中的案件</p>
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <p class="text-base font-medium text-foreground">
          收據或單據照片<span class="ml-1.5 type-date text-muted-foreground">選填</span>
        </p>
        <Badge variant="outline">{{ photos.length }}/{{ PHOTO_MAX }}</Badge>
      </div>
      <CaseAttachmentList v-model="photos" :max="PHOTO_MAX" />
    </div>

    <div class="space-y-2">
      <Label for="quick-save-name" class="text-base">
        名稱<span class="type-date text-muted-foreground">選填</span>
      </Label>
      <Input id="quick-save-name" v-model="name" placeholder="例：電梯保養單 10/01" :maxlength="NAME_MAX" />
    </div>

    <div class="space-y-2">
      <Label for="quick-save-note" class="text-base">
        備註<span class="type-date text-muted-foreground">選填</span>
      </Label>
      <Textarea
        id="quick-save-note"
        v-model="note"
        placeholder="之後補齊時會用到的說明"
        :maxlength="NOTE_MAX"
        class="min-h-[88px]"
      />
      <p class="type-date text-muted-foreground">{{ note.length }} / {{ NOTE_MAX }} 字</p>
    </div>

    <BottomCta :note="pickedCase ? '留存後會附在這件案件的處理紀錄' : '留存後會放進你的待辦，之後再補齊資料'">
      <Button type="submit" :disabled="isEmpty || pending">留存</Button>
    </BottomCta>
    <!-- 填到一半想離開時先問一次 -->
    <LeaveConfirmDialog :dirty="isDirty" draft-title="快速留存" :draft-data="{ photos, name, note, caseId }" />
  </form>
</template>
