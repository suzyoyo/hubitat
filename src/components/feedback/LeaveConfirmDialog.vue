<script setup>
// 離開前確認：表單填到一半想離開（按返回、點底部分頁、重新整理、關掉分頁）時，先問一次（2026-10-19）
// 用法：放在表單頁裡，傳「有沒有填東西」；要能存草稿的，再傳待辦卡上的名稱和要存的內容
//   <LeaveConfirmDialog :dirty="isDirty" draft-title="新增交辦" :draft-data="{ ...form }" />
// 沒填東西就直接離開，不打擾；送出成功後要換頁的，要讓 isDirty 先變成 false（例如加一個 saved 旗子）
// 回到同一個表單時，表單自己用 takeDraft 把內容拿回來（寫法見 views/committee/QuickSaveView.vue）
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { getCurrentUser, saveDraft } from '@/mocks/api'

const props = defineProps({
  // 有沒有填東西（還沒送出）
  dirty: { type: Boolean, default: false },
  // 待辦卡上的名稱，例如「新增交辦」；不傳就沒有「存成草稿」
  draftTitle: { type: String, default: '' },
  // 要存的表單內容
  draftData: { type: Object, default: null },
  // 草稿記在哪個網址；不傳就是目前的網址（網址會變的流程要傳固定的，例如新增通報傳 '/resident/reports/new'）
  draftPath: { type: String, default: '' },
})

const route = useRoute()
const router = useRouter()
const open = ref(false)
const saving = ref(false)
let target = null // 使用者原本要去的地方
let allowed = false // 按了「直接離開」或存好草稿，這次就不再擋

// 換頁前：有填東西就先擋下來，跳出彈窗
onBeforeRouteLeave((to) => {
  if (!props.dirty || allowed) return true
  target = to
  open.value = true
  return false
})

// 放行，再去原本要去的地方
// 原本是按返回（要去的就是上一頁）就退回上一頁，歷史紀錄才不會多一筆
function goToTarget() {
  allowed = true
  open.value = false
  if (window.history.state?.back === target.fullPath) router.back()
  else router.push(target.fullPath)
}

// 按「存成草稿，晚點再填」：存好再離開
async function saveAndLeave() {
  saving.value = true
  const user = await getCurrentUser(route.meta.roleId)
  await saveDraft(user.id, route.meta.roleId, props.draftPath || route.fullPath, props.draftTitle, props.draftData)
  saving.value = false
  // 住戶端沒有「我的待辦」，只說回到這一頁會帶回來
  toast.success('已存成草稿', {
    description: route.meta.roleId === 'resident' ? '下次回到這一頁，內容會自動帶回來。' : '已放進你的待辦，點了可以繼續填。',
  })
  goToTarget()
}

// 重新整理、關掉分頁：瀏覽器只能跳它自己的提醒，文字不能改
function onBeforeUnload(event) {
  if (!props.dirty) return
  event.preventDefault()
  event.returnValue = ''
}
onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent :show-close-button="false" class="gap-3.5 p-5">
      <!-- 結尾的 ! 是「一定要用這個」：DialogTitle 本身有預設的字級，要蓋過它 -->
      <DialogTitle class="type-card-title!">還沒送出，確定要離開嗎？</DialogTitle>
      <DialogDescription class="type-body!">
        {{ draftTitle ? '直接離開的話，剛剛填的內容不會保留。' : '離開後，剛剛填的內容不會保留。' }}
      </DialogDescription>
      <!-- pt-3：說明和按鈕之間多空一點，不要太擠（2026-10-19） -->
      <div class="space-y-2 pt-3">
        <!-- 次要在左、主要在右；最安全的「繼續填寫」是主要按鈕，避免誤按就把資料丟掉 -->
        <div class="flex gap-3 *:flex-1">
          <Button variant="outline" :disabled="saving" @click="goToTarget">直接離開</Button>
          <Button :disabled="saving" @click="open = false">繼續填寫</Button>
        </div>
        <Button v-if="draftTitle" variant="ghost" class="w-full" :disabled="saving" @click="saveAndLeave">
          存成草稿，晚點再填
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
