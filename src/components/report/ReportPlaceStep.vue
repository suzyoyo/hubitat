<script setup>
// 新增通報・第 1 步：選地點（住戶端、管委會端的新增通報共用）
// 先選範圍（A 棟、地下停車場…），選到的那一張卡片會展開，再選底下的地點（1F 大廳、電梯…）
// 只列出住戶常會通報的地點（假資料裡 common: true 的），其他地方選「其他」自己填
import { Building2Icon, CarIcon, TreesIcon, WavesIcon } from '@lucide/vue'
import FeedbackHaobiTip from '@/components/feedback/FeedbackHaobiTip.vue'
import IconTile from '@/components/common/IconTile.vue'
import { Input } from '@/components/ui/input'

defineProps({
  // getAreas() 回傳的範圍清單，每個範圍底下有 places（地點）
  areas: { type: Array, required: true },
})

// 選到的範圍和地點。頁面用 v-model:area-id、v-model:place 綁定，這裡改了頁面也會跟著變
const areaId = defineModel('areaId', { type: String, default: '' })
const place = defineModel('place', { type: String, default: '' })
// 是不是選了「其他」。選了的話，place 是住戶自己填的地點
const isOther = defineModel('isOther', { type: Boolean, default: false })

// 公設區域各自的圖示（key 是範圍的 id）。沒有列在這裡的：棟別用大樓，其他公設用樹
const AREA_ICONS = {
  'area-parking': CarIcon, // 地下停車場
  'area-pool': WavesIcon, // 游泳池
  'area-outdoor': TreesIcon, // 中庭與戶外
}

// 這個範圍要用哪一個圖示
function areaIcon(area) {
  if (AREA_ICONS[area.id]) return AREA_ICONS[area.id]
  return area.type === 'building' ? Building2Icon : TreesIcon
}

// 這個範圍要列出來的地點：只留住戶常會通報的
function commonPlaces(area) {
  return area.places.filter((item) => item.common)
}

// 點了某個範圍：展開它；換範圍的時候，把之前選的地點清掉
function selectArea(id) {
  if (areaId.value === id) return
  areaId.value = id
  place.value = ''
  isOther.value = false
}

// 選了清單上的某個地點
function selectPlace(name) {
  isOther.value = false
  place.value = name
}

// 選了「其他」：先把地點清空，等住戶自己填
function selectOther() {
  if (isOther.value) return
  isOther.value = true
  place.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <FeedbackHaobiTip title="想通報哪裡的問題呢？" />

    <!-- 每個範圍一張卡片；選到的那張有藍色外框 -->
    <div
      v-for="area in areas"
      :key="area.id"
      class="rounded-xl border bg-card shadow-card"
      :class="area.id === areaId ? 'border-primary' : 'border-transparent'"
    >
      <!-- 整列都可以點；aria-expanded 告訴螢幕閱讀器這張卡片有沒有展開 -->
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left"
        :aria-expanded="area.id === areaId"
        @click="selectArea(area.id)"
      >
        <IconTile>
          <!-- component :is：依範圍決定要用哪一個圖示 -->
          <component :is="areaIcon(area)" />
        </IconTile>
        <span class="min-w-0 flex-1 type-card-title text-foreground">{{ area.name }}</span>
      </button>

      <!-- 選到這個範圍才出現：底下的地點，一排兩個 -->
      <div v-if="area.id === areaId" class="space-y-3 px-4 pb-3.5">
        <div class="flex items-start gap-2 type-date text-muted-foreground">
          <p class="min-w-0 flex-1">請選擇具體樓層或設施</p>
          <p class="shrink-0">單選</p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <!-- aria-pressed：告訴螢幕閱讀器這顆按鈕是不是選中的 -->
          <button
            v-for="item in commonPlaces(area)"
            :key="item.id"
            type="button"
            class="h-11 rounded-lg px-2.5 type-body-strong"
            :class="!isOther && item.name === place ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'"
            :aria-pressed="!isOther && item.name === place"
            @click="selectPlace(item.name)"
          >
            {{ item.name }}
          </button>
          <!-- 「其他」永遠排在最後：清單上沒有的地方，或是住戶家裡、門口這類不是公共區域的地方 -->
          <button
            type="button"
            class="h-11 rounded-lg px-2.5 type-body-strong"
            :class="isOther ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'"
            :aria-pressed="isOther"
            @click="selectOther"
          >
            其他
          </button>
        </div>
        <!-- 選了「其他」才出現：自己填地點。v-model 直接綁 place，打什麼地點就是什麼 -->
        <!-- aria-label：輸入框沒有另外的標題文字，這是給螢幕閱讀器念的名稱 -->
        <Input
          v-if="isOther"
          v-model="place"
          aria-label="其他地點"
          placeholder="請填寫地點，例如：5 樓住戶門口"
          maxlength="20"
        />
      </div>
    </div>
  </div>
</template>
