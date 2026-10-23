<script setup>
// 住戶端・加入管委會：輸入主委給的邀請碼 → 確認邀請 → 接受完成
// 每一步的畫面放在 join-committee/ 資料夾，這個檔案負責記住查到的邀請、決定現在顯示哪一步
// 現在是哪一步記在網址上（/resident/me/join?step=confirm），所以按返回會回到上一步，不會直接離開
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import BottomCta from '@/components/app/BottomCta.vue'
import { Button } from '@/components/ui/button'
import { acceptInvite, declineInvite, getCurrentUser, getInviteByCode } from '@/mocks/api'
import { INVITE_CODE_LENGTH } from '@/mocks/data/invites'
import AcceptedDone from './join-committee/AcceptedDone.vue'
import CodeStep from './join-committee/CodeStep.vue'
import ConfirmStep from './join-committee/ConfirmStep.vue'

const route = useRoute()
const router = useRouter()

// 現在是哪一步：看網址上的 step，沒有寫就是輸入邀請碼
//   'code' 輸入邀請碼 / 'confirm' 確認邀請 / 'done' 接受之後的完成頁
const step = computed(() => {
  if (route.query.step === 'confirm' || route.query.step === 'done') return route.query.step
  return 'code'
})

const code = ref('') // 輸入的邀請碼
const invite = ref(null) // 用邀請碼查到的邀請
const error = ref('') // 邀請碼不能用時的提示
const checking = ref(false) // 正在查邀請碼時是 true
const userId = ref('') // 我是誰

// onMounted：畫面一出現就檢查一次
// 重新整理網頁後，查到的邀請會不見，所以不管網址寫哪一步都回到輸入邀請碼
onMounted(async () => {
  if (step.value !== 'code') router.replace({ query: {} })
  const user = await getCurrentUser('resident')
  userId.value = user.id
})

// watch：code 一改變就檢查。滿 6 位數就去查，查到可以用的就自動到下一步
watch(code, async (value) => {
  error.value = ''
  checking.value = false
  if (value.length !== INVITE_CODE_LENGTH) return
  checking.value = true
  const result = await getInviteByCode(value)
  // 等資料的這段時間如果又改了邀請碼，這次的結果就不要了
  if (code.value !== value) return
  checking.value = false
  if (result.status !== 'valid') {
    error.value = result.message
    return
  }
  invite.value = result
  // 用 push 才會留下紀錄，按返回可以回到輸入邀請碼
  router.push({ query: { step: 'confirm' } })
})

// 回到輸入邀請碼時（例如從確認邀請按返回），把邀請碼清空，讓住戶重新輸入
// 沒有查到邀請卻跑到後面的步驟（例如按瀏覽器的「下一頁」），就回到輸入邀請碼
watch(step, (current) => {
  if (current === 'code') {
    code.value = ''
    invite.value = null
  } else if (!invite.value) {
    router.replace({ query: {} })
  }
})

// ── 確認邀請：接受或婉拒 ──────────────────────────────

// pending：接受或婉拒還在路上時是 true，按鈕先不能按，避免連按兩次
const pending = ref(false)

// 邀請碼剛好不能用了（例如在這一頁停太久過期了）：跳提示，回到輸入邀請碼
function inviteGone() {
  toast.error('這組邀請碼不能使用了', { description: '請主委重新提供邀請碼。' })
  router.replace({ query: {} })
}

// 按了「接受邀請」
async function accept() {
  pending.value = true
  const updated = await acceptInvite(invite.value.code, userId.value)
  pending.value = false
  // 假 API 回傳 undefined 代表邀請碼不能用了
  if (!updated) return inviteGone()
  invite.value = updated
  // replace：用完成頁取代確認邀請，按返回才不會又回到這一頁再接受一次
  router.replace({ query: { step: 'done' } })
}

// 在彈窗裡按了「確認婉拒」
async function decline() {
  pending.value = true
  const ok = await declineInvite(invite.value.code, userId.value)
  pending.value = false
  if (!ok) return inviteGone()
  toast.success('已婉拒邀請')
  // replace：離開之後按返回不會再回到確認邀請
  router.replace('/resident/me')
}

// 網頁沒辦法真的開相機掃描，先跳提示
function scan() {
  toast.info('相機掃描還沒開放', { description: '請先輸入主委給你的 6 位數邀請碼。' })
}
</script>

<template>
  <!-- pb-24：完成頁有固定在底部的按鈕區，留空間才不會蓋住內容 -->
  <div class="px-5 pt-4" :class="step === 'done' ? 'pb-24' : ''">
    <CodeStep v-if="step === 'code'" v-model="code" :error="error" :checking="checking" @scan="scan" />

    <ConfirmStep
      v-else-if="step === 'confirm' && invite"
      :invite="invite"
      :pending="pending"
      @accept="accept"
      @decline="decline"
    />

    <template v-else-if="step === 'done' && invite">
      <AcceptedDone :invite="invite" />
      <!-- 按鈕左右排，主要動作在右（2026-10-23）。replace：離開之後按返回不會再回到完成頁 -->
      <BottomCta>
        <Button variant="outline" @click="router.replace('/resident/home')">回到首頁</Button>
        <Button @click="router.replace('/resident/me')">查看我的身分</Button>
      </BottomCta>
    </template>
  </div>
</template>
