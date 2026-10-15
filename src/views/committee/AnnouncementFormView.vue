<script setup>
// 管委會端・發布公告／修改公告：同一個表單，網址不一樣
//   /committee/announcements/new       發布公告（空白表單）
//   /committee/announcements/:id/edit  修改公告（先填好原本的內容）
// 欄位照設計稿，三種表單不一樣（施工維護 1134:15770、活動 1134:14426、其他 1134:17972）
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomCta from '@/components/app/BottomCta.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  canPublishAnnouncement,
  createAnnouncement,
  getAnnouncementById,
  getAreas,
  getCases,
  getCurrentUser,
  getEquipmentList,
  updateAnnouncement,
} from '@/mocks/api'
import { ANNOUNCEMENT_TYPES } from '@/mocks/data/announcements'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const route = useRoute()
const router = useRouter()

// 網址有 :id 就是修改，沒有就是發布
const editId = route.params.id
const isEdit = Boolean(editId)

// 內容說明最多幾個字（設計稿施工維護的表單寫 300）
const CONTENT_MAX = 300
// 下拉選單「不關聯」用的值（選單的值不能是空字串）
const NONE = 'none'

// 公告類型的選項：施工、維護、活動、其他
const TYPE_OPTIONS = Object.entries(ANNOUNCEMENT_TYPES).map(([value, info]) => ({ value, label: info.label }))
// 推播通知的選項（只有施工、維護的表單有）
const PUSH_OPTIONS = [
  { value: 'affected', label: '通知影響範圍內住戶' },
  { value: 'all', label: '通知全社區' },
  { value: 'none', label: '不推播' },
]

const loading = ref(true)
const userId = ref('')
// 能不能用這個表單：發布要有權限；修改要是能改的公告（假 API 的 canEdit）
const allowed = ref(false)
// 修改時原本的公告；有些欄位表單上沒有，要沿用原本的值
const original = ref(null)
// 選項的資料
const areas = ref([])
const cases = ref([])
const equipment = ref([])

// 表單上每個欄位的值
const form = reactive({
  type: 'construction', // 發布時預設是施工；修改時換成原本的類型
  title: '',
  content: '',
  dateMode: 'single', // 'single' 單日 / 'multi' 多日
  startDate: '', // '2026-10-10'
  endDate: '', // 多日才用
  startTime: '',
  endTime: '',
  areaIds: [],
  place: '', // 活動地點
  organizer: '',
  caseId: NONE,
  equipmentId: NONE,
  isUrgent: false,
  push: 'affected',
})

// 把原本的公告填進表單（修改時用）
function fillForm(item) {
  const [startDate, startTime] = item.startAt.split('T')
  const [endDate, endTime] = item.endAt.split('T')
  Object.assign(form, {
    type: item.type,
    title: item.title,
    content: item.content,
    dateMode: startDate === endDate ? 'single' : 'multi',
    startDate,
    endDate,
    startTime,
    endTime,
    areaIds: [...item.areaIds],
    place: item.place ?? '',
    organizer: item.organizer ?? '',
    caseId: item.caseId ?? NONE,
    equipmentId: item.equipmentId ?? NONE,
    isUrgent: item.isUrgent,
    push: item.push,
  })
}

onMounted(async () => {
  const user = await getCurrentUser('committee')
  userId.value = user.id
  const [areaList, caseList, equipmentList, item] = await Promise.all([
    getAreas(),
    getCases(),
    getEquipmentList(),
    isEdit ? getAnnouncementById(editId, 'committee', user.id) : null,
  ])
  areas.value = areaList
  cases.value = caseList
  equipment.value = equipmentList
  if (isEdit) {
    allowed.value = Boolean(item?.canEdit)
    if (allowed.value) {
      original.value = item
      fillForm(item)
    }
  } else {
    allowed.value = canPublishAnnouncement(user.id)
  }
  loading.value = false
})

// ── 依類型決定有哪些欄位（照設計稿） ─────────────────────
//              影響範圍   活動地點   主辦單位   關聯案件設備   推播
//   施工、維護   按鈕       －         －         有             有
//   活動         －         打字       有         －             －
//   其他         按鈕       －         有         有             －
const isWorks = computed(() => ['construction', 'maintenance'].includes(form.type))
const isActivity = computed(() => form.type === 'activity')

// 欄位名稱也照設計稿，三種表單的寫法不一樣
const labels = computed(() => ({
  title: isWorks.value ? '公告標題' : '標題',
  content: isWorks.value ? '內容說明' : '內容',
  date: { construction: '施工日期', maintenance: '維護日期', activity: '活動日期' }[form.type] ?? '日期時間',
  areas: isWorks.value ? '影響範圍' : '地點／影響範圍',
  organizer: isActivity.value ? '主辦單位' : '主辦／負責單位',
}))

// 標題的提示文字：依類型舉一個例子（設計稿的標題是填好的範例，沒有提示文字）
const titlePlaceholder = computed(
  () =>
    ({
      construction: '例如：B 棟頂樓防水施工',
      maintenance: '例如：A 棟電梯定期保養',
      activity: '例如：中秋社區烤肉聯誼',
    })[form.type] ?? '例如：社區年度消毒與除蟲',
)

// 影響範圍的按鈕：全社區＋各範圍
const areaOptions = computed(() => [
  { value: 'all', label: '全社區' },
  ...areas.value.map((area) => ({ value: area.id, label: area.name })),
])

// 選影響範圍：「全社區」和其他的不能同時選
//   選了全社區 → 只留全社區；全社區之外又選了別的 → 拿掉全社區
function selectAreas(values) {
  const justPickedAll = values.includes('all') && !form.areaIds.includes('all')
  form.areaIds = justPickedAll ? ['all'] : values.filter((value) => value !== 'all')
}

// ── 檢查有沒有填好 ─────────────────────────────────
// 按過一次送出才顯示錯誤，不然一打開就滿滿紅字
const submitted = ref(false)

const errors = computed(() => {
  const result = {}
  if (!form.title.trim()) result.title = `請填寫${labels.value.title}`
  if (!form.content.trim()) result.content = `請填寫${labels.value.content}`
  const multi = form.dateMode === 'multi'
  if (!form.startDate || (multi && !form.endDate) || !form.startTime || !form.endTime) {
    result.date = '請選好日期和時間'
  } else if (multi && form.endDate <= form.startDate) {
    result.date = '結束日期要比開始日期晚'
  } else if (form.endTime <= form.startTime) {
    result.date = '結束時間要比開始時間晚'
  }
  if (!isActivity.value && form.areaIds.length === 0) result.areas = '請至少選一個範圍'
  if (isActivity.value && !form.place.trim()) result.place = '請填寫活動地點'
  if (!isWorks.value && !form.organizer.trim()) result.organizer = `請填寫${labels.value.organizer}`
  return result
})

// 送出時要顯示的錯誤：還沒按過送出就是空的
const shownErrors = computed(() => (submitted.value ? errors.value : {}))

// ── 送出 ───────────────────────────────────────
// 把表單轉成假 API 要的資料；表單上沒有的欄位用預設值，修改時沿用原本的值
function toInput() {
  const multi = form.dateMode === 'multi'
  const endDate = multi ? form.endDate : form.startDate
  const keep = original.value ?? {}
  return {
    type: form.type,
    title: form.title.trim(),
    content: form.content.trim(),
    startAt: `${form.startDate}T${form.startTime}`,
    endAt: `${endDate}T${form.endTime}`,
    // 多日的公告，時間是「每天」的時段
    timeText: multi ? `每日 ${form.startTime}–${form.endTime}` : '',
    // 活動沒有影響範圍可以選，一律是全社區
    areaIds: isActivity.value ? ['all'] : form.areaIds,
    place: isActivity.value ? form.place.trim() : '',
    // 施工、維護沒有主辦單位可以填：修改時沿用原本的，新的填「管理室」
    organizer: isWorks.value ? (keep.organizer ?? '管理室') : form.organizer.trim(),
    // 推播：施工、維護照選的；活動通知全社區；其他通知影響範圍內住戶
    push: isWorks.value ? form.push : isActivity.value ? 'all' : 'affected',
    // 關聯案件與設備：活動沒有，修改時沿用原本的
    caseId: isActivity.value ? keep.caseId : form.caseId === NONE ? '' : form.caseId,
    equipmentId: isActivity.value ? keep.equipmentId : form.equipmentId === NONE ? '' : form.equipmentId,
    isUrgent: form.isUrgent,
  }
}

// 底部主要按鈕的文字
const submitLabel = computed(() => {
  if (!isEdit) return '發布公告'
  return '儲存修改'
})

const pending = ref(false)

async function submit() {
  submitted.value = true
  if (Object.keys(errors.value).length > 0) {
    toast.error('還有欄位沒填好')
    return
  }
  pending.value = true
  const result = isEdit
    ? await updateAnnouncement(editId, userId.value, toInput())
    : await createAnnouncement(userId.value, toInput())
  pending.value = false
  if (!result) {
    toast.error(isEdit ? '修改失敗' : '發布失敗', { description: '這則公告的狀態已經變了，請重新整理。' })
    return
  }
  if (isEdit) {
    toast.success('公告已更新')
    // 修改是從詳情頁點進來的：回到那一頁（不要再開一頁，瀏覽紀錄才不會有兩個一樣的詳情頁）
    // 直接打網址進來的，就換成詳情頁
    const detailPath = `/committee/announcements/${result.id}`
    if (window.history.state?.back === detailPath) router.back()
    else router.replace(detailPath)
    return
  }
  toast.success(result.status === 'pending' ? '已送出審核' : '公告已發布')
  // replace：換掉表單這一頁，按返回不會回到填好的表單
  router.replace(`/committee/announcements/${result.id}`)
}

// 點日期、時間框的任何地方，都直接跳出選日期或時間的畫面
// （瀏覽器預設要點到右邊的小圖示才會跳出來；showPicker 是瀏覽器內建的功能）
function openPicker(event) {
  event.target.showPicker?.()
}

// 取消：回到上一頁；直接打網址進來的沒有上一頁，就回管委會首頁
function cancel() {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.replace('/committee/home')
  }
}
</script>

<template>
  <!-- 底部有兩顆上下排的按鈕，pb-40 留空間給它 -->
  <div class="px-5 pt-4" :class="allowed ? 'pb-40' : 'pb-5'">
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-[136px] rounded-xl" />
      <Skeleton class="h-[72px] rounded-xl" />
      <Skeleton class="h-[92px] rounded-xl" />
    </div>

    <!-- 沒有權限，或這則公告不能修改 -->
    <Empty v-else-if="!allowed" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">{{ isEdit ? '這則公告不能修改' : '你沒有發布公告的權限' }}</EmptyTitle>
      <EmptyDescription class="type-body">
        {{ isEdit ? '可能已經結束、已撤回、還在審核中，或你不是發布者。' : '只有主委、副主委和管理人員可以發布公告。' }}
      </EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink to="/committee/home">回到首頁</RouterLink>
      </Button>
    </Empty>

    <form v-else class="space-y-5" novalidate @submit.prevent="submit">
      <!-- 公告類型：一排兩個的大選項 -->
      <fieldset class="space-y-2">
        <legend class="mb-2 text-base font-medium text-foreground">
          公告類型 <span class="text-warning-strong">*</span>
        </legend>
        <RadioGroup v-model="form.type" class="grid grid-cols-2 gap-2">
          <!-- 用 label 包住整個選項：點選項任何地方，都等於點裡面那個圓圈 -->
          <label
            v-for="option in TYPE_OPTIONS"
            :key="option.value"
            class="flex h-[52px] items-center gap-3 rounded-xl border bg-card px-4 type-body-strong text-foreground"
            :class="option.value === form.type ? 'border-foreground' : 'border-border'"
          >
            <RadioGroupItem :value="option.value" class="size-5" />
            {{ option.label }}
          </label>
        </RadioGroup>
      </fieldset>

      <div class="space-y-2">
        <Label for="an-title" class="text-base">
          {{ labels.title }} <span class="text-warning-strong">*</span>
        </Label>
        <Input id="an-title" v-model="form.title" :placeholder="titlePlaceholder" maxlength="40" :aria-invalid="Boolean(shownErrors.title)" />
        <p v-if="shownErrors.title" class="type-date text-warning-strong">{{ shownErrors.title }}</p>
      </div>

      <!-- 活動、其他：內容在日期前面 -->
      <div v-if="!isWorks" class="space-y-2">
        <Label for="an-content" class="text-base">
          {{ labels.content }} <span class="text-warning-strong">*</span>
        </Label>
        <Textarea
          id="an-content"
          v-model="form.content"
          placeholder="請輸入公告內容詳情…"
          :maxlength="CONTENT_MAX"
          class="min-h-[100px]"
          :aria-invalid="Boolean(shownErrors.content)"
        />
        <div class="flex gap-3">
          <p class="min-w-0 flex-1 type-date text-warning-strong">{{ shownErrors.content }}</p>
          <p class="shrink-0 type-date text-muted-foreground">{{ form.content.length }} / {{ CONTENT_MAX }} 字</p>
        </div>
      </div>

      <!-- 施工、維護、其他：影響範圍的按鈕（可多選） -->
      <fieldset v-if="!isActivity" class="space-y-2">
        <legend class="mb-2 flex items-center gap-2 text-base font-medium text-foreground">
          {{ labels.areas }} <span class="text-warning-strong">*</span>
          <span class="type-label text-muted-foreground">可多選</span>
        </legend>
        <p class="type-date text-muted-foreground">已選 {{ form.areaIds.length }} 項</p>
        <!-- spacing="2"：按鈕之間留 8px，不黏在一起（和 FilterChips 一樣）-->
        <!-- gap-y-3：上下兩排隔 12px，每顆往上下各補 6px 後剛好不會重疊 -->
        <ToggleGroup
          type="multiple"
          :spacing="2"
          :model-value="form.areaIds"
          class="w-full flex-wrap justify-start gap-y-3"
          @update:model-value="selectAreas"
        >
          <!-- 看起來 32px 高，after 往上下各補 6px，可以點的範圍是 44px（和篩選標籤一樣） -->
          <ToggleGroupItem
            v-for="option in areaOptions"
            :key="option.value"
            :value="option.value"
            class="relative rounded-full border border-input bg-card px-4 type-button text-foreground after:absolute after:inset-x-0 after:-inset-y-1.5 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:data-[state=on]:bg-primary"
          >
            {{ option.label }}
          </ToggleGroupItem>
        </ToggleGroup>
        <p v-if="shownErrors.areas" class="type-date text-warning-strong">{{ shownErrors.areas }}</p>
      </fieldset>

      <!-- 日期：單日／多日，再選日期和時間 -->
      <fieldset class="space-y-2">
        <legend class="mb-2 text-base font-medium text-foreground">
          {{ labels.date }} <span class="text-warning-strong">*</span>
        </legend>
        <div class="grid grid-cols-2 gap-2">
          <Button
            type="button"
            :variant="form.dateMode === 'single' ? 'default' : 'outline'"
            :aria-pressed="form.dateMode === 'single'"
            @click="form.dateMode = 'single'"
          >
            單日
          </Button>
          <Button
            type="button"
            :variant="form.dateMode === 'multi' ? 'default' : 'outline'"
            :aria-pressed="form.dateMode === 'multi'"
            @click="form.dateMode = 'multi'"
          >
            多日
          </Button>
        </div>
        <!-- 日期、時間先用手機內建的轉盤（type="date"、type="time"）；之後有月曆元件再換 -->
        <div class="grid gap-2" :class="form.dateMode === 'multi' ? 'grid-cols-2' : 'grid-cols-1'">
          <div class="space-y-1.5">
            <Label for="an-start-date" class="type-date text-muted-foreground">
              {{ form.dateMode === 'multi' ? '開始日期' : '日期' }}
            </Label>
            <Input id="an-start-date" v-model="form.startDate" type="date" @click="openPicker" />
          </div>
          <div v-if="form.dateMode === 'multi'" class="space-y-1.5">
            <Label for="an-end-date" class="type-date text-muted-foreground">結束日期</Label>
            <Input id="an-end-date" v-model="form.endDate" type="date" :min="form.startDate" @click="openPicker" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1.5">
            <Label for="an-start-time" class="type-date text-muted-foreground">
              {{ form.dateMode === 'multi' ? '每日開始時間' : '開始時間' }}
            </Label>
            <Input id="an-start-time" v-model="form.startTime" type="time" @click="openPicker" />
          </div>
          <div class="space-y-1.5">
            <Label for="an-end-time" class="type-date text-muted-foreground">
              {{ form.dateMode === 'multi' ? '每日結束時間' : '結束時間' }}
            </Label>
            <Input id="an-end-time" v-model="form.endTime" type="time" @click="openPicker" />
          </div>
        </div>
        <p v-if="shownErrors.date" class="type-date text-warning-strong">{{ shownErrors.date }}</p>
      </fieldset>

      <!-- 施工、維護：內容在日期後面 -->
      <div v-if="isWorks" class="space-y-2">
        <Label for="an-content" class="text-base">
          {{ labels.content }} <span class="text-warning-strong">*</span>
        </Label>
        <Textarea
          id="an-content"
          v-model="form.content"
          placeholder="請輸入公告內容詳情…"
          :maxlength="CONTENT_MAX"
          class="min-h-[100px]"
          :aria-invalid="Boolean(shownErrors.content)"
        />
        <div class="flex gap-3">
          <p class="min-w-0 flex-1 type-date text-warning-strong">{{ shownErrors.content }}</p>
          <p class="shrink-0 type-date text-muted-foreground">{{ form.content.length }} / {{ CONTENT_MAX }} 字</p>
        </div>
      </div>

      <!-- 活動：活動地點（打字） -->
      <div v-if="isActivity" class="space-y-2">
        <Label for="an-place" class="text-base">活動地點 <span class="text-warning-strong">*</span></Label>
        <Input id="an-place" v-model="form.place" placeholder="例如：A 棟中庭" maxlength="20" :aria-invalid="Boolean(shownErrors.place)" />
        <p v-if="shownErrors.place" class="type-date text-warning-strong">{{ shownErrors.place }}</p>
      </div>

      <!-- 活動、其他：主辦單位 -->
      <div v-if="!isWorks" class="space-y-2">
        <Label for="an-organizer" class="text-base">
          {{ labels.organizer }} <span class="text-warning-strong">*</span>
        </Label>
        <Input
          id="an-organizer"
          v-model="form.organizer"
          placeholder="例如：管理委員會"
          maxlength="20"
          :aria-invalid="Boolean(shownErrors.organizer)"
        />
        <p v-if="shownErrors.organizer" class="type-date text-warning-strong">{{ shownErrors.organizer }}</p>
      </div>

      <!-- 施工、維護、其他：關聯案件與設備（選填；設計稿的「其他」沒有，2026-10-14 決定加上） -->
      <section v-if="!isActivity" class="space-y-3 rounded-xl bg-card p-4 shadow-card">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <h2 class="type-card-title text-foreground">關聯案件與設備</h2>
            <Badge variant="outline">僅管委會可見</Badge>
          </div>
          <p class="type-date text-muted-foreground">會記錄到社區時間軸與設備紀錄</p>
        </div>
        <div class="space-y-1.5">
          <Label for="an-case" class="text-base">
            關聯案件 <span class="type-label text-muted-foreground">選填</span>
          </Label>
          <Select v-model="form.caseId">
            <SelectTrigger id="an-case" class="h-11 w-full bg-card type-body">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="NONE" class="min-h-11 px-3 type-body">不關聯</SelectItem>
              <SelectItem v-for="item in cases" :key="item.id" :value="item.id" class="min-h-11 px-3 type-body">
                {{ item.title }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-1.5">
          <Label for="an-equipment" class="text-base">
            關聯設備 <span class="type-label text-muted-foreground">選填</span>
          </Label>
          <Select v-model="form.equipmentId">
            <SelectTrigger id="an-equipment" class="h-11 w-full bg-card type-body">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="NONE" class="min-h-11 px-3 type-body">不關聯</SelectItem>
              <SelectItem v-for="item in equipment" :key="item.id" :value="item.id" class="min-h-11 px-3 type-body">
                {{ item.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <!-- 標示為緊急：開關先用 Toggle（還沒有 Switch 元件） -->
      <section class="space-y-1.5 rounded-xl bg-card p-4 shadow-card">
        <div class="flex items-center justify-between gap-3">
          <p id="an-urgent-label" class="type-body-strong text-foreground">標示為緊急</p>
          <Toggle
            v-model="form.isUrgent"
            variant="outline"
            aria-labelledby="an-urgent-label"
            class="relative h-8 min-w-16 rounded-full bg-card px-4 type-button after:absolute after:inset-x-0 after:-inset-y-1.5 data-[state=on]:border-warning data-[state=on]:bg-warning-subtle data-[state=on]:text-red-800"
          >
            {{ form.isUrgent ? '開啟' : '關閉' }}
          </Toggle>
        </div>
        <p class="type-date text-muted-foreground">標示為緊急會直接發布，並同步通知管委會</p>
      </section>

      <!-- 施工、維護：推播通知 -->
      <fieldset v-if="isWorks" class="space-y-2">
        <legend class="mb-2 text-base font-medium text-foreground">
          推播通知 <span class="text-warning-strong">*</span>
        </legend>
        <RadioGroup v-model="form.push" class="gap-2">
          <label
            v-for="option in PUSH_OPTIONS"
            :key="option.value"
            class="flex min-h-[52px] items-center gap-3 rounded-xl border bg-card px-4 type-body text-foreground"
            :class="option.value === form.push ? 'border-foreground' : 'border-border'"
          >
            <RadioGroupItem :value="option.value" class="size-5" />
            {{ option.label }}
          </label>
        </RadioGroup>
      </fieldset>

      <BottomCta vertical>
        <Button type="submit" :disabled="pending">{{ submitLabel }}</Button>
        <Button type="button" variant="outline" @click="cancel">取消</Button>
      </BottomCta>
    </form>
  </div>
</template>
