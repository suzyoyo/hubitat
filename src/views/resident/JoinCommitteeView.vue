<script setup>
// 住戶端・加入管委會：輸入主委給的邀請碼 → 確認邀請 → 接受完成
// 每一步的畫面放在 join-committee/ 資料夾，這個檔案負責記住查到的邀請、決定現在顯示哪一步
// 現在是哪一步記在網址上（/resident/me/join?step=confirm），所以按返回會回到上一步，不會直接離開
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { getInviteByCode } from '@/mocks/api'
import { INVITE_CODE_LENGTH } from '@/mocks/data/invites'
import CodeStep from './join-committee/CodeStep.vue'

const route = useRoute()
const router = useRouter()

// 現在是哪一步：看網址上的 step，沒有寫就是輸入邀請碼
//   'code' 輸入邀請碼 / 'confirm' 確認邀請
const step = computed(() => (route.query.step === 'confirm' ? 'confirm' : 'code'))

const code = ref('') // 輸入的邀請碼
const invite = ref(null) // 用邀請碼查到的邀請
const error = ref('') // 邀請碼不能用時的提示
const checking = ref(false) // 正在查邀請碼時是 true

// onMounted：畫面一出現就檢查一次
// 重新整理網頁後，查到的邀請會不見，所以不管網址寫哪一步都回到輸入邀請碼
onMounted(() => {
  if (step.value !== 'code') router.replace({ query: {} })
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

// 從確認邀請按返回回到這一步時，把邀請碼清空，讓住戶重新輸入
watch(step, (current) => {
  if (current !== 'code') return
  code.value = ''
  invite.value = null
})

// 網頁沒辦法真的開相機掃描，先跳提示
function scan() {
  toast.info('相機掃描還沒開放', { description: '請先輸入主委給你的 6 位數邀請碼。' })
}
</script>

<template>
  <div class="px-5 pt-4">
    <CodeStep v-if="step === 'code'" v-model="code" :error="error" :checking="checking" @scan="scan" />

    <!-- 確認邀請：下一步做，先確認查到的邀請有帶過來 -->
    <p v-else-if="invite" class="type-body">{{ invite.inviterName }}邀請你加入第 {{ invite.term }} 屆管理委員會</p>
  </div>
</template>
