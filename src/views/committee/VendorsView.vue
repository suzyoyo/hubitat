<script setup>
// 管委會端・廠商（底部分頁）：廠商緊急聯絡、社區內部聯絡、鑰匙清單（設計稿 1134:15888）
// 緊急聯絡：點廠商連到廠商詳細，按電話直接撥號
// 這一版只有「看」；「編輯」緊急聯絡和鑰匙清單之後再做
import { ChevronRightIcon, PhoneCallIcon, SearchIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import SectionHeader from '@/components/app/SectionHeader.vue'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getEmergencyContacts, getInternalContacts, getKeys } from '@/mocks/api'

const loading = ref(true)
const emergencyContacts = ref([])
const internalContacts = ref([])
const keys = ref([])

onMounted(async () => {
  const [emergencyList, internalList, keyList] = await Promise.all([
    getEmergencyContacts(),
    getInternalContacts(),
    getKeys(),
  ])
  emergencyContacts.value = emergencyList
  internalContacts.value = internalList
  keys.value = keyList
  loading.value = false
})

// ── 搜尋 ─────────────────────────────────────
// 打字就篩選這一頁的三個清單（名稱、聯絡人、電話、保管人）
const keyword = ref('')

// 這一筆的文字裡有沒有搜尋的字；沒打字就全部都算
function matches(...texts) {
  const word = keyword.value.trim()
  return !word || texts.some((text) => text?.includes(word))
}

const shownEmergency = computed(() =>
  emergencyContacts.value.filter((item) => matches(item.vendorName, item.contactName, item.phone)),
)
const shownInternal = computed(() => internalContacts.value.filter((item) => matches(item.name, item.note, item.phone)))
const shownKeys = computed(() => keys.value.filter((item) => matches(item.name, item.keeperLabel)))

// 打電話用的連結：tel: 後面放電話號碼（拿掉 -），手機點了會直接撥號
function telLink(phone) {
  return `tel:${phone.replaceAll('-', '')}`
}
</script>

<template>
  <div class="space-y-8 px-5 pt-4 pb-5">
    <!-- 搜尋框：放大鏡圖示疊在輸入框左邊 -->
    <div class="relative">
      <SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="keyword" type="search" aria-label="搜尋" placeholder="搜尋廠商、聯絡人、電話" class="pl-10" />
    </div>

    <template v-if="loading">
      <Skeleton class="h-[330px] rounded-xl" />
      <Skeleton class="h-[210px] rounded-xl" />
    </template>

    <template v-else>
      <!-- 廠商緊急聯絡：最後一列連到廠商名冊 -->
      <section class="space-y-3">
        <SectionHeader title="廠商緊急聯絡" />
        <div class="rounded-xl bg-card px-4 py-1 shadow-card">
          <template v-for="(item, index) in shownEmergency" :key="`${item.vendorId}-${item.phone}`">
            <Separator v-if="index > 0" />
            <!-- 點廠商那一塊連到廠商詳細；右邊的電話按鈕另外撥號（連結裡面不能再放連結，所以兩個並排） -->
            <div class="flex items-center gap-3">
              <RouterLink :to="`/committee/vendors/${item.vendorId}`" class="flex min-w-0 flex-1 items-center gap-2 py-3">
                <div class="min-w-0 flex-1">
                  <p class="type-body-strong text-foreground">{{ item.vendorName }}</p>
                  <p class="type-date text-muted-foreground">{{ item.contactName }}・{{ item.phone }}</p>
                </div>
                <!-- 提示這一列可以點 -->
                <ChevronRightIcon class="size-4 shrink-0 text-muted-foreground" />
              </RouterLink>
              <a
                :href="telLink(item.phone)"
                :aria-label="`打電話給${item.vendorName}`"
                class="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
              >
                <PhoneCallIcon class="size-5" />
              </a>
            </div>
          </template>
          <p v-if="!shownEmergency.length" class="py-3 type-body text-muted-foreground">沒有符合的廠商</p>
          <Separator />
          <RouterLink to="/committee/vendors/list" class="flex min-h-12 items-center gap-3 py-3">
            <span class="min-w-0 flex-1 type-body-strong text-foreground">廠商名冊</span>
            <ChevronRightIcon class="size-5 shrink-0" />
          </RouterLink>
        </div>
      </section>

      <!-- 社區內部聯絡：管理室、總幹事、委員 -->
      <section class="space-y-3">
        <SectionHeader title="社區內部聯絡" />
        <div class="rounded-xl bg-card px-4 py-1 shadow-card">
          <template v-for="(item, index) in shownInternal" :key="item.id">
            <Separator v-if="index > 0" />
            <div class="flex items-center gap-3 py-3">
              <div class="min-w-0 flex-1">
                <p class="type-body-strong text-foreground">
                  {{ item.name }}
                  <!-- 委員、管理人員的職稱；固定單位（中控室）是「24 小時」這類說明 -->
                  <span class="ml-1 type-date font-normal text-muted-foreground">{{ item.note }}</span>
                </p>
                <p class="type-date text-muted-foreground">{{ item.phone }}</p>
              </div>
              <a
                :href="telLink(item.phone)"
                :aria-label="`打電話給${item.name}`"
                class="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
              >
                <PhoneCallIcon class="size-5" />
              </a>
            </div>
          </template>
          <p v-if="!shownInternal.length" class="py-3 type-body text-muted-foreground">沒有符合的聯絡人</p>
        </div>
      </section>

      <!-- 鑰匙清單：哪把鑰匙由誰保管 -->
      <section class="space-y-3">
        <SectionHeader title="鑰匙清單" />
        <div class="rounded-xl bg-card px-4 py-1 shadow-card">
          <template v-for="(item, index) in shownKeys" :key="item.id">
            <Separator v-if="index > 0" />
            <div class="flex items-baseline gap-3 py-3">
              <p class="min-w-0 flex-1 type-body text-foreground">{{ item.name }}</p>
              <p class="shrink-0 type-date text-muted-foreground">{{ item.keeperLabel }}</p>
            </div>
          </template>
          <p v-if="!shownKeys.length" class="py-3 type-body text-muted-foreground">沒有符合的鑰匙</p>
        </div>
      </section>
    </template>
  </div>
</template>
