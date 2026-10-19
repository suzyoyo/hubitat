<script setup>
// 管委會端・新增通報：和住戶端的新增通報同一個流程（設計稿「管委會端-新增通報」）
//   1 選地點（上面多了「通報住戶」，可以代某一戶登記）→ 2 確認是否重複 → 3 選類型 → 4 描述問題 → 5 確認送出
// 中間每一步的畫面和住戶端共用（src/components/report/Report…Step），完成頁用管理端的說法，寫在這個檔案裡
// 步驟記在網址上（/committee/cases/new?step=2），寫法和住戶端的 NewReportView.vue 一樣
// 管理人員端「＋」選單的「新增通報」也用這一頁（/staff/cases/new，2026-10-18）
import { BellIcon } from '@lucide/vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import LeaveConfirmDialog from '@/components/feedback/LeaveConfirmDialog.vue'
import BottomCta from '@/components/app/BottomCta.vue'
import ReportFlowProgress from '@/components/report/ReportFlowProgress.vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { REPORT_TYPES } from '@/lib/report'
import { createRepair, getAreas, getCurrentUser, getSimilarReports, supportReport, takeDraft } from '@/mocks/api'
import ReportConfirmStep from '@/components/report/ReportConfirmStep.vue'
import ReportDescribeStep from '@/components/report/ReportDescribeStep.vue'
import ReportPlaceStep from '@/components/report/ReportPlaceStep.vue'
import ReportSimilarStep from '@/components/report/ReportSimilarStep.vue'
import ReportSupportedDone from '@/components/report/ReportSupportedDone.vue'
import ReportTypeStep from '@/components/report/ReportTypeStep.vue'
import mascotUrl from '@/assets/mascot/happy.png' // 開心奔跑的好彼管家

const route = useRoute()
const router = useRouter()
const base = `/${route.meta.roleId}` // 目前在哪一端：/committee 或 /staff

// ── 通報住戶的選項 ─────────────────────────────────
// 社區是 3 棟 120 戶：每棟 10 層、每層 4 戶。戶號的寫法和假資料一樣（'8樓之1'）
const BUILDINGS = ['A', 'B', 'C']
const FLOORS = Array.from({ length: 10 }, (_, index) => index + 1) // [1, 2, … 10]
const UNIT_NUMBERS = [1, 2, 3, 4]

// 現在是第幾步（寫法和住戶端一樣）
const step = computed(() => {
  if (route.query.step === 'supported' || route.query.step === 'submitted') return route.query.step
  return Number(route.query.step) || 1
})
const inFlow = computed(() => typeof step.value === 'number')

// 填到一半的通報；前面幾個欄位和住戶端一樣，後面三個是通報住戶（選填）
const form = reactive({
  areaId: '',
  place: '',
  isOtherPlace: false,
  visibility: '',
  subject: '',
  description: '',
  photos: [],
  building: '', // 'A'
  floor: '', // '6'（選單的值要是字串）
  unitNumber: '', // '3'
})

function resetForm() {
  Object.assign(form, {
    areaId: '',
    place: '',
    isOtherPlace: false,
    visibility: '',
    subject: '',
    description: '',
    photos: [],
    building: '',
    floor: '',
    unitNumber: '',
  })
}

const loading = ref(true)
const userId = ref('')
const areas = ref([])

onMounted(async () => {
  if (step.value !== 1) router.replace({ query: {} })
  const [user, areaList] = await Promise.all([getCurrentUser(route.meta.roleId), getAreas()])
  userId.value = user.id
  areas.value = areaList
  loading.value = false
  await restoreDraft(user.id, route.path, (data) => Object.assign(form, data))
})

// ── 通報住戶 ───────────────────────────────────
// 選了幾格：0 是不代任何一戶登記；3 是選完了；1、2 是選到一半
const unitPickedCount = computed(() => [form.building, form.floor, form.unitNumber].filter(Boolean).length)
// 選完三格才算代這一戶登記，例如 { building: 'A', unit: '6樓之3' }
const unit = computed(() =>
  unitPickedCount.value === 3 ? { building: form.building, unit: `${form.floor}樓之${form.unitNumber}` } : null,
)

function clearUnit() {
  form.building = ''
  form.floor = ''
  form.unitNumber = ''
}

// 這一步填好了沒，決定「下一步」能不能按
const canGoNext = computed(() => {
  // 第 1 步：要選好地點；通報住戶不選、或三格都選完
  if (step.value === 1) return form.place.trim() !== '' && unitPickedCount.value !== 1 && unitPickedCount.value !== 2
  if (step.value === 3) return form.visibility !== ''
  if (step.value === 4) return form.subject.trim() !== ''
  return true
})

// 第 1 步按鈕下面的提醒：通報住戶選到一半時
const stepOneNote = computed(() =>
  unitPickedCount.value === 1 || unitPickedCount.value === 2 ? '通報住戶要選完棟別、樓層、戶號，或都不選。' : '',
)

const areaName = computed(() => areas.value.find((item) => item.id === form.areaId)?.name ?? '')

const contextText = computed(() =>
  [areaName.value, form.place.trim(), REPORT_TYPES[form.visibility]?.label ?? ''].join('・'),
)

const summary = computed(() => ({
  areaId: form.areaId,
  areaName: areaName.value,
  place: form.place.trim(),
  visibility: form.visibility,
  subject: form.subject.trim(),
  description: form.description.trim(),
  photos: form.photos,
}))

function goToStep(number) {
  router.push({ query: { step: number } })
}

watch(step, (current) => {
  if (typeof current === 'number' && current > 1 && form.place === '') router.replace({ query: {} })
})

// ── 第 1 步 → 第 2 步：找相似的通報 ──────────────────
const similarReports = ref([])
const checking = ref(false)

async function checkSimilar() {
  checking.value = true
  similarReports.value = await getSimilarReports(form.areaId, form.place.trim(), userId.value)
  checking.value = false
  goToStep(similarReports.value.length ? 2 : 3)
}

// ── 第 2 步：我也遇到了 ──────────────────────────
const supportingId = ref('')
const supportedReport = ref(null)

async function support(report) {
  supportingId.value = report.id
  const updated = await supportReport(report.id, userId.value)
  supportingId.value = ''
  if (!updated) {
    toast.error('送出失敗', { description: '這筆通報已經處理完了，請直接登記新的通報。' })
    return
  }
  supportedReport.value = updated
  resetForm()
  router.replace({ query: { step: 'supported' } })
}

// ── 第 5 步：送出 ──────────────────────────────
const submitting = ref(false)
// 送出後的案件，完成頁要用（查看案件、代哪一戶登記）
const createdCase = ref(null)
// 完成頁那一句：「已收到通報！代 A 棟 6樓之3 登記通報」；沒有代登記就是空的
const onBehalfText = ref('')

async function submit() {
  submitting.value = true
  createdCase.value = await createRepair(userId.value, {
    areaId: summary.value.areaId,
    place: summary.value.place,
    isPrivate: summary.value.visibility === 'private',
    subject: summary.value.subject,
    description: summary.value.description,
    photos: summary.value.photos,
    unit: unit.value ?? undefined,
  }, route.meta.roleId)
  onBehalfText.value = unit.value ? `已收到通報！代 ${unit.value.building} 棟 ${unit.value.unit} 登記通報` : ''
  submitting.value = false
  await router.replace({ query: { step: 'submitted' } })
  resetForm()
}

// 有沒有填東西（離開前確認用）：在流程裡、寫了通報問題、補充說明、加了照片或填了住戶
const isDirty = computed(
  () => inFlow.value && Boolean(form.subject || form.description || form.photos.length || form.building),
)

// 之前「存成草稿」的話，把內容帶回來（拿回來就刪掉；沒送出又要離開時可以再存一次）
async function restoreDraft(userIdValue, path, apply) {
  const data = await takeDraft(userIdValue, path)
  if (!data) return
  apply(data)
  toast.info('已帶回上次存的草稿')
}
</script>

<template>
  <div>
    <ReportFlowProgress v-if="inFlow" :step="step" />

    <div class="px-5 pt-4" :class="inFlow ? 'pb-32' : 'pb-40'">
      <div v-if="loading" class="space-y-4">
        <Skeleton class="h-[62px] rounded-lg" />
        <Skeleton class="h-[102px] rounded-lg" />
        <Skeleton v-for="n in 5" :key="n" class="h-[70px] rounded-xl" />
      </div>

      <template v-else-if="step === 1">
        <!-- 通報住戶（選填）：代某一戶登記。設計稿放在好彼管家提示框和地點之間，這裡放在最上面（地點那一區是住戶端的元件） -->
        <fieldset class="mb-4 space-y-2">
          <div class="flex items-center justify-between">
            <legend class="flex items-center gap-2 text-base font-medium text-foreground">
              通報住戶 <span class="type-label text-muted-foreground">選填</span>
            </legend>
            <!-- 有選的時候才出現，可以全部清掉 -->
            <button
              v-if="unitPickedCount > 0"
              type="button"
              class="relative type-link text-primary after:absolute after:-inset-3"
              @click="clearUnit"
            >
              清除
            </button>
          </div>
          <!-- 那一戶的住戶看得到這筆通報；保密的通報填成被檢舉的那一戶，對方就會看到內容（PR #37 suzy 提醒） -->
          <p class="type-date text-muted-foreground">選擇你要代為登記的那一戶，那一戶的住戶可以追蹤進度。</p>
          <div class="grid grid-cols-3 gap-2">
            <!-- 三個下拉選單；看起來 40px 高，after 往上下各補 2px，可以點的範圍是 44px
                 ui/select 本身寫了 data-[size=default]:h-8 和 text-sm，所以高度用 data-[size=default]:h-10、字用 type-button! 才蓋得過（2026-10-18） -->
            <Select v-model="form.building">
              <SelectTrigger
                aria-label="棟別"
                class="relative w-full justify-center gap-1 rounded-full bg-card type-button! after:absolute after:inset-x-0 after:-inset-y-0.5 data-[size=default]:h-10"
              >
                <SelectValue placeholder="棟別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in BUILDINGS" :key="item" :value="item" class="min-h-11 px-3 type-body!">
                  {{ item }} 棟
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="form.floor">
              <SelectTrigger
                aria-label="樓層"
                class="relative w-full justify-center gap-1 rounded-full bg-card type-button! after:absolute after:inset-x-0 after:-inset-y-0.5 data-[size=default]:h-10"
              >
                <SelectValue placeholder="樓層" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in FLOORS" :key="item" :value="String(item)" class="min-h-11 px-3 type-body!">
                  {{ item }} 樓
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="form.unitNumber">
              <SelectTrigger
                aria-label="戶號"
                class="relative w-full justify-center gap-1 rounded-full bg-card type-button! after:absolute after:inset-x-0 after:-inset-y-0.5 data-[size=default]:h-10"
              >
                <SelectValue placeholder="戶號" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in UNIT_NUMBERS" :key="item" :value="String(item)" class="min-h-11 px-3 type-body!">
                  之{{ item }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </fieldset>

        <ReportPlaceStep
          v-model:area-id="form.areaId"
          v-model:place="form.place"
          v-model:is-other="form.isOtherPlace"
          :areas="areas"
        />
      </template>

      <ReportSimilarStep v-else-if="step === 2" :reports="similarReports" :supporting-id="supportingId" @support="support" />

      <ReportSupportedDone v-else-if="step === 'supported'" :report="supportedReport" />

      <!-- management：有選通報住戶時，說明改成「通報住戶」；沒選（例如巡查自己發現的）就用原本的說法（PR #38 suzy 的建議） -->
      <ReportTypeStep v-else-if="step === 3" v-model="form.visibility" :management="Boolean(unit)" />

      <ReportDescribeStep
        v-else-if="step === 4"
        v-model:subject="form.subject"
        v-model:description="form.description"
        v-model:photos="form.photos"
        :context="contextText"
      />

      <ReportConfirmStep v-else-if="step === 5" :form="summary" :management="Boolean(unit)" @edit="goToStep" />

      <!-- 送出後的完成頁（設計稿「管委會端-新增通報6-通報完成」） -->
      <div v-else-if="step === 'submitted'" class="space-y-4 pt-8 text-center">
        <div class="space-y-3">
          <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
          <img :src="mascotUrl" alt="" width="214" height="255" class="mx-auto h-[131px] w-auto" />
          <h2 class="type-title text-foreground">已收到你的通報！</h2>
        </div>
        <p class="type-body text-muted-foreground">感謝你為社區公共環境盡一份心力</p>
        <!-- 代某一戶登記時才有這一句 -->
        <div v-if="onBehalfText" class="flex items-start gap-2.5 rounded-lg bg-muted p-4 text-left">
          <BellIcon class="mt-0.5 size-5 shrink-0" />
          <p class="min-w-0 flex-1 type-body text-foreground">{{ onBehalfText }}</p>
        </div>
      </div>
    </div>

    <BottomCta v-if="step === 1" :note="stepOneNote">
      <Button :disabled="!canGoNext || checking" @click="checkSimilar">下一步</Button>
    </BottomCta>
    <BottomCta v-else-if="step === 2">
      <Button :disabled="supportingId !== ''" @click="goToStep(3)">都不是，我要登記新問題</Button>
    </BottomCta>
    <BottomCta v-else-if="step === 3" :note="canGoNext ? '' : '請先選擇一項類型，才能繼續。'">
      <Button :disabled="!canGoNext" @click="goToStep(4)">下一步</Button>
    </BottomCta>
    <BottomCta v-else-if="step === 4">
      <Button :disabled="!canGoNext" @click="goToStep(5)">下一步：確認資料</Button>
    </BottomCta>
    <BottomCta v-else-if="step === 5">
      <Button :disabled="submitting" @click="submit">送出通報</Button>
    </BottomCta>
    <!-- 兩個完成頁：replace，離開之後按返回不會再回到完成頁 -->
    <BottomCta v-else-if="step === 'submitted'" vertical>
      <Button @click="router.replace(`${base}/cases/${createdCase.id}`)">查看案件</Button>
      <Button variant="outline" @click="router.replace(`${base}/home`)">回到首頁</Button>
    </BottomCta>
    <BottomCta v-else-if="step === 'supported'" vertical>
      <Button @click="router.replace(`${base}/cases/${supportedReport.id}`)">查看案件</Button>
      <Button variant="outline" @click="router.replace(`${base}/home`)">回到首頁</Button>
    </BottomCta>
    <!-- 填到一半想離開時先問一次 -->
    <LeaveConfirmDialog :dirty="isDirty" draft-title="新增通報（代住戶登記）" :draft-data="{ ...form }" :draft-path="route.path" />
  </div>
</template>
