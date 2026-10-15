// 管委會端的頁面清單
// 做好一個新畫面時，只要改這個檔案：匯入畫面，加進 views
// 寫法可以參考住戶端的 resident.js
import AnnouncementDetailView from '@/views/committee/AnnouncementDetailView.vue'
import AnnouncementFormView from '@/views/committee/AnnouncementFormView.vue'
import CaseCompleteView from '@/views/committee/CaseCompleteView.vue'
import CaseDetailView from '@/views/committee/CaseDetailView.vue'
import CasesView from '@/views/committee/CasesView.vue'
import FilesView from '@/views/committee/FilesView.vue'
import HomeView from '@/views/committee/HomeView.vue'
import MeView from '@/views/committee/MeView.vue'
import NewRepairView from '@/views/committee/NewRepairView.vue'
import NewTaskView from '@/views/committee/NewTaskView.vue'
import NotificationsView from '@/views/committee/NotificationsView.vue'
import ProposalsView from '@/views/committee/ProposalsView.vue'
import TaskDetailView from '@/views/committee/TaskDetailView.vue'
import TasksView from '@/views/committee/TasksView.vue'
import TodosView from '@/views/committee/TodosView.vue'
import UrgentLogView from '@/views/committee/UrgentLogView.vue'
import VendorDetailView from '@/views/committee/VendorDetailView.vue'
import VendorListView from '@/views/committee/VendorListView.vue'
import VendorsView from '@/views/committee/VendorsView.vue'

export default {
  // 已經做好的畫面：「網址」對應「畫面」
  // 網址只寫 /committee/ 後面那一段，例如 'home'、'cases/:id'
  // 沒列在這裡的頁面，會先顯示佔位頁
  views: {
    home: HomeView,
    me: MeView,
    notifications: NotificationsView,
    cases: CasesView,
    files: FilesView,
    vendors: VendorsView,
    'vendors/list': VendorListView,
    'vendors/:id': VendorDetailView,
    'cases/:id': CaseDetailView,
    'cases/:id/complete': CaseCompleteView,
    'announcements/:id': AnnouncementDetailView,
    // 發布和修改是同一個表單
    'announcements/new': AnnouncementFormView,
    'announcements/:id/edit': AnnouncementFormView,
    todos: TodosView,
    tasks: TasksView,
    proposals: ProposalsView,
    'tasks/new': NewTaskView,
    'tasks/:id': TaskDetailView,
    'cases/new': NewRepairView,
    'me/urgent-log': UrgentLogView,
  },

  // 內頁：從別的頁面點進去的頁面（底部分頁、通知、「＋」按鈕不用寫在這裡）
  // title 是還沒做好時，佔位頁上顯示的名稱
  innerPages: [
    { path: 'tasks', title: '交辦進度' },
    { path: 'tasks/new', title: '新增交辦' },
    { path: 'proposals', title: '提案與簽核' },
    { path: 'proposals/new', title: '新增提案' },
    { path: 'todos', title: '我的待辦' },
    { path: 'opinions', title: '住戶意見' },
    { path: 'announcements', title: '公告與動態' },
    { path: 'meetings/:id', title: '會議詳情' },
    // 待辦點進去的詳情頁
    { path: 'cases/:id', title: '案件詳情' },
    { path: 'cases/:id/complete', title: '回報完成' }, // 案件詳情的「完工驗收」
    { path: 'cases/:id/close', title: '結案' }, // 案件詳情的「結案」（013 做）
    { path: 'vendors/list', title: '廠商名冊' },
    { path: 'vendors/new', title: '新增廠商' },
    { path: 'vendors/:id', title: '廠商詳細' },
    { path: 'equipment/:id', title: '設備詳情' },
    { path: 'tasks/:id', title: '交辦詳情' },
    { path: 'proposals/:id', title: '提案詳情' },
    { path: 'announcements/:id', title: '公告詳情' },
    { path: 'announcements/new', title: '發布公告' },
    { path: 'announcements/:id/edit', title: '修改公告' },
    { path: 'contracts/:id', title: '合約詳情' },
    { path: 'documents/:id', title: '文件詳情' },
    { path: 'quick-saves/:id', title: '留存詳情' },
    // 全域新增選單（「＋」）的項目，新增交辦 tasks/new、發布公告 announcements/new 在上面
    { path: 'cases/new', title: '新增通報' },
    { path: 'files/upload', title: '上傳文件' },
    { path: 'quick-saves/new', title: '快速留存' },
    // 「我的」頁點進去的頁面
    { path: 'me/profile', title: '個人資料' },
    { path: 'me/handover', title: '換屆交接' },
    { path: 'me/settings', title: '社區設定' },
    { path: 'me/urgent-log', title: '緊急標示使用紀錄' },
    { path: 'me/notifications', title: '通知設定' },
    { path: 'me/help', title: '使用說明' },
    { path: 'me/account', title: '帳號與安全' },
    // 「社區」分頁點進去的頁面
    { path: 'search', title: '搜尋' },
    { path: 'meetings', title: '會議紀錄' },
    { path: 'resolutions', title: '決議事項' },
    { path: 'bylaws', title: '規約' },
    { path: 'rules', title: '社區規則與慣例' },
    { path: 'documents', title: '法定文件' },
    { path: 'contracts', title: '廠商合約' },
    { path: 'equipment', title: '設備清冊' },
    { path: 'timeline', title: '社區時間軸' },
  ],
}
