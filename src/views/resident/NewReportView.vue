<script setup>
// 住戶端・新增通報：一步一步填，最後送出
//   1 選地點 → 2 確認是否重複 → 3 選類型 → 4 描述問題 → 5 確認送出
// 每一步的畫面放在 new-report/ 資料夾，這個檔案負責記住填到一半的資料、決定現在顯示哪一步
// 現在是第幾步記在網址上（/resident/report?step=2），所以按返回會回到上一步，不會直接離開
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BottomCta from '@/components/app/BottomCta.vue'
import ReportFlowProgress from '@/components/report/ReportFlowProgress.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getAreas } from '@/mocks/api'
import PlaceStep from './new-report/PlaceStep.vue'

const route = useRoute()
const router = useRouter()

// 現在是第幾步：看網址上的 step，沒有寫就是第 1 步
const step = computed(() => Number(route.query.step) || 1)

// 填到一半的通報。reactive：一整包資料，裡面任何一項變了畫面都會更新
const form = reactive({
  areaId: '', // 範圍，例如 'area-a'
  place: '', // 地點，例如 '1F 大廳'；選「其他」的話是住戶自己填的
  isOtherPlace: false, // 地點是不是選了「其他」
})

// loading：資料還在路上時是 true，畫面先顯示灰色的佔位方塊
const loading = ref(true)
const areas = ref([]) // 可以選的範圍和地點

// onMounted：畫面一出現就去拿資料
onMounted(async () => {
  // 重新整理網頁後，填到一半的資料會不見，所以不管網址寫第幾步都回到第 1 步重新開始
  if (step.value !== 1) router.replace({ query: {} })
  areas.value = await getAreas()
  loading.value = false
})

// 這一步填好了沒，決定「下一步」能不能按
const canGoNext = computed(() => {
  // trim()：去掉頭尾的空白，只打空白不算有填
  if (step.value === 1) return form.place.trim() !== ''
  return true
})

// 前往第幾步。用 push 才會留下紀錄，按返回可以回到上一步
function goToStep(number) {
  router.push({ query: { step: number } })
}
</script>

<template>
  <div>
    <ReportFlowProgress :step="step" />

    <!-- pb-24：留空間給固定在底部的按鈕區，內容才不會被蓋住 -->
    <div class="px-5 pt-4 pb-24">
      <!-- 載入中 -->
      <div v-if="loading" class="space-y-4">
        <Skeleton class="h-[102px] rounded-lg" />
        <Skeleton v-for="n in 6" :key="n" class="h-[70px] rounded-xl" />
      </div>

      <PlaceStep
        v-else-if="step === 1"
        v-model:area-id="form.areaId"
        v-model:place="form.place"
        v-model:is-other="form.isOtherPlace"
        :areas="areas"
      />

      <!-- 第 2 步之後還沒做 -->
      <p v-else class="type-body text-muted-foreground">第 {{ step }} 步還沒製作。</p>
    </div>

    <BottomCta v-if="step === 1">
      <Button :disabled="!canGoNext" @click="goToStep(2)">下一步</Button>
    </BottomCta>
  </div>
</template>
