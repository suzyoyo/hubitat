<script setup>
// 住戶端・通報詳情：看一筆通報的處理進度，也可以補充說明、換照片
// 補充說明每次進來都是空的，送出後是新加的一段（2026-10-19 改：原本是帶入原本的描述來改，容易重複送出、每次都要先刪字）
// 沒有「撤回通報」：2026-10-15 和 013 決定拿掉撤回，不需要處理的通報由處理的人寫明原因結案
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomCta from '@/components/app/BottomCta.vue'
import ReportPhotoGrid from '@/components/report/ReportPhotoGrid.vue'
import ReportProgressCard from '@/components/report/ReportProgressCard.vue'
import ReportSummary from '@/components/report/ReportSummary.vue'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { REPORT_DESCRIPTION_MAX } from '@/lib/report'
import { getCurrentUser, getReportById, updateReport } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// useRoute()：取得目前路由的資訊
// 網址是 /resident/reports/:id，所以 route.params.id 就是這筆通報的編號
const route = useRoute()

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 這一筆通報。找不到時（編號不存在，或是別人的保密通報）假 API 會回傳 undefined
const report = ref(null)

const userId = ref('') // 我是誰，存檔時要用

// 字數的上限放在 src/lib/report.js，和新增通報用同一組
const DESCRIPTION_MAX = REPORT_DESCRIPTION_MAX
// 這次要補充的說明，一開始是空的；送出後清空
const supplement = ref('')
// 畫面上目前的照片檔名。和 report.photos 分開放，按「送出補充」才會真的存進去
const photos = ref([])
// saving：存檔還在路上時是 true，按鈕先不能按，避免連按兩次
const saving = ref(false)

// 「送出補充」能不能按：有寫補充說明、或照片有改過，而且不是正在存檔
const canSave = computed(() => {
  if (saving.value) return false
  // 兩個陣列不能直接用 === 比，所以先各自接成一串文字再比
  const photosChanged = photos.value.join('|') !== report.value.photos.join('|')
  return Boolean(supplement.value.trim()) || photosChanged // trim()：去掉頭尾的空白和換行
})

// 清空補充說明、照片格放通報目前的照片（一開始、存檔之後都會用到）
function fillForm() {
  supplement.value = ''
  // [...陣列]：複製一份。直接用同一個陣列的話，改畫面上的照片會連原本的資料一起改到
  photos.value = [...report.value.photos]
}

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('resident')
  userId.value = user.id
  report.value = await getReportById(route.params.id, user.id)
  // 找不到通報時 report 是 undefined，就不用填了
  if (report.value) fillForm()
  loading.value = false
})

// 按「送出補充」：把補充說明、照片存起來
async function save() {
  saving.value = true
  const updated = await updateReport(report.value.id, userId.value, {
    supplement: supplement.value.trim(),
    photos: photos.value,
  })
  saving.value = false
  // 假 API 回傳 undefined 代表不能改（例如剛好被結案了）
  if (!updated) {
    toast.error('修改失敗', { description: '這筆通報已經不能修改了。' })
    return
  }
  report.value = updated
  fillForm()
  toast.success('已送出補充')
}
</script>

<template>
  <!-- 可以修改時底部有固定的按鈕區，pb-24 留空間給它，內容才不會被蓋住 -->
  <div class="space-y-4 px-5 pt-4" :class="{ 'pb-24': report?.canEdit }">
    <!-- 載入中：兩個和卡片差不多高的灰色方塊 -->
    <template v-if="loading">
      <Skeleton class="h-[88px] rounded-xl" />
      <Skeleton class="h-[280px] rounded-xl" />
    </template>

    <!-- 找不到這筆通報 -->
    <Empty v-else-if="!report" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這筆通報</EmptyTitle>
      <EmptyDescription class="type-body">可能是網址不正確。</EmptyDescription>
      <Button as-child class="mt-4">
        <RouterLink to="/resident/reports">回到我的通報</RouterLink>
      </Button>
    </Empty>

    <!-- 有資料 -->
    <template v-else>
      <ReportSummary :report="report" />
      <ReportProgressCard :report="report" />

      <!-- 以下是可以修改的部分：只有自己通報、還沒結案的才會出現 -->
      <template v-if="report.canEdit">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <!-- for 對應輸入框的 id：點「補充說明」這幾個字，游標會跳進輸入框 -->
            <Label for="report-description" class="text-base">補充說明</Label>
            <p class="type-date text-muted-foreground">{{ supplement.length }} / {{ DESCRIPTION_MAX }} 字</p>
          </div>
          <!-- maxlength：超過字數上限就打不進去 -->
          <Textarea
            id="report-description"
            v-model="supplement"
            :maxlength="DESCRIPTION_MAX"
            placeholder="還有想補充的嗎？例如：今天早上又發生一次"
            class="min-h-[132px]"
          />
        </div>

        <div class="space-y-2">
          <!-- 照片不是單一個輸入框，所以用 p，不用 Label -->
          <p class="type-body-strong text-foreground">現場照片／影片</p>
          <!-- 照片格和下面的說明是共用的元件，和新增通報長得一樣 -->
          <ReportPhotoGrid v-model="photos" />
        </div>

        <!-- 設計稿左邊還有一顆「撤回通報」，2026-10-15 拿掉了 -->
        <BottomCta>
          <Button :disabled="!canSave" @click="save">送出補充</Button>
        </BottomCta>
      </template>
    </template>
  </div>
</template>
