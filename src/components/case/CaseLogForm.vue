<script setup>
// 案件詳情「處理進度與留痕」卡片最下面的「新增處理紀錄」，按了在卡片裡展開
//   內容（必填，管理端看的）、給住戶看的一句（選填，沒寫就不給住戶看）、改期的新預約時間（選填）
// 按「確定」只是先記下來（v-model:draft），頁面會把它接在紀錄最下面；真的存是按頁面底部的「更新現況」
// 規則見 docs/case-flow.md 4-4
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MOCK_NOW } from '@/mocks/api'

defineProps({
  // 有派廠商才顯示「改期」（沒有廠商就沒有預約時間可以改）
  canReschedule: { type: Boolean, default: false },
})

// 記下來、還沒存的紀錄：{ text, residentText, scheduledAt }，沒有就是 null
const draft = defineModel('draft', { type: Object, default: null })

const open = ref(false) // 表單有沒有展開
const text = ref('')
const residentText = ref('')
const scheduledAt = ref('')

// 展開時，帶入之前記下來的內容（已經記下一筆時，按鈕是「修改處理紀錄」）
function start() {
  text.value = draft.value?.text ?? ''
  residentText.value = draft.value?.residentText ?? ''
  scheduledAt.value = draft.value?.scheduledAt ?? ''
  open.value = true
}

// 確定：先記下來，表單收起來
function confirm() {
  if (!text.value.trim()) return
  draft.value = { text: text.value.trim(), residentText: residentText.value.trim(), scheduledAt: scheduledAt.value }
  open.value = false
}
</script>

<template>
  <div v-if="open" class="space-y-3">
    <div class="space-y-2">
      <Label for="log-text" class="text-base">處理內容<span class="text-destructive">*</span></Label>
      <Textarea
        id="log-text"
        v-model="text"
        maxlength="200"
        placeholder="例：大同電梯更換零件需調貨"
        class="min-h-[88px]"
      />
    </div>
    <div class="space-y-2">
      <Label for="log-resident" class="text-base">
        給住戶看的說明<span class="type-date text-muted-foreground">選填</span>
      </Label>
      <!-- 住戶看不到上面的內容（可能有廠商名稱、報價），要給住戶看的另外寫一句 -->
      <Input id="log-resident" v-model="residentText" maxlength="50" placeholder="例：廠商將於 10/5 再次到場處理。" />
      <p class="type-date text-muted-foreground">沒寫的話，這筆紀錄不會顯示給通報的住戶。</p>
    </div>
    <div v-if="canReschedule" class="space-y-2">
      <Label for="log-scheduled" class="text-base">
        改期：新的預約到場時間<span class="type-date text-muted-foreground">選填</span>
      </Label>
      <Input id="log-scheduled" v-model="scheduledAt" type="datetime-local" :min="MOCK_NOW" />
    </div>
    <div class="flex gap-3 *:flex-1">
      <Button variant="outline" @click="open = false">取消</Button>
      <Button :disabled="!text.trim()" @click="confirm">確定</Button>
    </div>
  </div>

  <Button v-else variant="outline" class="w-full" @click="start">
    {{ draft ? '修改處理紀錄' : '＋ 新增處理紀錄' }}
  </Button>
</template>
