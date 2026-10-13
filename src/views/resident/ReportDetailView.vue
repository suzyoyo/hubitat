<script setup>
// 住戶端・通報詳情：看一筆通報的處理進度，也可以補充說明、換照片或撤回
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomCta from '@/components/app/BottomCta.vue'
import ReportPhotoTile from '@/components/report/ReportPhotoTile.vue'
import ReportProgressCard from '@/components/report/ReportProgressCard.vue'
import ReportSummary from '@/components/report/ReportSummary.vue'
import ReportWithdrawDialog from '@/components/report/ReportWithdrawDialog.vue'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { getCurrentUser, getReportById, updateReport, withdrawReport } from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

// useRoute()：取得目前路由的資訊
// 網址是 /resident/reports/:id，所以 route.params.id 就是這筆通報的編號
const route = useRoute()
// useRouter()：用程式換頁（撤回之後要回到「我的通報」）
const router = useRouter()

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
// 這一筆通報。找不到時（編號不存在，或是別人的保密通報）假 API 會回傳 undefined
const report = ref(null)

const userId = ref('') // 我是誰，存檔時要用

// 補充說明最多幾個字
const DESCRIPTION_MAX = 200
// 輸入框裡目前的文字。和 report.description 分開放，按「確認修改」才會真的存進去
const description = ref('')
// 照片最多幾張（和新增通報一樣）
const PHOTO_MAX = 3
// 畫面上目前的照片檔名。和 report.photos 分開放，按「確認修改」才會真的存進去
const photos = ref([])
// saving：存檔還在路上時是 true，按鈕先不能按，避免連按兩次
const saving = ref(false)

// 「確認修改」能不能按：說明或照片有改過、說明不是空白、而且不是正在存檔
const canSave = computed(() => {
  const text = description.value.trim() // trim()：去掉頭尾的空白和換行
  if (saving.value || text === '') return false
  // 兩個陣列不能直接用 === 比，所以先各自接成一串文字再比
  const photosChanged = photos.value.join('|') !== report.value.photos.join('|')
  return text !== report.value.description || photosChanged
})

// 把通報目前的內容放進輸入框和照片格（一開始、存檔之後都會用到）
function fillForm() {
  description.value = report.value.description
  // [...陣列]：複製一份。直接用同一個陣列的話，改畫面上的照片會連原本的資料一起改到
  photos.value = [...report.value.photos]
}

// 更換第 index 張照片（index 從 0 開始）
function replacePhoto(index, fileName) {
  photos.value[index] = fileName
}

// 刪除第 index 張照片：splice(從哪裡開始, 刪幾個)
function removePhoto(index) {
  photos.value.splice(index, 1)
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

// 按「確認修改」：把輸入框的文字存起來
async function save() {
  saving.value = true
  const updated = await updateReport(report.value.id, userId.value, {
    description: description.value.trim(),
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
  toast.success('已更新通報')
}

// 撤回確認彈窗是開還是關
const withdrawOpen = ref(false)
// withdrawing：撤回還在路上時是 true
const withdrawing = ref(false)

// 在彈窗按了「確認撤回」；reason 是彈窗傳來的撤回原因（沒寫就是空字串）
async function withdraw(reason) {
  withdrawing.value = true
  const ok = await withdrawReport(report.value.id, userId.value, reason)
  withdrawing.value = false
  withdrawOpen.value = false
  if (!ok) {
    toast.error('撤回失敗', { description: '這筆通報已經不能撤回了。' })
    return
  }
  toast.success('已撤回通報')
  // replace：用「我的通報」取代現在這一頁，按返回才不會又回到已經撤回的通報
  router.replace('/resident/reports')
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
        <img :src="mascotUrl" alt="" width="279" height="240" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">找不到這筆通報</EmptyTitle>
      <EmptyDescription class="type-body">可能已經撤回，或是網址不正確。</EmptyDescription>
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
            <p class="type-date text-muted-foreground">{{ description.length }} / {{ DESCRIPTION_MAX }} 字</p>
          </div>
          <!-- maxlength：超過字數上限就打不進去 -->
          <Textarea
            id="report-description"
            v-model="description"
            :maxlength="DESCRIPTION_MAX"
            class="min-h-[132px]"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <!-- 照片不是單一個輸入框，所以用 p，不用 Label -->
            <p class="type-body-strong text-foreground">照片</p>
            <p class="type-date text-muted-foreground">{{ photos.length }} / {{ PHOTO_MAX }} 張</p>
          </div>
          <!-- grid-cols-2：一排兩格，放不下會自動換到下一排 -->
          <div class="grid grid-cols-2 gap-3">
            <!-- v-for 的 (photo, index)：index 是第幾張，從 0 開始 -->
            <ReportPhotoTile
              v-for="(photo, index) in photos"
              :key="photo + index"
              :name="photo"
              @pick="replacePhoto(index, $event)"
              @remove="removePhoto(index)"
            />
            <!-- 還沒滿才顯示「新增照片」；選好的照片加到最後面 -->
            <ReportPhotoTile v-if="photos.length < PHOTO_MAX" type="add" @pick="photos.push($event)" />
          </div>
        </div>

        <!-- 設計稿在按鈕下面還有一行「撤回後…無法復原」，和撤回彈窗裡的說明重複，所以拿掉 -->
        <BottomCta>
          <Button variant="outline" @click="withdrawOpen = true">撤回通報</Button>
          <Button :disabled="!canSave" @click="save">確認修改</Button>
        </BottomCta>

        <!-- 撤回確認彈窗：平常看不到，withdrawOpen 變成 true 才會出現 -->
        <ReportWithdrawDialog v-model:open="withdrawOpen" :pending="withdrawing" @confirm="withdraw" />
      </template>
    </template>
  </div>
</template>
