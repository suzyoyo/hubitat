<script setup>
// 狀態畫面：載入失敗、送出失敗、離線、找不到、同時操作、沒有權限、權限被拒、開啟通知提醒、功能準備中
// 最上面的開關可以讓所有假 API 故意失敗，用來看真的頁面失敗時的樣子
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import OfflineBanner from '@/components/app/OfflineBanner.vue'
import FeedbackConflictDialog from '@/components/feedback/FeedbackConflictDialog.vue'
import FeedbackPermissionDialog from '@/components/feedback/FeedbackPermissionDialog.vue'
import FeedbackState from '@/components/feedback/FeedbackState.vue'
import NotificationReminder from '@/components/feedback/NotificationReminder.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { toastSubmitError } from '@/lib/feedback'
import { getVendors, mockFail } from '@/mocks/api'

// 假 API 故意失敗的開關（mockFail 是共用的，外框的橘色橫幅也看它）
function changeMockFail(on) {
  mockFail.value = on
  loadVendors()
}

// 載入失敗的示範：真的去拿廠商名冊，開關打開就會失敗
const loading = ref(true)
const loadFailed = ref(false)
const vendorCount = ref(0)
async function loadVendors() {
  loading.value = true
  loadFailed.value = false
  try {
    vendorCount.value = (await getVendors()).length
  } catch {
    loadFailed.value = true
  }
  loading.value = false
}
onMounted(loadVendors)
// 送出失敗的示範：按送出一定失敗，填的字留著
const draft = ref('B 棟 3 樓走廊的燈一閃一閃的')
const submitting = ref(false)
function fakeSubmit() {
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    toastSubmitError()
  }, 800)
}

const conflictOpen = ref(false)
const permissionKind = ref('camera')
const permissionOpen = ref(false)
function openPermission(kind) {
  permissionKind.value = kind
  permissionOpen.value = true
}
</script>

<template>
  <section id="state" class="scroll-mt-40 space-y-8">
    <h2 class="text-lg font-bold">狀態畫面</h2>

    <!-- 假 API 故意失敗：打開後，App 裡所有頁面拿資料都會失敗 -->
    <div class="space-y-2 rounded-lg border bg-card p-3">
      <p class="type-body-strong">模擬連線失敗（測試模式）</p>
      <p class="type-date text-muted-foreground">
        打開後 App 裡拿資料都會失敗，像網路斷掉一樣（換頁、重新整理都還在）。開著時每一頁上方會有橘色的「測試模式」橫幅。還沒處理錯誤的頁面會一直轉圈，<strong>看完要關掉</strong>。
      </p>
      <div class="flex gap-2">
        <Button size="sm" :variant="mockFail ? 'outline' : 'default'" @click="changeMockFail(false)">正常</Button>
        <Button size="sm" :variant="mockFail ? 'default' : 'outline'" @click="changeMockFail(true)">模擬失敗</Button>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="type-card-title">1. 載入失敗</h3>
      <p class="type-date text-muted-foreground">整頁或一個區塊拿不到資料時。這裡真的去拿廠商名冊，打開上面的開關就會失敗。</p>
      <div class="rounded-xl bg-background pb-6 shadow-card">
        <Skeleton v-if="loading" class="m-4 h-20" />
        <FeedbackState v-else-if="loadFailed" kind="load-failed" @retry="loadVendors" />
        <p v-else class="type-body p-4">載入成功：{{ vendorCount }} 家廠商</p>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="type-card-title">2. 送出失敗</h3>
      <p class="type-date text-muted-foreground">按送出後失敗：上方跳出紅色提示，填好的內容不會清掉。</p>
      <div class="space-y-3 rounded-xl bg-background p-4 shadow-card">
        <Textarea v-model="draft" class="min-h-[80px]" />
        <Button class="w-full" :disabled="submitting" @click="fakeSubmit">
          {{ submitting ? '送出中…' : '送出（一定會失敗）' }}
        </Button>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="type-card-title">3. 離線提示</h3>
      <p class="type-date text-muted-foreground">
        沒有網路時，頂部列下面出現這條，網路恢復就消失。已經接在外框裡了：手機開飛航模式，或電腦開發者工具的 Network 選 Offline 就看得到。
      </p>
      <div class="overflow-hidden rounded-xl bg-background shadow-card">
        <p class="type-title px-5 py-3 text-center">頂部列</p>
        <OfflineBanner preview />
        <p class="type-body px-5 py-6 text-muted-foreground">頁面內容</p>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="type-card-title">4. 找不到資料、找不到頁面</h3>
      <p class="type-date text-muted-foreground">從舊的通知點進已經刪除、撤回的資料時。</p>
      <div class="rounded-xl bg-background pb-6 shadow-card">
        <FeedbackState kind="not-found" />
      </div>
      <p class="type-date text-muted-foreground">網址打錯時（真的頁面，可以點進去看）：</p>
      <div class="flex gap-2">
        <Button as-child variant="outline" class="flex-1">
          <RouterLink to="/committee/abc">管委會端打錯</RouterLink>
        </Button>
        <Button as-child variant="outline" class="flex-1">
          <RouterLink to="/abc">整個網址打錯</RouterLink>
        </Button>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="type-card-title">5. 狀態已經變了（同時操作）</h3>
      <p class="type-date text-muted-foreground">例：李主委要結案時，張副主委已經先結案了。</p>
      <Button variant="outline" class="w-full" @click="conflictOpen = true">打開彈窗</Button>
      <FeedbackConflictDialog
        v-model:open="conflictOpen"
        description="張副主委在 13:40 已經結案。"
        @refresh="toast('（示範）重新拿資料')"
      />
    </div>

    <div class="space-y-2">
      <h3 class="type-card-title">6. 沒有權限</h3>
      <p class="type-date text-muted-foreground">例：卸任的委員、或點了只有主委能看的連結。</p>
      <div class="rounded-xl bg-background pb-6 shadow-card">
        <FeedbackState kind="no-permission" />
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="type-card-title">7. 相機、相簿權限被拒</h3>
      <p class="type-date text-muted-foreground">之前按了「不允許」，網頁不能再問一次，只能教使用者自己打開。</p>
      <div class="grid grid-cols-2 gap-2">
        <Button variant="outline" @click="openPermission('camera')">相機</Button>
        <Button variant="outline" @click="openPermission('photos')">相簿</Button>
      </div>
      <FeedbackPermissionDialog
        v-model:open="permissionOpen"
        :kind="permissionKind"
        @use-photos="toast('（示範）打開相簿')"
      />
    </div>

    <div class="space-y-2">
      <h3 class="type-card-title">8. 開啟通知提醒</h3>
      <p class="type-date text-muted-foreground">
        放在三端首頁最上面，還沒開通知就一直出現，但不擋。「先不要」只藏到這次關掉 App；拒絕過時，按「開啟通知」會教他到設定打開。
      </p>
      <NotificationReminder preview />
      <p class="type-date text-muted-foreground">iPhone 用 Safari 開（沒有通知功能）時，改成提醒加入主畫面：</p>
      <NotificationReminder preview preview-install />
      <div class="grid grid-cols-2 gap-2">
        <Button variant="outline" @click="openPermission('notifications')">「通知已關掉」彈窗</Button>
        <Button variant="outline" @click="openPermission('add-to-home')">「加入主畫面」彈窗</Button>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="type-card-title">9. 功能準備中</h3>
      <p class="type-date text-muted-foreground">
        還沒做的頁面都會顯示這個（佔位頁）。下面的灰色小字（頁面名稱、網址）只在 npm run dev 時出現，打包後看不到。
      </p>
      <div class="rounded-xl bg-background pb-6 shadow-card">
        <FeedbackState kind="coming-soon" />
      </div>
      <Button as-child variant="outline" class="w-full">
        <RouterLink to="/committee/meetings">看真的佔位頁（管委會・會議紀錄）</RouterLink>
      </Button>
    </div>
  </section>
</template>
