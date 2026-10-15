<script setup>
// 案件詳情「處理進度與留痕」卡片最下面的新增處理紀錄：欄位一直顯示（2026-10-15 改，原本要先按「＋ 新增處理紀錄」、再按「確定」）
//   內容（管理端看的）、給住戶看的一句（選填，沒寫就不給住戶看）
//   沒有「改期」（2026-10-15 013 拿掉）：要改預約時間，在「廠商履歷」卡片的預約到場時間改
// 有寫內容就記下來（v-model:draft）；真的存是按頁面底部的「更新進度」，和設備、廠商合成一筆紀錄
// 規則見 docs/case-flow.md 4-4
import { ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// 記下來、還沒存的紀錄：{ text, residentText }，沒有就是 null
const draft = defineModel('draft', { type: Object, default: null })

const text = ref('')
const residentText = ref('')

// 邊填邊記下來：有寫內容才算一筆
watch([text, residentText], () => {
  draft.value = text.value.trim() ? { text: text.value.trim(), residentText: residentText.value.trim() } : null
})

// 按「更新進度」存好之後（頁面把 draft 清掉），欄位也清空
// 自己把內容刪光時 draft 也會變 null，這時內容已經是空的，就不要連其他欄位一起清
watch(draft, (value) => {
  if (value || !text.value.trim()) return
  text.value = ''
  residentText.value = ''
})
</script>

<template>
  <div class="space-y-3">
    <div class="space-y-2">
      <Label for="log-text" class="text-base">處理內容</Label>
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
  </div>
</template>
