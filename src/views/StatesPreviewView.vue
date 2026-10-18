<script setup>
// 狀態畫面的展示頁（暫時的）：看好之後搬進 /playground，再讓假 API 可以故意失敗
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import OfflineBanner from '@/components/app/OfflineBanner.vue'
import FeedbackConflictDialog from '@/components/feedback/FeedbackConflictDialog.vue'
import FeedbackPermissionDialog from '@/components/feedback/FeedbackPermissionDialog.vue'
import FeedbackState from '@/components/feedback/FeedbackState.vue'
import NotificationReminder from '@/components/feedback/NotificationReminder.vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toastSubmitError } from '@/lib/feedback'

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
  <div class="mx-auto max-w-md space-y-8 px-4 py-6">
    <header class="space-y-1">
      <h1 class="type-title">狀態畫面展示</h1>
      <p class="type-date text-muted-foreground">暫時的展示頁，看好之後搬進 /playground。</p>
    </header>

    <section class="space-y-2">
      <h2 class="type-card-title">1. 載入失敗</h2>
      <p class="type-date text-muted-foreground">整頁或一個區塊拿不到資料時。按「重新整理」重新拿一次。</p>
      <div class="rounded-xl bg-background pb-6 shadow-card">
        <FeedbackState kind="load-failed" @retry="toast('（示範）重新拿資料')" />
      </div>
    </section>

    <section class="space-y-2">
      <h2 class="type-card-title">2. 送出失敗</h2>
      <p class="type-date text-muted-foreground">按送出後失敗：上方跳出紅色提示，填好的內容不會清掉。</p>
      <div class="space-y-3 rounded-xl bg-background p-4 shadow-card">
        <Textarea v-model="draft" class="min-h-[80px]" />
        <Button class="w-full" :disabled="submitting" @click="fakeSubmit">
          {{ submitting ? '送出中…' : '送出（一定會失敗）' }}
        </Button>
      </div>
    </section>

    <section class="space-y-2">
      <h2 class="type-card-title">3. 離線提示</h2>
      <p class="type-date text-muted-foreground">
        沒有網路時，頂部列下面出現這條，網路恢復就消失。已經接在外框裡了：手機開飛航模式，或電腦開發者工具的 Network 選 Offline 就看得到。
      </p>
      <div class="overflow-hidden rounded-xl bg-background shadow-card">
        <p class="type-title px-5 py-3 text-center">頂部列</p>
        <OfflineBanner preview />
        <p class="type-body px-5 py-6 text-muted-foreground">頁面內容</p>
      </div>
    </section>

    <section class="space-y-2">
      <h2 class="type-card-title">4. 找不到資料、找不到頁面</h2>
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
    </section>

    <section class="space-y-2">
      <h2 class="type-card-title">5. 狀態已經變了（同時操作）</h2>
      <p class="type-date text-muted-foreground">例：李主委要結案時，張副主委已經先結案了。</p>
      <Button variant="outline" class="w-full" @click="conflictOpen = true">打開彈窗</Button>
      <FeedbackConflictDialog
        v-model:open="conflictOpen"
        description="張副主委在 13:40 已經結案。"
        @refresh="toast('（示範）重新拿資料')"
      />
    </section>

    <section class="space-y-2">
      <h2 class="type-card-title">6. 沒有權限</h2>
      <p class="type-date text-muted-foreground">例：卸任的委員、或點了只有主委能看的連結。</p>
      <div class="rounded-xl bg-background pb-6 shadow-card">
        <FeedbackState kind="no-permission" />
      </div>
    </section>

    <section class="space-y-2">
      <h2 class="type-card-title">7. 相機、相簿權限被拒</h2>
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
    </section>

    <section class="space-y-2">
      <h2 class="type-card-title">8. 開啟通知提醒</h2>
      <p class="type-date text-muted-foreground">
        放在三端首頁最上面，還沒開通知就一直出現，但不擋。「先不要」只藏到這次關掉 App；拒絕過或 iPhone 沒加入主畫面時，按「開啟通知」會教他到設定打開。
      </p>
      <NotificationReminder preview />
      <Button variant="outline" class="w-full" @click="openPermission('notifications')">直接看「還沒開啟通知」彈窗</Button>
    </section>
  </div>
</template>
