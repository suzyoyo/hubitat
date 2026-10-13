<script setup>
// 住戶端・通報詳情：看一筆通報的處理進度，也可以補充說明、換照片或撤回
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomCta from '@/components/app/BottomCta.vue'
import ReportProgressCard from '@/components/report/ReportProgressCard.vue'
import ReportSummary from '@/components/report/ReportSummary.vue'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
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

// 補充說明最多幾個字
const DESCRIPTION_MAX = 200
// 輸入框裡目前的文字。和 report.description 分開放，按「確認修改」才會真的存進去
const description = ref('')
// saving：存檔還在路上時是 true，按鈕先不能按，避免連按兩次
const saving = ref(false)

// 「確認修改」能不能按：有改過、不是空白、而且不是正在存檔
const canSave = computed(() => {
  const text = description.value.trim() // trim()：去掉頭尾的空白和換行
  return !saving.value && text !== '' && text !== report.value.description
})

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  const user = await getCurrentUser('resident')
  userId.value = user.id
  report.value = await getReportById(route.params.id, user.id)
  // 把原本的補充說明放進輸入框（找不到通報時 report 是 undefined，所以用 ?.）
  description.value = report.value?.description ?? ''
  loading.value = false
})

// 按「確認修改」：把輸入框的文字存起來
async function save() {
  saving.value = true
  const updated = await updateReport(report.value.id, userId.value, {
    description: description.value.trim(),
  })
  saving.value = false
  // 假 API 回傳 undefined 代表不能改（例如剛好被結案了）
  if (!updated) {
    toast.error('修改失敗', { description: '這筆通報已經不能修改了。' })
    return
  }
  report.value = updated
  description.value = updated.description
  toast.success('已更新通報')
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

        <BottomCta>
          <Button :disabled="!canSave" @click="save">確認修改</Button>
        </BottomCta>
      </template>
    </template>
  </div>
</template>
