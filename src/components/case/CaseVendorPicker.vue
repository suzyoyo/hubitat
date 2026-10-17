<script setup>
// 案件詳情「廠商履歷」卡片裡的選擇廠商：欄位一直顯示（2026-10-15 改，原本要先按「選擇廠商 ›」展開、再按「確定」）
//   輸入框打字會篩選名冊裡合作中的廠商，點一家就把名字填進輸入框；名冊裡沒有的，直接用打的名字
//   預約到場時間選填，用 DatePicker、TimePicker（和其他日期一樣點框框就能選）
// 和已經存好的不一樣時就記下來（v-model:draft）；真的存是按頁面底部的「更新進度」
import { computed, ref, watch } from 'vue'
import DatePicker from '@/components/common/DatePicker.vue'
import TimePicker from '@/components/common/TimePicker.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MOCK_TODAY } from '@/mocks/api'

const props = defineProps({
  // 名冊裡可以選的廠商：getVendors('active') 回傳的清單
  vendors: { type: Array, required: true },
  // 已經存好的廠商：{ name, scheduledAt }；還沒派就是空字串
  current: { type: Object, default: () => ({ name: '', scheduledAt: '' }) },
})

// 記下來、還沒存的選擇：{ vendorId, vendorName, scheduledAt }，沒有就是 null
//   名冊裡的廠商：vendorId 有值；名冊裡沒有、自己打的：vendorId 是空字串
const draft = defineModel('draft', { type: Object, default: null })

const name = ref('') // 輸入框裡的廠商名稱
const scheduledDate = ref('') // 預約到場的日期，例如 '2026-10-03'
const scheduledTime = ref('') // 預約到場的時間，例如 '14:00'

// 欄位換回已經存好的內容（一打開、或按「更新進度」存好、存好的廠商變了之後）
function reset() {
  const [date = '', time = ''] = props.current.scheduledAt.split('T')
  name.value = props.current.name
  scheduledDate.value = date
  scheduledTime.value = time
}
reset()
watch(() => [props.current.name, props.current.scheduledAt], reset)

// 日期、時間都選了才算有預約；組成 '2026-10-03T14:00'
const scheduledAt = computed(() =>
  scheduledDate.value && scheduledTime.value ? `${scheduledDate.value}T${scheduledTime.value}` : '',
)

// 名冊裡名字有包含輸入的字的廠商；沒打字就全部列出來
const matches = computed(() => props.vendors.filter((vendor) => vendor.name.includes(name.value.trim())))
// 輸入框的名字剛好是名冊裡的哪一家（打的名字名冊裡沒有就是 undefined）
const listed = computed(() => props.vendors.find((vendor) => vendor.name === name.value.trim()))
// 選單：點進輸入框（或打字）才出現，選好一家就收起來
const listOpen = ref(false)
const showList = computed(() => listOpen.value && matches.value.length > 0 && !listed.value)

// 離開輸入框時收起選單；等一下再收，點選單裡的廠商才來得及算數
function closeListLater() {
  setTimeout(() => (listOpen.value = false), 150)
}

function pick(vendor) {
  name.value = vendor.name
  listOpen.value = false
}

// 邊填邊記下來：有廠商名字、而且和存好的不一樣才記；改回原本的就不用記
watch([name, scheduledAt], () => {
  const vendorName = name.value.trim()
  const changed = vendorName !== props.current.name || scheduledAt.value !== props.current.scheduledAt
  draft.value = vendorName && changed ? { vendorId: listed.value?.id ?? '', vendorName, scheduledAt: scheduledAt.value } : null
})
</script>

<template>
  <div class="space-y-3">
    <div>
      <!-- 不放「廠商」小標題：卡片標題已經是「廠商」（2026-10-17 suzy）；標籤看不見，螢幕閱讀器還是念得出來 -->
      <Label for="case-vendor" class="sr-only">廠商</Label>
      <Input
        id="case-vendor"
        v-model="name"
        placeholder="從名冊選，或輸入其他廠商名稱"
        autocomplete="off"
        @focus="listOpen = true"
        @input="listOpen = true"
        @blur="closeListLater"
      />
      <!-- 選單：符合的廠商，一列一家，每列 44px 高；太多時可以在框裡上下滑 -->
      <ul v-if="showList" role="listbox" aria-label="廠商" class="max-h-56 overflow-y-auto rounded-lg border bg-card">
        <li v-for="vendor in matches" :key="vendor.id" role="option" :aria-selected="false">
          <button type="button" class="flex min-h-11 w-full items-center px-3 text-left type-body" @click="pick(vendor)">
            {{ vendor.name }}
          </button>
        </li>
      </ul>
    </div>
    <div class="space-y-2">
      <Label for="case-scheduled" class="text-base">
        預約到場時間<span class="type-date text-muted-foreground">選填</span>
      </Label>
      <!-- 日期、時間上下排（放在卡片裡，並排的話日期擠不下）；日期選不到今天以前 -->
      <div class="space-y-2">
        <DatePicker id="case-scheduled" v-model="scheduledDate" :min="MOCK_TODAY" />
        <TimePicker v-model="scheduledTime" aria-label="預約到場的時間" />
      </div>
    </div>
  </div>
</template>
