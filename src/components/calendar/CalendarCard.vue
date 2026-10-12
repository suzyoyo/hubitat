<script setup>
// 社區行事曆卡（對應 Figma 的 Calendar/Card）
// 從這個星期日開始的兩週日期，哪一天有公告就在日期下面放圓點：
//   實心圓點＝與我有關的公告，空心圓點＝其他的社區公告
import { computed } from 'vue'
import { addDays, weekdayIndex } from '@/lib/date'
import { MOCK_TODAY } from '@/mocks/api'

const props = defineProps({
  // getAnnouncements() 回傳的公告清單
  notices: { type: Array, required: true },
})

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
// 一天最多畫幾個圓點（同一種），太多會擠在一起
const MAX_DOTS = 2

// 標題用今天的月份：'2026-10-01' → 10
const month = computed(() => Number(MOCK_TODAY.split('-')[1]))

// 要顯示的 14 天，每一天是一個物件
const days = computed(() => {
  // 往回推到這個星期日：今天是星期四（4）就往回 4 天
  const firstDate = addDays(MOCK_TODAY, -weekdayIndex(MOCK_TODAY))
  const list = []
  for (let i = 0; i < 14; i++) {
    const date = addDays(firstDate, i)
    // 這一天有哪些公告：公告的開始日 ≤ 這一天 ≤ 結束日
    const todays = props.notices.filter((item) => {
      const start = item.startAt.split('T')[0]
      const end = item.endAt.split('T')[0]
      return start <= date && date <= end
    })
    const relatedCount = todays.filter((item) => item.relatedToMe).length
    list.push({
      date,
      day: Number(date.split('-')[2]), // '2026-10-05' → 5
      isToday: date === MOCK_TODAY,
      // 是不是這個月的日期：比對前 7 個字 '2026-10'
      isThisMonth: date.slice(0, 7) === MOCK_TODAY.slice(0, 7),
      relatedCount,
      otherCount: todays.length - relatedCount,
    })
  }
  return list
})
</script>

<template>
  <section class="space-y-2 rounded-xl bg-card px-3 py-4 shadow-card">
    <h2 class="px-1 type-body-strong">{{ month }} 月社區行事曆</h2>

    <!-- grid-cols-7：一列七格，14 天會自動排成兩列 -->
    <div class="grid grid-cols-7">
      <!-- 星期列：星期日紅色、星期六藍色 -->
      <p
        v-for="(weekday, index) in WEEKDAYS"
        :key="weekday"
        class="py-1 text-center type-date font-medium"
        :class="{ 'text-warning': index === 0, 'text-brand-strong': index === 6 }"
      >
        {{ weekday }}
      </p>

      <div v-for="item in days" :key="item.date" class="flex flex-col items-center gap-[3px] py-1.5">
        <!-- 今天用淺藍底標出來；不是這個月的日期用灰色 -->
        <p
          class="w-[38px] rounded-[10px] text-center type-body"
          :class="{ 'bg-brand-subtle': item.isToday, 'text-muted-foreground': !item.isThisMonth }"
        >
          {{ item.day }}
        </p>
        <!-- 圓點那一列固定高度：沒有公告的日子也留著空位，兩列日期才會對齊 -->
        <div class="flex h-1.5 items-center gap-[3px]">
          <!-- v-for 一個數字：n 會從 1 數到那個數字，用來重複畫幾個圓點 -->
          <span
            v-for="n in Math.min(item.relatedCount, MAX_DOTS)"
            :key="`related-${n}`"
            class="size-1.5 rounded-full bg-primary"
          />
          <span
            v-for="n in Math.min(item.otherCount, MAX_DOTS)"
            :key="`other-${n}`"
            class="size-1.5 rounded-full border-[1.5px] border-primary"
          />
        </div>
        <!-- 圓點只有看得到的人看得懂，另外寫一句給螢幕閱讀器（sr-only：畫面上看不到） -->
        <span v-if="item.relatedCount || item.otherCount" class="sr-only">
          {{ item.relatedCount }} 則與我有關、{{ item.otherCount }} 則社區公告
        </span>
      </div>
    </div>

    <!-- 圖例：說明兩種圓點的意思 -->
    <div class="flex items-center gap-4 px-1 pt-1 type-date font-semibold">
      <p class="flex items-center gap-1.5">
        <span class="size-2 rounded-full bg-primary" />
        與我有關
      </p>
      <p class="flex items-center gap-1.5">
        <span class="size-2 rounded-full border-[1.5px] border-primary" />
        社區公告
      </p>
    </div>
  </section>
</template>
