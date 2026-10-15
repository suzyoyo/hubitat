<script setup>
// 「留言給管委會」的底部抽屜（對應 Kit 的 Message/Sheet Content，外層包好了 ui/drawer）
// 兩種畫面（Kit 的變體 State）：
//   輸入中   → 打字、確認送出
//   送出成功 → 打勾、「完成」或「查看我的留言」
// 這個元件只負責畫面，真的去送出留言是頁面的工作：按「確認送出」會送出 submit 事件，送成功後頁面把 sent 改成 true
import { computed, watch } from 'vue'
import { CircleCheckBigIcon, XIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps({
  // 留言的是哪一場會議，顯示在標題下面，例如「2026 年第 3 次管委會」
  meetingTitle: { type: String, required: true },
  // 留言最多幾個字
  maxLength: { type: Number, required: true },
  // 送出還在路上時傳 true，按鈕先不能按，避免連按兩次
  pending: { type: Boolean, default: false },
  // 送出成功了沒：true 就換成「留言已送出」的畫面
  sent: { type: Boolean, default: false },
  // 「查看我的留言」要連到哪裡
  myCommentsPath: { type: String, required: true },
})

// submit：按了「確認送出」，會把留言內容傳出去
const emit = defineEmits(['submit'])

// 抽屜是開還是關。頁面用 v-model:open 綁定
const open = defineModel('open', { type: Boolean, default: false })
// 輸入框裡的留言。頁面不用管，送出時會從 submit 事件拿到
const text = defineModel('text', { type: String, default: '' })

// 只打空白不算有寫，「確認送出」不能按
const canSubmit = computed(() => text.value.trim() !== '' && !props.pending)

// 送出成功後把打的字清掉，下次打開是空的
watch(
  () => props.sent,
  (sent) => {
    if (sent) text.value = ''
  },
)

function submit() {
  if (canSubmit.value) emit('submit', text.value)
}
</script>

<template>
  <Drawer v-model:open="open">
    <!-- 設計稿：白底、上面兩個角圓 18px、左右 20px、下面 32px 的留白 -->
    <!-- mx-auto max-w-md：和頁面內容一樣寬（桌機上不會撐滿整個畫面） -->
    <!-- [&>:first-child]：第一個子元素是 ui/drawer 內建的拖曳把手，照設計稿改成 40px 寬、灰色，上面留 12px -->
    <!-- @open-auto-focus.prevent：打開時不要自動把游標放進輸入框（不然手機的鍵盤會馬上跳出來） -->
    <DrawerContent
      class="mx-auto max-w-md gap-4 rounded-t-[18px]! border-t-0! bg-card px-5 pb-8 [&>:first-child]:mt-3 [&>:first-child]:w-10 [&>:first-child]:bg-border"
      @open-auto-focus.prevent
    >
      <!-- 輸入中 -->
      <template v-if="!sent">
        <div class="space-y-1">
          <!-- 標題列：標題＋右邊的叉叉（看起來 22px，可以點的範圍 44px） -->
          <div class="flex items-center gap-2">
            <!-- 結尾的 ! 是「一定要用這個」：DrawerTitle 本身有預設的字級，要蓋過它 -->
            <DrawerTitle class="flex-1 type-card-title!">留言給管委會</DrawerTitle>
            <DrawerClose as-child>
              <button type="button" aria-label="關閉" class="-mr-2.5 flex size-11 items-center justify-center">
                <XIcon class="size-[22px]" />
              </button>
            </DrawerClose>
          </div>
          <!-- 第二行：左邊是會議名稱，右邊是字數 -->
          <div class="flex items-center justify-between gap-3 type-date text-muted-foreground">
            <DrawerDescription class="type-date! text-muted-foreground">{{ meetingTitle }}</DrawerDescription>
            <span class="shrink-0">{{ text.length }} / {{ maxLength }}</span>
          </div>
        </div>

        <!-- maxlength：超過字數上限就打不進去 -->
        <Textarea
          v-model="text"
          aria-label="留言內容"
          placeholder="想問管委會什麼？例：續約後保養頻率會不會調整？"
          :maxlength="maxLength"
          class="max-h-48"
        />

        <div class="flex flex-col gap-2">
          <Button :disabled="!canSubmit" @click="submit">確認送出</Button>
          <DrawerClose as-child>
            <Button variant="outline">返回</Button>
          </DrawerClose>
        </div>
      </template>

      <!-- 送出成功 -->
      <div v-else class="flex flex-col items-center gap-4">
        <!-- stroke-width 1：圖示放大到 56px 時線條約 2px，和設計稿一樣細 -->
        <CircleCheckBigIcon class="size-14" :stroke-width="1" />
        <DrawerTitle class="type-title!">留言已送出</DrawerTitle>
        <DrawerDescription class="text-center type-date! text-muted-foreground">
          管委會回覆後，好彼管家會通知你。<br />你也可以隨時在「我的留言」查看。
        </DrawerDescription>
        <div class="flex w-full flex-col gap-2">
          <DrawerClose as-child>
            <Button>完成</Button>
          </DrawerClose>
          <Button variant="outline" as-child>
            <RouterLink :to="myCommentsPath">查看我的留言</RouterLink>
          </Button>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
