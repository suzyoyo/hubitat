<script setup>
// 住戶端・新增通報：一步一步填，最後送出
//   1 選地點 → 2 確認是否重複 → 3 選類型 → 4 描述問題 → 5 確認送出
//   第 2 步如果按了「我也遇到了」，就不用再通報，直接到完成頁（step=supported）
//   第 5 步送出後到另一個完成頁（step=submitted）
// 每一步的畫面放在 src/components/report/（Report…Step，管委會端的新增通報也用），送出的完成頁在 new-report/ 資料夾
// 這個檔案負責記住填到一半的資料、決定現在顯示哪一步
// 現在是第幾步記在網址上（/resident/reports/new?step=2），所以按返回會回到上一步，不會直接離開
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import LeaveConfirmDialog from '@/components/feedback/LeaveConfirmDialog.vue'
import BottomCta from '@/components/app/BottomCta.vue'
import ReportFlowProgress from '@/components/report/ReportFlowProgress.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { REPORT_TYPES } from '@/lib/report'
import { createReport, getAreas, getCurrentUser, getEquipmentById, getSimilarReports, supportReport } from '@/mocks/api'
import ReportConfirmStep from '@/components/report/ReportConfirmStep.vue'
import ReportDescribeStep from '@/components/report/ReportDescribeStep.vue'
import ReportPlaceStep from '@/components/report/ReportPlaceStep.vue'
import ReportSimilarStep from '@/components/report/ReportSimilarStep.vue'
import SubmittedDone from './new-report/SubmittedDone.vue'
import ReportSupportedDone from '@/components/report/ReportSupportedDone.vue'
import ReportTypeStep from '@/components/report/ReportTypeStep.vue'

const route = useRoute()
const router = useRouter()

// 現在是第幾步：看網址上的 step，沒有寫就是第 1 步
//   數字 1～5 是流程的步驟；'supported' 是「我也遇到了」的完成頁；'submitted' 是送出後的完成頁
const step = computed(() => {
  if (route.query.step === 'supported' || route.query.step === 'submitted') return route.query.step
  return Number(route.query.step) || 1
})
// 是不是還在流程裡（1～5）；完成頁不顯示上面的進度
const inFlow = computed(() => typeof step.value === 'number')

// 填到一半的通報。reactive：一整包資料，裡面任何一項變了畫面都會更新
const form = reactive({
  areaId: '', // 範圍，例如 'area-a'
  place: '', // 地點，例如 '1F 大廳'；選「其他」的話是住戶自己填的
  isOtherPlace: false, // 地點是不是選了「其他」
  visibility: '', // 類型：'public' 公共設施問題（公開）/ 'private' 涉及住戶行為（保密）
  subject: '', // 通報問題（標題），必填
  description: '', // 補充說明，選填
  photos: [], // 照片或影片的檔名，選填
})

// 把填到一半的資料清空（做完之後用，下次再進來是全新的）
function resetForm() {
  form.areaId = ''
  form.place = ''
  form.isOtherPlace = false
  form.visibility = ''
  form.subject = ''
  form.description = ''
  form.photos = []
}

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
const userId = ref('') // 我是誰
const areas = ref([]) // 可以選的範圍和地點

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  // 從「設備與維修史」的「通報問題」來的，網址會帶設備編號（?equipment=e-001），先記下來
  const equipmentId = route.query.equipment
  // 重新整理網頁後，填到一半的資料會不見，所以不管網址寫第幾步都回到第 1 步重新開始
  // 網址上的設備編號也一起拿掉，按返回、重新整理都不會再帶入一次
  if (step.value !== 1 || equipmentId) router.replace({ query: {} })
  // Promise.all：三種資料同時去拿，全部回來才往下走；沒有帶設備的話，第三個直接是 undefined
  const [user, areaList, device] = await Promise.all([
    getCurrentUser('resident'),
    getAreas(),
    equipmentId ? getEquipmentById(equipmentId, 'resident') : undefined,
  ])
  userId.value = user.id
  areas.value = areaList
  if (device) fillFromEquipment(device)
  loading.value = false
})

// 從設備帶入：地點、類型（公共設施問題）、通報問題先填設備名稱，住戶接著打哪裡壞了
// 住戶還是一步一步往下走，每一步都已經選好，看一眼按「下一步」就好；想改也可以改
function fillFromEquipment(device) {
  const area = areas.value.find((item) => item.id === device.areaId)
  if (!area) return
  form.areaId = area.id
  // 地點要填「住戶在哪裡遇到問題」，不是設備裝在哪裡（電梯裝在機房，但住戶是在電梯口遇到）
  //   電梯 → 選這一棟的「電梯／電梯口」
  //   其他設備 → 清單上有和設備位置一樣的就選它；沒有的話選「其他」，填設備的位置
  // 設備的位置有時候開頭就是範圍名稱（「A 棟 1 樓機房」），拿掉，不然第 4 步會變成「A 棟・A 棟 1 樓機房」
  const listedPlaces = area.places.filter((item) => item.common)
  const devicePlace = device.place.replace(`${area.name} `, '')
  const listed =
    device.category === 'elevator'
      ? listedPlaces.find((item) => item.name.includes('電梯'))
      : listedPlaces.find((item) => item.name === devicePlace)
  form.place = listed ? listed.name : devicePlace
  form.isOtherPlace = !listed
  form.visibility = 'public'
  form.subject = device.name
}

// 這一步填好了沒，決定「下一步」能不能按
const canGoNext = computed(() => {
  // trim()：去掉頭尾的空白，只打空白不算有填
  if (step.value === 1) return form.place.trim() !== ''
  if (step.value === 3) return form.visibility !== ''
  if (step.value === 4) return form.subject.trim() !== ''
  return true
})

// 選到的範圍叫什麼，例如 'A 棟'。?. 和 ??：還沒選的時候找不到，就用空字串，不要讓畫面壞掉
const areaName = computed(() => areas.value.find((item) => item.id === form.areaId)?.name ?? '')

// 第 4 步最上面那一行：前面選的範圍、地點、類型，例如「A 棟・1F 大廳・公共設施問題」
const contextText = computed(() =>
  [areaName.value, form.place.trim(), REPORT_TYPES[form.visibility]?.label ?? ''].join('・'),
)

// 第 5 步要列出來的內容：整理成乾淨的樣子（去掉頭尾空白），送出時也用同一份
const summary = computed(() => ({
  areaId: form.areaId,
  areaName: areaName.value,
  place: form.place.trim(),
  visibility: form.visibility,
  subject: form.subject.trim(),
  description: form.description.trim(),
  photos: form.photos,
}))

// 前往第幾步。用 push 才會留下紀錄，按返回可以回到上一步
function goToStep(number) {
  router.push({ query: { step: number } })
}

// 資料已經清空（送出或按了「我也遇到了」之後），卻又回到中間的步驟時，直接回第 1 步重新開始
// 例如在完成頁按返回，會回到第 4 步，但那時候地點、類型都是空的
// watch：step 一變就檢查一次
watch(step, (current) => {
  if (typeof current === 'number' && current > 1 && form.place === '') router.replace({ query: {} })
})

// ── 第 1 步 → 第 2 步：找相似的通報 ──────────────────────

// 同一個地點、還沒處理完的通報
const similarReports = ref([])
// checking：正在找相似通報時是 true，「下一步」先不能按
const checking = ref(false)

// 第 1 步按「下一步」：先看這個地點有沒有人通報過
async function checkSimilar() {
  checking.value = true
  similarReports.value = await getSimilarReports(form.areaId, form.place.trim(), userId.value)
  checking.value = false
  // 有相似的就到第 2 步讓住戶確認；沒有就跳過，直接到第 3 步
  goToStep(similarReports.value.length ? 2 : 3)
}

// ── 第 2 步：我也遇到了 ──────────────────────────────

// 正在送出「我也遇到了」的那一筆通報的編號；沒有在送就是空字串
const supportingId = ref('')
// 按了「我也遇到了」的那一筆通報，完成頁要顯示
const supportedReport = ref(null)

// 按了某一筆的「我也遇到了」
async function support(report) {
  supportingId.value = report.id
  const updated = await supportReport(report.id, userId.value)
  supportingId.value = ''
  // 假 API 回傳 undefined 代表不能按（例如剛好被結案了）
  if (!updated) {
    toast.error('送出失敗', { description: '這筆通報已經處理完了，請直接通報新問題。' })
    return
  }
  supportedReport.value = updated
  resetForm()
  // replace：用完成頁取代第 2 步，按返回才不會又回到「確認是否重複」
  router.replace({ query: { step: 'supported' } })
}

// ── 第 5 步：送出 ──────────────────────────────────

// submitting：送出還在路上時是 true，按鈕先不能按，避免連按兩次送出兩筆
const submitting = ref(false)

// 按了「送出通報」
async function submit() {
  submitting.value = true
  await createReport(userId.value, {
    areaId: summary.value.areaId,
    place: summary.value.place,
    isPrivate: summary.value.visibility === 'private',
    subject: summary.value.subject,
    description: summary.value.description,
    photos: summary.value.photos,
  })
  submitting.value = false
  // replace：用完成頁取代第 5 步，按返回才不會又回到「確認送出」再送一次
  // await：等換到完成頁之後才清空資料，不然第 5 步的畫面會先變成空的
  await router.replace({ query: { step: 'submitted' } })
  resetForm()
}

// 有沒有填東西（離開前確認用）：在流程裡、寫了通報問題、補充說明或加了照片
const isDirty = computed(() => inFlow.value && Boolean(form.subject || form.description || form.photos.length))
</script>

<template>
  <div>
    <ReportFlowProgress v-if="inFlow" :step="step" />

    <!-- pb：留空間給固定在底部的按鈕區，內容才不會被蓋住。完成頁有兩個上下排的按鈕，要留多一點 -->
    <div class="px-5 pt-4" :class="inFlow ? 'pb-32' : 'pb-40'">
      <!-- 載入中 -->
      <div v-if="loading" class="space-y-4">
        <Skeleton class="h-[102px] rounded-lg" />
        <Skeleton v-for="n in 6" :key="n" class="h-[70px] rounded-xl" />
      </div>

      <ReportPlaceStep
        v-else-if="step === 1"
        v-model:area-id="form.areaId"
        v-model:place="form.place"
        v-model:is-other="form.isOtherPlace"
        :areas="areas"
      />

      <ReportSimilarStep v-else-if="step === 2" :reports="similarReports" :supporting-id="supportingId" @support="support" />

      <ReportSupportedDone v-else-if="step === 'supported'" :report="supportedReport" />

      <ReportTypeStep v-else-if="step === 3" v-model="form.visibility" />

      <ReportDescribeStep
        v-else-if="step === 4"
        v-model:subject="form.subject"
        v-model:description="form.description"
        v-model:photos="form.photos"
        :context="contextText"
      />

      <!-- 按某一項的「修改」會回到那一步，改完再一步一步按回來 -->
      <ReportConfirmStep v-else-if="step === 5" :form="summary" @edit="goToStep" />

      <SubmittedDone v-else-if="step === 'submitted'" />
    </div>

    <BottomCta v-if="step === 1">
      <Button :disabled="!canGoNext || checking" @click="checkSimilar">下一步</Button>
    </BottomCta>
    <BottomCta v-else-if="step === 2">
      <Button :disabled="supportingId !== ''" @click="goToStep(3)">都不是，我要通報新問題</Button>
    </BottomCta>
    <!-- 還沒選的時候，按鈕下面多一行提醒 -->
    <BottomCta v-else-if="step === 3" :note="canGoNext ? '' : '請先選擇一項類型，才能繼續。'">
      <Button :disabled="!canGoNext" @click="goToStep(4)">下一步</Button>
    </BottomCta>
    <BottomCta v-else-if="step === 4">
      <Button :disabled="!canGoNext" @click="goToStep(5)">下一步：確認資料</Button>
    </BottomCta>
    <BottomCta v-else-if="step === 5" note="送出即表示你同意社區公約與通報規範。">
      <Button :disabled="submitting" @click="submit">送出通報</Button>
    </BottomCta>
    <!-- 兩個完成頁：按鈕上下排。replace：離開之後按返回不會再回到完成頁 -->
    <BottomCta v-else-if="step === 'submitted'" vertical>
      <Button @click="router.replace('/resident/reports')">查看我的通報</Button>
      <Button variant="outline" @click="router.replace('/resident/home')">回到首頁</Button>
    </BottomCta>
    <BottomCta v-else-if="step === 'supported'" vertical>
      <Button @click="router.replace(`/resident/reports/${supportedReport.id}`)">查看這件通報</Button>
      <Button variant="outline" @click="router.replace('/resident/home')">回到首頁</Button>
    </BottomCta>
    <!-- 填到一半想離開時先問一次 -->
    <!-- 住戶沒有「存成草稿」（2026-10-23）：只問直接離開或繼續填寫 -->
    <LeaveConfirmDialog :dirty="isDirty" />
  </div>
</template>
