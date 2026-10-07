<script setup>
// 假資料：示範怎麼從假 API 取得資料並顯示（資料在 src/mocks/）
import { onMounted, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, formatFullDate } from '@/lib/date'
import {
  MOCK_TODAY,
  getAnnouncements,
  getCases,
  getCommitteeMembers,
  getContracts,
  getCurrentUser,
  getEquipmentList,
  getLegalDocuments,
  getMeetings,
  getMyReports,
  getMyTodos,
  getNotifications,
  getProposals,
  getQuickSaves,
  getResidentOpinions,
  getStaffMembers,
  getTasks,
  getVendors,
} from '@/mocks/api'
import { ANNOUNCEMENT_TYPES } from '@/mocks/data/announcements'
import { CONTRACT_STATUSES } from '@/mocks/data/contracts'
import { LEGAL_DOCUMENT_STATUSES } from '@/mocks/data/documents'
import { EQUIPMENT_DISPLAY_STATUSES } from '@/mocks/data/equipment'
import { PROPOSAL_STATUSES } from '@/mocks/data/proposals'
import { TASK_DISPLAY_STATUSES } from '@/mocks/data/tasks'
import { VENDOR_STATUSES } from '@/mocks/data/vendors'

// 畫面要用的資料，一開始都是空的
const loading = ref(true)
const currentUsers = ref([])
const committee = ref([])
const staff = ref([])
const vendors = ref([])
const contracts = ref([])
const equipment = ref([])
const cases = ref([])
const myReports = ref([])
const tasks = ref([])
const announcements = ref([])
const notifications = ref([])
const quickSaves = ref([])
const committeeTodos = ref({ items: [], counts: {}, total: 0 })
const staffTodos = ref({ items: [], counts: {}, total: 0 })
const proposals = ref([])
const opinions = ref([])
const meetings = ref([])
const legalDocuments = ref([])

// async / await：等資料回來再繼續往下執行
async function loadData() {
  loading.value = true
  // Promise.all：多個請求同時送出，全部回來後一起拿結果（比一個一個等快）
  const [resident, committeeUser, staffUser, committeeList, staffList, vendorList, contractList, equipmentList] =
    await Promise.all([
      getCurrentUser('resident'),
      getCurrentUser('committee'),
      getCurrentUser('staff'),
      getCommitteeMembers(),
      getStaffMembers(),
      getVendors(),
      getContracts('committee'),
      getEquipmentList('committee'),
    ])
  currentUsers.value = [resident, committeeUser, staffUser]
  committee.value = committeeList
  staff.value = staffList
  vendors.value = vendorList
  contracts.value = contractList
  equipment.value = equipmentList

  // 第二批：需要先知道「是誰」才能查的資料，所以放在取得使用者之後
  const [caseList, reportList, taskList, announcementList, notificationList, quickSaveList] =
    await Promise.all([
      getCases(), // 管理端：未結案的案件
      getMyReports(resident.id, 'active'), // 住戶端：我進行中的通報
      getTasks(), // 未結案的交辦
      getAnnouncements(resident.id), // 住戶看得到的公告
      getNotifications(resident.id, 'resident'), // 住戶身分的通知
      getQuickSaves(staffUser.id, true), // 管理人員還沒補齊的留存
    ])
  cases.value = caseList
  myReports.value = reportList
  tasks.value = taskList
  announcements.value = announcementList
  notifications.value = notificationList
  quickSaves.value = quickSaveList

  // 第三批：會議、提案、文件，以及彙整出來的待辦與住戶意見
  const [committeeTodoResult, staffTodoResult, proposalList, opinionList, meetingList, documentList] =
    await Promise.all([
      getMyTodos(committeeUser.id, 'committee'), // 李委員的待辦
      getMyTodos(staffUser.id, 'staff'), // 張管理員的待辦
      getProposals(committeeUser.id), // 提案（會標出李委員簽了沒）
      getResidentOpinions(true), // 還沒回覆的住戶意見
      getMeetings('resident', resident.id), // 住戶看得到的會議
      getLegalDocuments(), // 法定文件
    ])
  committeeTodos.value = committeeTodoResult
  staffTodos.value = staffTodoResult
  proposals.value = proposalList
  opinions.value = opinionList
  meetings.value = meetingList
  legalDocuments.value = documentList
  loading.value = false
}

// onMounted：元件顯示到畫面上之後，自動執行一次
onMounted(loadData)

// 把「距離幾天」轉成文字：7 → 「7 天後」，-11 → 「逾期 11 天」
function daysText(days) {
  if (days === null) return '不需定期保養'
  if (days < 0) return `逾期 ${-days} 天`
  if (days === 0) return '今天'
  return `${days} 天後`
}

// 待辦的到期說明：「7 天後到期」「今天到期」「逾期 3 天」「沒有期限」
function dueText(item) {
  if (!item.dueAt) return '沒有期限'
  if (item.daysLeft < 0) return daysText(item.daysLeft)
  return `${daysText(item.daysLeft)}到期`
}
</script>

<template>
  <section id="mock" class="scroll-mt-40 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold">假資料</h2>
        <p class="text-xs text-muted-foreground">假裝今天是 {{ formatFullDate(MOCK_TODAY) }}</p>
      </div>
      <Button size="sm" variant="outline" @click="loadData">重新載入</Button>
    </div>

    <!-- 載入中：顯示灰色佔位框 -->
    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-5 w-1/2" />
      <Skeleton class="h-20 w-full" />
      <Skeleton class="h-20 w-full" />
    </div>

    <!-- 載入完成 -->
    <template v-else>
      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">三端目前登入的人 getCurrentUser()</h3>
        <div v-for="user in currentUsers" :key="user.currentRole" class="rounded-lg border bg-card p-3">
          <p class="type-body-strong">{{ user.displayName }}</p>
          <p class="type-date text-muted-foreground">{{ user.currentRole }}・{{ user.titleLabel }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">委員與管理人員</h3>
        <div class="flex flex-wrap gap-2">
          <Badge v-for="member in committee" :key="member.id" variant="secondary">{{ member.shortName }}</Badge>
          <Badge v-for="member in staff" :key="member.id" variant="outline">
            {{ member.titleLabel }} {{ member.displayName }}
          </Badge>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">廠商 getVendors()：{{ vendors.length }} 家</h3>
        <div class="flex flex-wrap gap-2">
          <!-- 用 status 當 key，到 VENDOR_STATUSES 查出要顯示的文字 -->
          <Badge v-for="vendor in vendors" :key="vendor.id" variant="outline">
            {{ vendor.name }}・{{ VENDOR_STATUSES[vendor.status].label }}
          </Badge>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">合約 getContracts()：{{ contracts.length }} 份</h3>
        <div v-for="contract in contracts" :key="contract.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ contract.vendorName }}</p>
            <Badge variant="secondary" class="shrink-0">{{ CONTRACT_STATUSES[contract.status].label }}</Badge>
          </div>
          <p class="type-date text-text-secondary">
            {{ formatFullDate(contract.startDate) }} ～ {{ formatFullDate(contract.endDate) }}
          </p>
          <!-- toLocaleString()：把 92000 顯示成 92,000 -->
          <p class="type-date text-muted-foreground">
            {{ contract.amount.toLocaleString() }} 元／年・{{ daysText(contract.daysLeft) }}到期
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">設備 getEquipmentList()：{{ equipment.length }} 項</h3>
        <div v-for="item in equipment" :key="item.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ item.name }}</p>
            <Badge variant="secondary" class="shrink-0">
              {{ EQUIPMENT_DISPLAY_STATUSES[item.displayStatus].label }}
            </Badge>
          </div>
          <p class="type-date text-text-secondary">{{ item.place }}｜廠商：{{ item.vendorName || '無' }}</p>
          <p class="type-date text-muted-foreground">下次保養：{{ daysText(item.daysToMaintenance) }}</p>
        </div>
      </div>

      <!-- ── 第二批：案件、交辦、公告、通知、留存 ── -->

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          案件（管理端）getCases()：未結案 {{ cases.length }} 件
        </h3>
        <div v-for="item in cases" :key="item.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ item.title }}</p>
            <Badge variant="secondary" class="shrink-0">{{ item.statusLabel }}</Badge>
          </div>
          <p class="type-date text-text-secondary">
            {{ item.areaName }}・{{ item.categoryLabel }}
            <span v-if="item.isPrivate">・私密案件</span>
            <span v-if="item.isOverdue" class="text-destructive">・逾期 {{ item.overdueDays }} 天</span>
          </p>
          <p class="type-date text-muted-foreground">
            負責：{{ item.assigneeLabel || '尚未指派' }}｜{{ item.vendorName || '尚未派廠商' }}
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          我的通報（住戶端）getMyReports()：進行中 {{ myReports.length }} 件
        </h3>
        <p class="text-xs text-muted-foreground">和上面是同一份資料，但標題、狀態、說明都是給住戶看的版本</p>
        <div v-for="report in myReports" :key="report.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ report.displayTitle }}</p>
            <Badge variant="secondary" class="shrink-0">{{ report.statusLabel }}</Badge>
          </div>
          <p class="type-date text-text-secondary">{{ report.latestReply.text }}</p>
          <p class="type-date text-muted-foreground">更新於 {{ formatDateTime(report.updatedAt) }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">交辦 getTasks()：未結案 {{ tasks.length }} 項</h3>
        <div v-for="task in tasks" :key="task.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ task.title }}</p>
            <Badge variant="secondary" class="shrink-0">
              {{ TASK_DISPLAY_STATUSES[task.displayStatus].label }}
            </Badge>
          </div>
          <p class="type-date text-text-secondary">{{ task.assignerLabel }} → {{ task.assigneeLabel }}</p>
          <p class="type-date text-muted-foreground">
            #{{ task.id }}・期限 {{ formatDateTime(task.deadline) }}
            <span v-if="task.caseTitle">・關聯：{{ task.caseTitle }}</span>
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          公告（住戶端）getAnnouncements()：{{ announcements.length }} 則
        </h3>
        <div v-for="item in announcements" :key="item.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ item.title }}</p>
            <Badge variant="outline" class="shrink-0">{{ ANNOUNCEMENT_TYPES[item.type].label }}</Badge>
          </div>
          <p class="type-date text-muted-foreground">
            {{ formatDateTime(item.startAt) }} 起・{{ item.scopeLabel }}
            <span v-if="item.relatedToMe">・與我有關</span>
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          通知（住戶身分）getNotifications()：{{ notifications.length }} 則
        </h3>
        <div v-for="item in notifications" :key="item.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ item.title }}</p>
            <span class="shrink-0 type-date text-muted-foreground">{{ item.timeText }}</span>
          </div>
          <p class="type-date text-text-secondary">{{ item.body }}</p>
          <p v-if="!item.read" class="type-date text-primary">未讀</p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          留存（張管理員待補）getQuickSaves()：{{ quickSaves.length }} 筆
        </h3>
        <div v-for="item in quickSaves" :key="item.id" class="rounded-lg border bg-card p-3">
          <p class="type-body-strong">{{ item.name || '（未命名）' }}</p>
          <p class="type-date text-text-secondary">{{ item.note }}</p>
          <p class="type-date text-muted-foreground">留存於 {{ formatDateTime(item.savedAt) }}</p>
        </div>
      </div>

      <!-- ── 第三批：待辦、提案、住戶意見、會議、文件 ── -->

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          我的待辦（李委員）getMyTodos()：{{ committeeTodos.total }} 件
        </h3>
        <p class="text-xs text-muted-foreground">不另外存資料，從交辦、案件、提案、合約、文件、留存彙整而來</p>
        <div v-for="item in committeeTodos.items" :key="item.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ item.title }}</p>
            <Badge variant="outline" class="shrink-0">{{ item.kindLabel }}</Badge>
          </div>
          <p class="type-date text-text-secondary">{{ item.hint }}</p>
          <p class="type-date" :class="item.daysLeft < 0 ? 'text-destructive' : 'text-muted-foreground'">
            {{ dueText(item) }}
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          我的待辦（張管理員）getMyTodos()：{{ staffTodos.total }} 件
        </h3>
        <div v-for="item in staffTodos.items" :key="item.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ item.title }}</p>
            <Badge variant="outline" class="shrink-0">{{ item.kindLabel }}</Badge>
          </div>
          <p class="type-date text-text-secondary">{{ item.hint }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">提案 getProposals()：{{ proposals.length }} 件</h3>
        <div v-for="proposal in proposals" :key="proposal.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ proposal.title }}</p>
            <Badge variant="secondary" class="shrink-0">{{ PROPOSAL_STATUSES[proposal.status].label }}</Badge>
          </div>
          <p class="type-date text-text-secondary">
            {{ proposal.proposerLabel }}・已簽 {{ proposal.signedCount }}/{{ proposal.totalCount }}
          </p>
          <p class="type-date" :class="proposal.needsMySign ? 'text-destructive' : 'text-muted-foreground'">
            {{ proposal.needsMySign ? '等我簽核' : proposal.mySignature ? '我已簽核' : '已結束' }}
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          住戶意見（待回覆）getResidentOpinions()：{{ opinions.length }} 則
        </h3>
        <div v-for="item in opinions" :key="item.id" class="rounded-lg border bg-card p-3">
          <p class="type-body-strong">{{ item.text }}</p>
          <p class="type-date text-text-secondary">{{ item.authorLabel }}・{{ formatDateTime(item.at) }}</p>
          <p class="type-date text-muted-foreground">{{ item.meetingTitle }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          會議（住戶端）getMeetings()：{{ meetings.length }} 場
        </h3>
        <div v-for="meeting in meetings" :key="meeting.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ meeting.title }}</p>
            <Badge variant="outline" class="shrink-0">{{ meeting.typeLabel }}</Badge>
          </div>
          <p class="type-date text-text-secondary">{{ meeting.summary }}</p>
          <p class="type-date text-muted-foreground">
            {{ formatFullDate(meeting.heldAt) }} 召開・決議 {{ meeting.resolutionCount }} 條
            <span v-if="meeting.myComments.length">・我的留言 {{ meeting.myComments.length }} 則</span>
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium text-muted-foreground">
          法定文件 getLegalDocuments()：{{ legalDocuments.length }} 項
        </h3>
        <div v-for="doc in legalDocuments" :key="doc.id" class="rounded-lg border bg-card p-3">
          <div class="flex items-start justify-between gap-2">
            <p class="type-body-strong">{{ doc.name }}</p>
            <Badge variant="secondary" class="shrink-0">{{ LEGAL_DOCUMENT_STATUSES[doc.status].label }}</Badge>
          </div>
          <p class="type-date text-muted-foreground">
            {{ doc.typeLabel }}・效期至 {{ formatFullDate(doc.expiresAt) }}
            <span v-if="doc.isPublic">・公開給住戶</span>
          </p>
        </div>
      </div>
    </template>
  </section>
</template>
