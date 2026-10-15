<script setup>
// 案件詳情「關聯設備」卡片裡的選擇設備：輸入框一直顯示（2026-10-15 改，原本要先按「選擇設備 ›」展開）
//   輸入框打字篩選設備清冊（名稱或位置），點一台就記下來（v-model:draft）；只能選清冊裡有的
//   真的存是按頁面底部的「更新現況」（輸入框下面不放灰字，2026-10-15 013 決定）
// 選了設備，結案時才會記進這台設備的維修紀錄（docs/case-flow.md）
import { computed, ref, watch } from 'vue'
import { Input } from '@/components/ui/input'

const props = defineProps({
  // 可以選的設備：getEquipmentList() 回傳的清單（已報廢的頁面會先拿掉）
  devices: { type: Array, required: true },
  // 已經存好的設備：{ name, place }；還沒關聯就是空字串
  current: { type: Object, default: () => ({ name: '', place: '' }) },
})

// 記下來、還沒存的選擇：{ equipmentId, name, place }，沒有就是 null
const draft = defineModel('draft', { type: Object, default: null })

const name = ref(props.current.name) // 輸入框裡的字

// 存好之後（存好的設備換了），輸入框跟著換成存好的設備
watch(
  () => props.current.name,
  (value) => (name.value = value),
)

// 名稱或位置有包含輸入的字的設備；沒打字就全部列出來
const matches = computed(() => {
  const word = name.value.trim()
  return props.devices.filter((device) => device.name.includes(word) || device.place.includes(word))
})
// 輸入框的名字剛好是清冊裡的哪一台
const picked = computed(() => props.devices.find((device) => device.name === name.value.trim()))
// 選單：點進輸入框（或打字）才出現，選好一台就收起來；不然整份清冊會一直攤在卡片裡
const listOpen = ref(false)
const showList = computed(() => listOpen.value && matches.value.length > 0 && !picked.value)

// 離開輸入框時收起選單；等一下再收，點選單裡的設備才來得及算數
function closeListLater() {
  setTimeout(() => (listOpen.value = false), 150)
}

// 點一台：填進輸入框並記下來；選回原本那台就不用記
function pick(device) {
  name.value = device.name
  listOpen.value = false
  draft.value = device.name === props.current.name ? null : { equipmentId: device.id, name: device.name, place: device.place }
}
</script>

<template>
  <div class="space-y-2">
    <Input
      v-model="name"
      aria-label="設備"
      placeholder="輸入設備名稱或位置，或從選單選"
      autocomplete="off"
      @focus="listOpen = true"
      @input="listOpen = true"
      @blur="closeListLater"
    />
    <!-- 選單：一列一台，名稱下面一行灰字是位置；每列至少 44px 高 -->
    <ul v-if="showList" role="listbox" aria-label="設備" class="max-h-56 overflow-y-auto rounded-lg border bg-card">
      <li v-for="device in matches" :key="device.id" role="option" :aria-selected="false">
        <button type="button" class="flex min-h-11 w-full flex-col justify-center px-3 py-1.5 text-left" @click="pick(device)">
          <span class="type-body">{{ device.name }}</span>
          <span class="type-date text-muted-foreground">{{ device.place }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
