<script setup>
// 案件詳情「關聯設備」卡片裡的選擇設備（做法和 CaseVendorPicker 一樣，按了在卡片裡展開）
//   輸入框打字篩選設備清冊（名稱或位置），點一台就把名字填進輸入框；只能選清冊裡有的
// 按「確定」只是先記下來（v-model:draft），頁面會把它顯示在卡片上；真的存是按頁面底部的「更新現況」
// 選了設備，結案時才會記進這台設備的維修紀錄（docs/case-flow.md）
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps({
  // 可以選的設備：getEquipmentList() 回傳的清單（已報廢的頁面會先拿掉）
  devices: { type: Array, required: true },
  // 按鈕上的字：還沒選是「選擇設備」，已經選了是「更換設備」
  buttonText: { type: String, default: '選擇設備' },
})

// 記下來、還沒存的選擇：{ equipmentId, name, place }，沒有就是 null
const draft = defineModel('draft', { type: Object, default: null })

const open = ref(false) // 選擇的區塊有沒有展開
const name = ref('') // 輸入框裡的字

// 名稱或位置有包含輸入的字的設備；沒打字就全部列出來
const matches = computed(() => {
  const word = name.value.trim()
  return props.devices.filter((device) => device.name.includes(word) || device.place.includes(word))
})
// 輸入框的名字剛好是清冊裡的哪一台
const picked = computed(() => props.devices.find((device) => device.name === name.value.trim()))
// 選好一台就把選單收起來（和選廠商一樣）
const showList = computed(() => matches.value.length > 0 && !picked.value)

function start() {
  name.value = draft.value?.name ?? ''
  open.value = true
}

function confirm() {
  if (!picked.value) return
  draft.value = { equipmentId: picked.value.id, name: picked.value.name, place: picked.value.place }
  open.value = false
}
</script>

<template>
  <div v-if="open" class="space-y-3">
    <div class="space-y-2">
      <Label for="case-equipment" class="text-base">設備<span class="text-destructive">*</span></Label>
      <Input id="case-equipment" v-model="name" placeholder="輸入設備名稱或位置，或從選單選" autocomplete="off" />
      <!-- 選單：一列一台，名稱下面一行灰字是位置；每列至少 44px 高 -->
      <ul v-if="showList" role="listbox" aria-label="設備" class="max-h-56 overflow-y-auto rounded-lg border bg-card">
        <li v-for="device in matches" :key="device.id" role="option" :aria-selected="false">
          <button type="button" class="flex min-h-11 w-full flex-col justify-center px-3 py-1.5 text-left" @click="name = device.name">
            <span class="type-body">{{ device.name }}</span>
            <span class="type-date text-muted-foreground">{{ device.place }}</span>
          </button>
        </li>
      </ul>
      <p v-else-if="!picked" class="type-date text-muted-foreground">清冊裡沒有符合的設備</p>
    </div>
    <div class="flex gap-3 *:flex-1">
      <Button variant="outline" @click="open = false">取消</Button>
      <Button :disabled="!picked" @click="confirm">確定</Button>
    </div>
  </div>

  <Button v-else variant="outline" class="w-full" @click="start">{{ buttonText }} ›</Button>
</template>
