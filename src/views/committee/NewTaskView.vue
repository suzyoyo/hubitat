<script setup>
// 管委會端・新增交辦（設計稿：已帶入案件 1134:13996、選擇交辦對象 1134:14144）
// 主要從案件詳情的「交辦」進來，網址帶案件編號（/committee/tasks/new?caseId=CASE-…），這時關聯案件鎖定不能改
// 從「＋」選單進來的：關聯案件用下拉選單自己選（選填，2026-10-16），列出還沒交辦、可以交辦的案件（已受理、處理中）
// 只有主委、副主委可以交辦；同一件案件還有沒完成的交辦時不能再交辦（假 API createTask 會擋）
// 交辦對象只有管理人員（2026-10-15 013 決定）；交辦內容、完成期限選填
// 寫法參考案件詳情頁（CaseDetailView）：送出中按鈕先不能按、成功失敗用 toast 提示
import { LockIcon, SearchIcon, XIcon } from '@lucide/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import LeaveConfirmDialog from '@/components/feedback/LeaveConfirmDialog.vue'
import BottomCta from '@/components/app/BottomCta.vue'
import DatePicker from '@/components/common/DatePicker.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  canAssignTasks,
  createTask,
  getCaseById,
  getCases,
  getCurrentUser,
  getStaffMembers,
  MOCK_TODAY,
} from '@/mocks/api'
import mascotUrl from '@/assets/mascot/searching.png' // 拿著放大鏡的好彼管家

const route = useRoute()
const router = useRouter()

const CONTENT_MAX = 200 // 交辦內容最多幾個字（和假資料的說明一樣）
const DEADLINE_TIME = '18:00' // 完成期限只選日期，時間固定是當天 18:00（和假資料的交辦一樣）
// 選好交辦對象後，下面那行灰字（設計稿）
const STAFF_DUTY = '負責事項：現場確認、聯繫廠商、回報處理進度'

const loading = ref(true)
const userId = ref('')
const canAssign = ref(false) // 我能不能交辦（主委、副主委）
const relatedCase = ref(null) // 從案件進來時的那件案件；沒有就是 null
const members = ref([]) // 可以交辦的人：管理人員
const NONE = 'none' // 下拉選單「不關聯」的值（選單的值不能是空字串）
const openCases = ref([]) // 下拉選單可以選的案件
const pickedCaseId = ref(NONE) // 下拉選單選了哪一件

onMounted(async () => {
  const user = await getCurrentUser('committee')
  userId.value = user.id
  canAssign.value = canAssignTasks(user.id)
  const caseId = route.query.caseId
  const [caseData, staff, caseList] = await Promise.all([
    caseId ? getCaseById(caseId) : null,
    getStaffMembers(),
    getCases(),
  ])
  relatedCase.value = caseData ?? null
  members.value = staff
  // 可以交辦的案件：和案件詳情的「交辦」按鈕同一個規則（已受理、處理中，還沒有沒完成的交辦）
  openCases.value = caseList.filter((item) => ['accepted', 'in_progress'].includes(item.status) && !item.openTaskId)
  loading.value = false
  initialForm.value = JSON.stringify(form) // 記下剛載入時的樣子，之後比較有沒有改過
})

// 從案件進來，但這件案件不能交辦：找不到、已經結案或取消、還有沒完成的交辦
const caseProblem = computed(() => {
  if (!route.query.caseId) return ''
  const data = relatedCase.value
  if (!data) return '找不到這件案件'
  if (!data.isOpen) return '這件案件已經結案，不能再交辦'
  if (data.openTaskId) return `這件案件已經交辦了（${data.openTaskId}），對方完成或撤回後才能再交辦`
  return ''
})

// 這次交辦關聯的案件：從案件進來的是鎖定的那件，不然是下拉選單選的那件
const linkedCase = computed(
  () => relatedCase.value ?? openCases.value.find((item) => item.id === pickedCaseId.value) ?? null,
)

// ── 表單 ─────────────────────────────────────
const form = reactive({
  title: '',
  content: '',
  assigneeId: '',
  deadline: '', // '2026-10-08'（只有日期）；選填
})

// 交辦對象：搜尋框打的字，和選好的人
const query = ref('')
const assignee = computed(() => members.value.find((member) => member.id === form.assigneeId))
// 名字或職稱有包含打的字的人；沒打字就全部列出來
const matches = computed(() => {
  const text = query.value.trim()
  return members.value.filter((member) => member.displayName.includes(text) || member.titleLabel.includes(text))
})

function pickAssignee(member) {
  form.assigneeId = member.id
  query.value = ''
}

// 按過一次送出才顯示錯誤，不然一打開就滿滿紅字（寫法和發布公告一樣）
const submitted = ref(false)
const errors = computed(() => {
  const result = {}
  if (!form.title.trim()) result.title = '請填寫交辦標題'
  if (!form.assigneeId) result.assignee = '請選擇交辦對象'
  return result
})
const shownErrors = computed(() => (submitted.value ? errors.value : {}))

// ── 送出 ─────────────────────────────────────
const pending = ref(false) // 送出還在路上

async function submit() {
  submitted.value = true
  if (Object.keys(errors.value).length) return
  pending.value = true
  const task = await createTask(userId.value, {
    title: form.title.trim(),
    content: form.content.trim(),
    assigneeId: form.assigneeId,
    deadline: form.deadline ? `${form.deadline}T${DEADLINE_TIME}` : '',
    caseId: linkedCase.value?.id,
  })
  pending.value = false
  if (!task) {
    toast.error('沒有交辦成功', { description: '這件案件可能已經交辦了，請重新整理後再試一次' })
    return
  }
  saved.value = true // 送出成功，換頁時不用再問
  toast.success('已交辦', { description: `已通知${task.assigneeLabel}` })
  // 從案件來的回到案件詳情（看得到「交辦」那一筆紀錄），其他的到這件交辦的詳情（下拉選了案件的也是）
  router.replace(relatedCase.value ? `/committee/cases/${relatedCase.value.id}` : `/committee/tasks/${task.id}`)
}

// 取消：回到上一頁；直接打網址進來的沒有上一頁，就回管委會首頁
function cancel() {
  if (window.history.state?.back) router.back()
  else router.replace('/committee/home')
}

// 有沒有填東西（離開前確認用）：和剛載入時的表單比，有改過就算；送出成功後 saved 變 true，換頁不用再問
const initialForm = ref('')
const saved = ref(false)
const isDirty = computed(() => !saved.value && initialForm.value !== '' && JSON.stringify(form) !== initialForm.value)
</script>

<template>
  <!-- 底部有兩顆上下排的按鈕，pb-40 留空間給它 -->
  <div class="px-5 pt-4 pb-40">
    <div v-if="loading" class="space-y-6">
      <Skeleton v-for="n in 4" :key="n" class="h-[72px] rounded-xl" />
    </div>

    <!-- 不能交辦：不是主委、副主委，或這件案件不能交辦 -->
    <Empty v-else-if="!canAssign || caseProblem" class="gap-1 pt-10">
      <EmptyMedia>
        <!-- alt 留空：圖片只是裝飾，螢幕閱讀器會跳過 -->
        <img :src="mascotUrl" alt="" width="233" height="229" class="h-[120px] w-auto" />
      </EmptyMedia>
      <EmptyTitle class="type-greeting">{{ canAssign ? '沒辦法交辦' : '只有主委、副主委可以交辦' }}</EmptyTitle>
      <EmptyDescription v-if="caseProblem" class="type-body">{{ caseProblem }}</EmptyDescription>
      <Button variant="outline" class="mt-4" @click="cancel">回上一頁</Button>
    </Empty>

    <!-- novalidate：不用瀏覽器內建的檢查，錯誤訊息自己顯示 -->
    <form v-else class="space-y-6" novalidate @submit.prevent="submit">
      <!-- 關聯案件：從案件進來的才有，鎖定不能改 -->
      <div v-if="relatedCase" class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <p class="text-base font-medium text-foreground">關聯案件或決議</p>
          <Badge variant="outline">已鎖定</Badge>
        </div>
        <div class="flex min-h-11 items-center gap-2 rounded-lg bg-muted px-3 py-2.5 text-muted-foreground">
          <LockIcon class="size-4 shrink-0" />
          <p class="min-w-0 flex-1 type-body">#{{ relatedCase.id }} {{ relatedCase.title }}</p>
        </div>
      </div>
      <!-- 從「＋」進來的：下拉選單自己選關聯案件（選填），寫法和發布公告的「關聯案件」一樣 -->
      <div v-else class="space-y-2">
        <Label for="task-case" class="text-base">
          關聯案件<span class="type-date text-muted-foreground">選填</span>
        </Label>
        <Select v-model="pickedCaseId">
          <!-- ui/select 本身寫了 data-[size=default]:h-8 和 text-sm，會蓋過 h-11、type-body（實際只有 32px、14px）：
               高度用 data-[size=default]:h-11、字用 type-body!（! 是「一定要用這個」）才蓋得過，寫法照 case/CaseCategoryPicker（2026-10-18） -->
          <SelectTrigger id="task-case" class="w-full bg-card type-body! data-[size=default]:h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="NONE" class="min-h-11 px-3 type-body!">不關聯</SelectItem>
            <SelectItem v-for="item in openCases" :key="item.id" :value="item.id" class="min-h-11 px-3 type-body!">
              {{ item.title }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p class="type-date text-muted-foreground">只列出還沒交辦、處理中的案件</p>
      </div>

      <div class="space-y-2">
        <Label for="task-title" class="text-base">交辦標題 <span class="text-warning-strong">*</span></Label>
        <Input
          id="task-title"
          v-model="form.title"
          :placeholder="linkedCase ? `例如：聯繫廠商處理${linkedCase.title}` : '例如：聯繫兩家廠商報價植栽'"
          maxlength="40"
          :aria-invalid="Boolean(shownErrors.title)"
        />
        <p v-if="shownErrors.title" class="type-date text-warning-strong">{{ shownErrors.title }}</p>
      </div>

      <div class="space-y-2">
        <Label for="task-content" class="text-base">
          交辦內容<span class="type-date text-muted-foreground">選填</span>
        </Label>
        <Textarea
          id="task-content"
          v-model="form.content"
          placeholder="例如：請聯繫兩家廠商，報價維修工程"
          :maxlength="CONTENT_MAX"
          class="min-h-[100px]"
        />
        <div class="flex gap-3">
          <p class="min-w-0 flex-1 type-date text-muted-foreground">請具體說明廠商評選條件或驗收標準</p>
          <p class="shrink-0 type-date text-muted-foreground">{{ form.content.length }} / {{ CONTENT_MAX }} 字</p>
        </div>
      </div>

      <!-- 交辦對象：選好之前是搜尋框＋名單，選好之後是一張卡片（右邊叉叉可以重選） -->
      <div class="space-y-2">
        <Label :for="assignee ? undefined : 'task-assignee'" class="text-base">
          交辦對象 <span class="text-warning-strong">*</span>
        </Label>
        <div v-if="assignee" class="flex items-center gap-3 rounded-xl border bg-card p-3">
          <!-- 頭像：姓氏的第一個字 -->
          <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted type-body-strong text-foreground">
            {{ assignee.surname }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="type-body-strong text-foreground">{{ assignee.displayName }}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="重新選擇交辦對象" @click="form.assigneeId = ''">
            <XIcon />
          </Button>
        </div>
        <template v-else>
          <div class="relative">
            <SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="task-assignee"
              v-model="query"
              placeholder="搜尋管理人員"
              autocomplete="off"
              class="pl-9"
              :aria-invalid="Boolean(shownErrors.assignee)"
            />
          </div>
          <!-- 名單：一列一個人，每列 44px 以上；太多時可以在框裡上下滑 -->
          <ul v-if="matches.length" role="listbox" aria-label="交辦對象" class="max-h-64 overflow-y-auto rounded-xl border bg-card">
            <li v-for="member in matches" :key="member.id" role="option" :aria-selected="false">
              <button type="button" class="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left" @click="pickAssignee(member)">
                <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted type-body-strong text-foreground">
                  {{ member.surname }}
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block type-body-strong text-foreground">{{ member.displayName }}</span>
                </span>
              </button>
            </li>
          </ul>
          <p v-else class="type-date text-muted-foreground">找不到符合的管理人員</p>
        </template>
        <p v-if="shownErrors.assignee" class="type-date text-warning-strong">{{ shownErrors.assignee }}</p>
        <p v-else-if="assignee" class="type-date text-muted-foreground">{{ STAFF_DUTY }}</p>
      </div>

      <div class="space-y-2">
        <!-- 選填的寫法照專案規則：灰色小字「選填」 -->
        <Label for="task-deadline" class="text-base">
          完成期限<span class="type-date text-muted-foreground">選填</span>
        </Label>
        <!-- 白底淺藍字，和「我的」的登出按鈕一樣（2026-10-19 013） -->
        <DatePicker
          id="task-deadline"
          v-model="form.deadline"
          placeholder="選擇完成期限"
          :min="MOCK_TODAY"
          variant="secondary"
          class="bg-card hover:bg-muted"
        />
      </div>

      <BottomCta vertical>
        <Button type="submit" :disabled="pending">確認新增</Button>
        <Button type="button" variant="outline" @click="cancel">取消</Button>
      </BottomCta>
    </form>
    <!-- 填到一半想離開時先問一次；新增交辦沒有「存成草稿」（2026-10-24 013 決定），只問直接離開或繼續填寫 -->
    <LeaveConfirmDialog :dirty="isDirty" />
  </div>
</template>
