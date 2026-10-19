<script setup>
// 聯絡支援：一張表單，寄給好彼團隊（2026-10-19 從「電話＋信箱」改來）
//   設計參考：欄位少（6 個，選填的標清楚）、錯誤訊息放在欄位下面並說怎麼改、
//   離開欄位就檢查、送出中不能重複按、送出後說多久回覆
// 目前是測試資料：還沒有接到真的收件地方，送出只是假裝成功（見 content/contact.js）
import { nextTick, reactive, ref } from 'vue'
import { ChevronDownIcon } from '@lucide/vue'
import NoteBox from '@/components/NoteBox.vue'
import happy from '@/assets/mascot/happy.png'
import { CONTACT } from '@/content/contact'

// 表單內容
const form = reactive({ role: '', topic: '', name: '', email: '', phone: '', community: '', message: '' })
// 每個欄位的錯誤訊息，空字串＝沒有錯
const errors = reactive({ role: '', topic: '', name: '', contact: '', email: '', phone: '', message: '' })

const sending = ref(false) // 送出中
const sent = ref(false) // 已送出，顯示完成畫面
const doneHeading = ref(null)

// 檢查一個欄位，回傳錯誤訊息（沒錯就是空字串）
function check(key) {
  const email = form.email.trim()
  const phone = form.phone.replace(/[\s-]/g, '') // 允許使用者打空格或 -
  switch (key) {
    case 'role':
      return form.role ? '' : '請選擇你的身分'
    case 'topic':
      return form.topic ? '' : '請選擇想詢問的事'
    case 'name':
      return form.name.trim() ? '' : '請填寫姓名'
    case 'contact':
      return email || phone ? '' : 'Email 和手機至少填一個，我們才能回覆你'
    case 'email':
      return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Email 格式不對，例如 name@gmail.com'
    case 'phone':
      return !phone || /^09\d{8}$/.test(phone) ? '' : '手機號碼是 09 開頭的 10 個數字，例如 0912345678'
    case 'message':
      return form.message.trim() ? '' : '請寫下遇到的問題'
    default:
      return ''
  }
}

// 離開欄位時檢查（Email、手機兩個欄位一起影響「至少填一個」）
function validate(key) {
  errors[key] = check(key)
  if ((key === 'email' || key === 'phone') && errors.contact) errors.contact = check('contact')
}

// 有錯誤的欄位，依畫面上的順序；送出時游標跳到第一個
const fieldOrder = [
  ['role', 'role-resident'],
  ['topic', 'topic'],
  ['name', 'name'],
  ['contact', 'email'],
  ['email', 'email'],
  ['phone', 'phone'],
  ['message', 'message'],
]

async function submitForm() {
  for (const [key] of fieldOrder) errors[key] = check(key)
  const firstError = fieldOrder.find(([key]) => errors[key])
  if (firstError) {
    document.getElementById(firstError[1])?.focus()
    return
  }

  sending.value = true
  // TODO: 接好收件的地方之後，改成真的送出（例如 fetch 到表單服務）
  await new Promise((resolve) => setTimeout(resolve, 800))
  sending.value = false
  sent.value = true

  await nextTick()
  window.scrollTo({ top: 0 })
  doneHeading.value?.focus()
}

// 再填一份：清空表單
function resetForm() {
  Object.keys(form).forEach((key) => (form[key] = ''))
  Object.keys(errors).forEach((key) => (errors[key] = ''))
  sent.value = false
}

// 顯示在完成畫面的「你填的內容」
const labelOf = (list, value) => list.find((item) => item.value === value)?.label

// 輸入框共用樣式：44px 高、16px 字（iPhone 才不會自動放大），有錯時紅框
const inputClass = (hasError) => [
  'mt-2 block w-full rounded-[10px] border bg-white px-3.5 text-base text-ink placeholder:text-muted focus-visible:outline-offset-0',
  hasError ? 'border-danger' : 'border-[#c9cbce]',
]
</script>

<template>
  <div class="page-container max-w-[720px] py-8 md:py-12">
    <!-- 送出後：完成畫面 -->
    <section v-if="sent" class="rounded-[var(--radius-card)] bg-white p-6 text-center shadow-[var(--shadow-card)] md:p-10">
      <img :src="happy" alt="" class="mx-auto h-32 w-auto" width="214" height="255" />
      <h1 ref="doneHeading" tabindex="-1" class="mt-4 text-[26px] font-bold text-brand-950 focus:outline-none">已經收到你的問題</h1>
      <p class="mt-3 text-lg leading-loose text-ink-soft">
        我們會在<strong class="text-ink">{{ CONTACT.replyTime }}</strong>，用你留的
        {{ [form.email && 'Email', form.phone && '手機'].filter(Boolean).join('或') }}回覆你。
      </p>
      <p v-if="CONTACT.isTestData" class="mt-3 text-sm text-orange-900">（目前是測試，這份表單沒有真的寄出）</p>

      <dl class="mt-6 grid gap-x-4 gap-y-2 rounded-xl bg-page p-4 text-left sm:grid-cols-[auto_1fr]">
        <dt class="text-muted">身分</dt>
        <dd class="font-medium">{{ labelOf(CONTACT.roles, form.role) }}</dd>
        <dt class="text-muted">想詢問</dt>
        <dd class="font-medium">{{ labelOf(CONTACT.topics, form.topic) }}</dd>
        <dt class="text-muted">回覆到</dt>
        <dd class="font-medium break-all">{{ [form.email, form.phone].filter(Boolean).join('、') }}</dd>
      </dl>

      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <RouterLink to="/" class="btn btn-primary">回到首頁</RouterLink>
        <button type="button" class="btn btn-secondary" @click="resetForm">再問一個問題</button>
      </div>
    </section>

    <!-- 表單 -->
    <template v-else>
      <h1 class="text-[28px] font-bold text-brand-950 md:text-[34px]">聯絡支援</h1>
      <p class="lead-text">
        看完教學還是不會操作、發現錯誤，或有建議想告訴我們，請填下面的表單，好彼團隊會在{{ CONTACT.replyTime }}回覆你。
      </p>
      <p class="mt-2 text-ink-soft">
        送出前，也可以先看看<RouterLink to="/faq" class="text-link">常見問題</RouterLink>，說不定馬上就有答案。
      </p>


      <NoteBox class="mt-6" tone="warning" title="社區的緊急狀況，請不要用這個表單">
        <p>{{ CONTACT.emergency }}</p>
      </NoteBox>

      <form class="mt-6 rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)] md:p-8" novalidate @submit.prevent="submitForm">
        <div class="space-y-7">
          <!-- 身分：四個選項用大的點選按鈕，不用打字 -->
          <fieldset :aria-describedby="errors.role ? 'role-error' : undefined">
            <legend class="font-bold text-brand-950">你的身分 <span class="text-danger" aria-hidden="true">*</span></legend>
            <div class="mt-2 grid grid-cols-2 gap-2.5">
              <label
                v-for="role in CONTACT.roles"
                :key="role.value"
                class="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[10px] border px-3.5 has-[:checked]:border-brand-800 has-[:checked]:bg-brand-50 has-[:checked]:font-bold has-[:checked]:text-brand-900"
                :class="errors.role ? 'border-danger' : 'border-[#c9cbce]'"
              >
                <input
                  :id="`role-${role.value}`"
                  v-model="form.role"
                  type="radio"
                  name="role"
                  :value="role.value"
                  class="size-5 shrink-0 accent-brand-800"
                  @change="validate('role')"
                />
                {{ role.label }}
              </label>
            </div>
            <p v-if="errors.role" id="role-error" class="mt-2 text-danger">{{ errors.role }}</p>
          </fieldset>

          <!-- 想詢問什麼 -->
          <div>
            <label for="topic" class="font-bold text-brand-950">想詢問什麼 <span class="text-danger" aria-hidden="true">*</span></label>
            <!-- 拿掉瀏覽器內建的箭頭（appearance-none），改放自己的箭頭圖示，和輸入框長得一樣、箭頭離右邊有距離 -->
            <div class="relative">
              <select
                id="topic"
                v-model="form.topic"
                :class="[inputClass(errors.topic), 'min-h-11 cursor-pointer appearance-none pr-11', !form.topic && 'text-muted']"
                :aria-invalid="!!errors.topic"
                :aria-describedby="errors.topic ? 'topic-error' : undefined"
                required
                @change="validate('topic')"
                @blur="validate('topic')"
              >
                <option value="" disabled>請選擇</option>
                <option v-for="topic in CONTACT.topics" :key="topic.value" :value="topic.value" class="text-ink">{{ topic.label }}</option>
              </select>
              <ChevronDownIcon class="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-brand-800" aria-hidden="true" />
            </div>
            <p v-if="errors.topic" id="topic-error" class="mt-2 text-danger">{{ errors.topic }}</p>
          </div>

          <!-- 姓名 -->
          <div>
            <label for="name" class="font-bold text-brand-950">姓名 <span class="text-danger" aria-hidden="true">*</span></label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              autocomplete="name"
              placeholder="陳小明"
              :class="[inputClass(errors.name), 'min-h-11']"
              :aria-invalid="!!errors.name"
              :aria-describedby="errors.name ? 'name-error' : undefined"
              required
              @blur="validate('name')"
            />
            <p v-if="errors.name" id="name-error" class="mt-2 text-danger">{{ errors.name }}</p>
          </div>

          <!-- 聯絡方式：Email 和手機擇一 -->
          <fieldset :aria-describedby="errors.contact ? 'contact-error' : undefined">
            <legend class="font-bold text-brand-950">聯絡方式 <span class="text-danger" aria-hidden="true">*</span></legend>
            <p v-if="errors.contact" id="contact-error" class="mt-2 text-danger">{{ errors.contact }}</p>

            <label for="email" class="mt-3 block font-medium text-ink">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="name@gmail.com"
              :class="[inputClass(errors.email || errors.contact), 'min-h-11']"
              :aria-invalid="!!(errors.email || errors.contact)"
              :aria-describedby="errors.email ? 'email-error' : undefined"
              @blur="validate('email')"
            />
            <p v-if="errors.email" id="email-error" class="mt-2 text-danger">{{ errors.email }}</p>

            <label for="phone" class="mt-4 block font-medium text-ink">手機</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              placeholder="0912345678"
              :class="[inputClass(errors.phone || errors.contact), 'min-h-11']"
              :aria-invalid="!!(errors.phone || errors.contact)"
              :aria-describedby="errors.phone ? 'phone-error' : undefined"
              @blur="validate('phone')"
            />
            <p v-if="errors.phone" id="phone-error" class="mt-2 text-danger">{{ errors.phone }}</p>
          </fieldset>

          <!-- 社區名稱（選填） -->
          <div>
            <label for="community" class="font-bold text-brand-950">社區名稱 <span class="ml-1 text-sm font-normal text-muted">選填</span></label>
            <input
              id="community"
              v-model="form.community"
              type="text"
              placeholder="好彼一期"
              :class="[inputClass(false), 'min-h-11']"
            />
          </div>

          <!-- 問題說明 -->
          <div>
            <label for="message" class="font-bold text-brand-950">遇到什麼問題 <span class="text-danger" aria-hidden="true">*</span></label>
            <textarea
              id="message"
              v-model="form.message"
              rows="5"
              maxlength="1000"
              placeholder="例如：在「新增通報」最後一步按「送出」，畫面一直轉圈圈，沒有出現完成畫面。"
              :class="[inputClass(errors.message), 'py-2.5 leading-relaxed']"
              :aria-invalid="!!errors.message"
              :aria-describedby="errors.message ? 'message-error' : undefined"
              required
              @blur="validate('message')"
            ></textarea>
            <p v-if="errors.message" id="message-error" class="mt-2 text-danger">{{ errors.message }}</p>
          </div>
        </div>

        <p class="mt-7 text-sm leading-relaxed text-muted">{{ CONTACT.privacy }}</p>
        <button type="submit" class="btn btn-primary mt-3 w-full text-lg disabled:cursor-wait disabled:opacity-70" :disabled="sending">
          {{ sending ? '送出中…' : '送出問題' }}
        </button>
      </form>
    </template>
  </div>
</template>
