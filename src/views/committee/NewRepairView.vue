<script setup>
// 管委會端・新增報修：和住戶端的新增通報同一個流程（設計稿「管委會端-新增通報」）
//   1 選地點（上面多了「報修住戶」，可以代某一戶登記）→ 2 確認是否重複 → 3 選類型 → 4 描述問題 → 5 確認送出
// 中間每一步的畫面借用住戶端的（src/views/resident/new-report/），完成頁用管理端的說法，寫在這個檔案裡
// 步驟記在網址上（/committee/cases/new?step=2），寫法和住戶端的 NewReportView.vue 一樣
import { BellIcon } from '@lucide/vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomCta from '@/components/app/BottomCta.vue'
import ReportFlowProgress from '@/components/report/ReportFlowProgress.vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { REPORT_TYPES } from '@/lib/report'
import { createRepair, getAreas, getCurrentUser, getSimilarReports, supportReport } from '@/mocks/api'
import ConfirmStep from '@/views/resident/new-report/ConfirmStep.vue'
import DescribeStep from '@/views/resident/new-report/DescribeStep.vue'
import PlaceStep from '@/views/resident/new-report/PlaceStep.vue'
import SimilarStep from '@/views/resident/new-report/SimilarStep.vue'
import SupportedDone from '@/views/resident/new-report/SupportedDone.vue'
import TypeStep from '@/views/resident/new-report/TypeStep.vue'
import mascotUrl from '@/assets/mascot/happy.png' // 開心奔跑的好彼管家

const route = useRoute()
const router = useRouter()

// ── 報修住戶的選項 ─────────────────────────────────
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

// 填到一半的報修；前面幾個欄位和住戶端一樣，後面三個是報修住戶（選填）
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
  const [user, areaList] = await Promise.all([getCurrentUser('committee'), getAreas()])
  userId.value = user.id
  areas.value = areaList
  loading.value = false
})

// ── 報修住戶 ───────────────────────────────────
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
  // 第 1 步：要選好地點；報修住戶不選、或三格都選完
  if (step.value === 1) return form.place.trim() !== '' && unitPickedCount.value !== 1 && unitPickedCount.value !== 2
  if (step.value === 3) return form.visibility !== ''
  if (step.value === 4) return form.subject.trim() !== ''
  return true
})

// 第 1 步按鈕下面的提醒：報修住戶選到一半時
const stepOneNote = computed(() =>
  unitPickedCount.value === 1 || unitPickedCount.value === 2 ? '報修住戶要選完棟別、樓層、戶號，或都不選。' : '',
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
    toast.error('送出失敗', { description: '這筆通報已經處理完了，請直接登記新的報修。' })
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
// 完成頁那一句：「已收到通報！代 A 棟 6樓之3 登記報修」；沒有代登記就是空的
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
  })
  onBehalfText.value = unit.value ? `已收到通報！代 ${unit.value.building} 棟 ${unit.value.unit} 登記報修` : ''
  submitting.value = false
  await router.replace({ query: { step: 'submitted' } })
  resetForm()
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
        <!-- 報修住戶（選填）：代某一戶登記。設計稿放在好彼管家提示框和地點之間，這裡放在最上面（地點那一區是住戶端的元件） -->
        <fieldset class="mb-4 space-y-2">
          <div class="flex items-center justify-between">
            <legend class="flex items-center gap-2 text-base font-medium text-foreground">
              報修住戶 <span class="type-label text-muted-foreground">選填</span>
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
          <div class="grid grid-cols-3 gap-2">
            <!-- 三個下拉選單；看起來 40px 高，after 往上下各補 2px，可以點的範圍是 44px -->
            <Select v-model="form.building">
              <SelectTrigger
                aria-label="棟別"
                class="relative h-10 w-full justify-center gap-1 rounded-full bg-card type-button after:absolute after:inset-x-0 after:-inset-y-0.5"
              >
                <SelectValue placeholder="棟別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in BUILDINGS" :key="item" :value="item" class="min-h-11 px-3 type-body">
                  {{ item }} 棟
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="form.floor">
              <SelectTrigger
                aria-label="樓層"
                class="relative h-10 w-full justify-center gap-1 rounded-full bg-card type-button after:absolute after:inset-x-0 after:-inset-y-0.5"
              >
                <SelectValue placeholder="樓層" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in FLOORS" :key="item" :value="String(item)" class="min-h-11 px-3 type-body">
                  {{ item }} 樓
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="form.unitNumber">
              <SelectTrigger
                aria-label="戶號"
                class="relative h-10 w-full justify-center gap-1 rounded-full bg-card type-button after:absolute after:inset-x-0 after:-inset-y-0.5"
              >
                <SelectValue placeholder="戶號" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in UNIT_NUMBERS" :key="item" :value="String(item)" class="min-h-11 px-3 type-body">
                  之{{ item }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </fieldset>

        <PlaceStep
          v-model:area-id="form.areaId"
          v-model:place="form.place"
          v-model:is-other="form.isOtherPlace"
          :areas="areas"
        />
      </template>

      <SimilarStep v-else-if="step === 2" :reports="similarReports" :supporting-id="supportingId" @support="support" />

      <SupportedDone v-else-if="step === 'supported'" :report="supportedReport" />

      <TypeStep v-else-if="step === 3" v-model="form.visibility" />

      <DescribeStep
        v-else-if="step === 4"
        v-model:subject="form.subject"
        v-model:description="form.description"
        v-model:photos="form.photos"
        :context="contextText"
      />

      <ConfirmStep v-else-if="step === 5" :form="summary" @edit="goToStep" />

      <!-- 送出後的完成頁（設計稿「管委會端-新增通報6-通報完成」） -->
      <div v-else-if="step === 'submitted'" class="space-y-4 pt-8 text-center">
        <div class="space-y-3">
          <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
          <img :src="mascotUrl" alt="" width="233" height="330" class="mx-auto h-[131px] w-auto" />
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
      <Button :disabled="submitting" @click="submit">送出報修</Button>
    </BottomCta>
    <!-- 兩個完成頁：replace，離開之後按返回不會再回到完成頁 -->
    <BottomCta v-else-if="step === 'submitted'" vertical>
      <Button @click="router.replace(`/committee/cases/${createdCase.id}`)">查看案件</Button>
      <Button variant="outline" @click="router.replace('/committee/home')">回到首頁</Button>
    </BottomCta>
    <BottomCta v-else-if="step === 'supported'" vertical>
      <Button @click="router.replace(`/committee/cases/${supportedReport.id}`)">查看案件</Button>
      <Button variant="outline" @click="router.replace('/committee/home')">回到首頁</Button>
    </BottomCta>
  </div>
</template>
