<script setup>
// 新增通報・第 5 步：確認送出
// 把前面填的內容列出來讓住戶再看一次，每一項旁邊有「修改」可以回到那一步
import { LockIcon, MegaphoneIcon } from '@lucide/vue'
import { computed } from 'vue'
import FeedbackHaobiTip from '@/components/feedback/FeedbackHaobiTip.vue'
import ReportReviewRow from '@/components/report/ReportReviewRow.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { REPORT_TYPES } from '@/lib/report'

const props = defineProps({
  // 填好的通報：areaName、place、visibility、subject、description、photos
  form: { type: Object, required: true },
})

// edit：按了某一項的「修改」，會把要回到第幾步傳出去
defineEmits(['edit'])

const isPrivate = computed(() => props.form.visibility === 'private')

// 最上面那一塊說明：這則通報誰看得到。公開和保密的說法不一樣
const scopeText = computed(() =>
  isPrivate.value
    ? '這則通報只有管委會與管理室看得到，不會顯示給其他住戶。你的姓名與戶號也不會被其他住戶看到。'
    : '這則通報會公開給全體住戶，管委會也會公開列管處理進度。你的姓名與戶號不會顯示。',
)

// 要列出來的每一項：label 名稱、value 內容、step 按「修改」要回到第幾步
const rows = computed(() => {
  const type = REPORT_TYPES[props.form.visibility]
  const count = props.form.photos.length
  return [
    { label: '地點', value: `${props.form.areaName}・${props.form.place}`, step: 1 },
    { label: '問題類型', value: `${type.label}（${type.tag}）`, step: 3 },
    { label: '通報問題', value: props.form.subject, step: 4 },
    // 選填的兩項：沒填也列出來，讓住戶知道可以回去補
    { label: '補充說明', value: props.form.description || '沒有填寫', step: 4 },
    { label: '現場照片／影片', value: count ? `已加入 ${count} 個` : '沒有加入', step: 4 },
  ]
})
</script>

<template>
  <div class="space-y-4">
    <FeedbackHaobiTip title="最後確認，沒問題就送出！" description="送出後你可以隨時追蹤處理進度。" />

    <!-- 用基礎元件 Alert；設計稿是灰底、沒有外框，所以把外框拿掉、換底色 -->
    <Alert class="border-transparent bg-muted px-4 py-3.5">
      <!-- component :is：公開用擴音器，保密用鎖頭 -->
      <component :is="isPrivate ? LockIcon : MegaphoneIcon" />
      <AlertTitle>{{ isPrivate ? '保密範圍' : '公開範圍' }}</AlertTitle>
      <AlertDescription>{{ scopeText }}</AlertDescription>
    </Alert>

    <!-- divide-y：每一列之間畫一條分隔線 -->
    <div class="divide-y divide-border rounded-xl border border-border bg-card px-4 py-1">
      <ReportReviewRow
        v-for="row in rows"
        :key="row.label"
        :label="row.label"
        :value="row.value"
        @edit="$emit('edit', row.step)"
      />
    </div>
  </div>
</template>
