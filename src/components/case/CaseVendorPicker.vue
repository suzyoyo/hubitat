<script setup>
// 案件詳情「廠商履歷」卡片裡的選擇廠商（設計稿的「選擇廠商 ›」按鈕，按了在卡片裡展開）
//   輸入框打字會篩選名冊裡合作中的廠商，點一家就把名字填進輸入框；名冊裡沒有的，直接用打的名字
//   預約到場時間選填
// 按「確定」只是先記下來（v-model:draft），頁面會把它顯示在卡片上；真的存是按頁面底部的「更新現況」
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MOCK_NOW } from '@/mocks/api'

const props = defineProps({
  // 名冊裡可以選的廠商：getVendors('active') 回傳的清單
  vendors: { type: Array, required: true },
  // 按鈕上的字：還沒派是「選擇廠商」，已經派了（或已經記下來）是「更換廠商」
  buttonText: { type: String, default: '選擇廠商' },
})

// 記下來、還沒存的選擇：{ vendorId, vendorName, scheduledAt }，沒有就是 null
//   名冊裡的廠商：vendorId 有值；名冊裡沒有、自己打的：vendorId 是空字串
const draft = defineModel('draft', { type: Object, default: null })

const open = ref(false) // 選擇的區塊有沒有展開
const name = ref('') // 輸入框裡的廠商名稱
const scheduledAt = ref('') // datetime-local 的值，例如 '2026-10-03T14:00'

// 名冊裡名字有包含輸入的字的廠商；沒打字就全部列出來
const matches = computed(() => props.vendors.filter((vendor) => vendor.name.includes(name.value.trim())))
// 輸入框的名字剛好是名冊裡的哪一家（打的名字名冊裡沒有就是 undefined）
const listed = computed(() => props.vendors.find((vendor) => vendor.name === name.value.trim()))
// 選好一家（輸入框的名字剛好是名冊裡的）就把選單收起來，免得看起來像另一個可以點的欄位；
// 想換的話改輸入框的字，選單會再出現
const showList = computed(() => matches.value.length > 0 && !listed.value)

// 展開時，帶入之前記下來的選擇
function start() {
  name.value = draft.value?.vendorName ?? ''
  scheduledAt.value = draft.value?.scheduledAt ?? ''
  open.value = true
}

// 確定：先記下來，收起來
function confirm() {
  if (!name.value.trim()) return
  draft.value = { vendorId: listed.value?.id ?? '', vendorName: name.value.trim(), scheduledAt: scheduledAt.value }
  open.value = false
}
</script>

<template>
  <!-- 展開：輸入框＋選單、預約時間、取消／確定 -->
  <div v-if="open" class="space-y-3">
    <div class="space-y-2">
      <Label for="case-vendor" class="text-base">廠商<span class="text-destructive">*</span></Label>
      <Input id="case-vendor" v-model="name" placeholder="輸入廠商名稱，或從選單選" autocomplete="off" />
      <!-- 選單：符合的廠商，一列一家，每列 44px 高；太多時可以在框裡上下滑。沒有符合的、已經選好的就不顯示 -->
      <ul v-if="showList" role="listbox" aria-label="廠商" class="max-h-56 overflow-y-auto rounded-lg border bg-card">
        <li v-for="vendor in matches" :key="vendor.id" role="option" :aria-selected="false">
          <button type="button" class="flex min-h-11 w-full items-center px-3 text-left type-body" @click="name = vendor.name">
            {{ vendor.name }}
          </button>
        </li>
      </ul>
    </div>
    <div class="space-y-2">
      <Label for="case-scheduled" class="text-base">
        預約到場時間<span class="type-date text-muted-foreground">選填</span>
      </Label>
      <!-- datetime-local：手機會跳出選日期和時間的轉盤；min 讓使用者選不到比現在早的時間 -->
      <Input id="case-scheduled" v-model="scheduledAt" type="datetime-local" :min="MOCK_NOW" />
    </div>
    <div class="flex gap-3 *:flex-1">
      <Button variant="outline" @click="open = false">取消</Button>
      <Button :disabled="!name.trim()" @click="confirm">確定</Button>
    </div>
  </div>

  <!-- 還沒展開：一顆灰底按鈕 -->
  <Button v-else variant="outline" class="w-full" @click="start">{{ buttonText }} ›</Button>
</template>
