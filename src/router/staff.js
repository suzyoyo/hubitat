// 管理人員端的頁面清單
// 做好一個新畫面時，只要改這個檔案：匯入畫面，加進 views
// 寫法可以參考住戶端的 resident.js
// 管理人員端沒畫的畫面沿用管委會的（Figma 管理人員區塊 1483:15338），直接用 views/committee/ 的頁面
import CaseCompleteView from '@/views/committee/CaseCompleteView.vue'
import CaseDetailView from '@/views/committee/CaseDetailView.vue'
import CasesView from '@/views/committee/CasesView.vue'
import EquipmentDetailView from '@/views/staff/EquipmentDetailView.vue'
import EquipmentListView from '@/views/staff/EquipmentListView.vue'
import QuickSaveDetailView from '@/views/committee/QuickSaveDetailView.vue'
import QuickSaveView from '@/views/committee/QuickSaveView.vue'
import TaskDetailView from '@/views/committee/TaskDetailView.vue'
import TaskReportView from '@/views/committee/TaskReportView.vue'
import FilesView from '@/views/staff/FilesView.vue'
import HomeView from '@/views/staff/HomeView.vue'
import MeView from '@/views/staff/MeView.vue'
import NotificationsView from '@/views/staff/NotificationsView.vue'
import TodosView from '@/views/staff/TodosView.vue'
import VendorsView from '@/views/staff/VendorsView.vue'

export default {
  // 已經做好的畫面：「網址」對應「畫面」
  // 網址只寫 /staff/ 後面那一段，例如 'home'、'cases/:id'
  // 沒列在這裡的頁面，會先顯示佔位頁
  views: {
    home: HomeView,
    // 底部分頁：寫法和管委會的一樣，網址換成 /staff（views/staff/）
    vendors: VendorsView,
    files: FilesView,
    me: MeView,
    notifications: NotificationsView, // 右上角的鈴鐺
    todos: TodosView, // 首頁的「查看全部待辦事項」
    // 社區分頁的「設備清冊」：內容和管委會的一樣，但連結只連管理人員端有的頁面，維修史沒有費用
    equipment: EquipmentListView,
    'equipment/:id': EquipmentDetailView,
    // 和管委會端共用的頁面
    cases: CasesView,
    'cases/:id': CaseDetailView,
    'cases/:id/complete': CaseCompleteView,
    'tasks/:id': TaskDetailView,
    'tasks/:id/report': TaskReportView, // 交辦詳情的「回報完成」（沒有關聯案件的交辦）
    'quick-saves/new': QuickSaveView, // 「＋」選單的「快速留存」
    'quick-saves/:id': QuickSaveDetailView, // 待辦「需補資料」的留存
  },

  // 內頁：從別的頁面點進去的頁面（底部分頁、通知、「＋」按鈕不用寫在這裡）
  // title 是還沒做好時，佔位頁上顯示的名稱
  innerPages: [
    // 首頁點進去的頁面
    { path: 'todos', title: '我的待辦' },
    { path: 'announcements', title: '公告與動態' },
    { path: 'announcements/:id', title: '公告詳情' },
    { path: 'quick-saves/:id', title: '留存詳情' }, // 待辦裡「需補資料」的留存
    // 通知點進去的頁面（案件、交辦、公告詳情在別處已經列了）
    { path: 'contracts/:id', title: '合約詳情' },
    { path: 'meetings/:id', title: '會議紀錄' },
    { path: 'cases/:id', title: '案件詳情' },
    { path: 'cases/:id/complete', title: '回報完成' }, // 案件詳情的「完工驗收」
    { path: 'tasks/:id', title: '交辦詳情' },
    { path: 'tasks/:id/report', title: '回報完成' },
    // 「廠商」分頁點進去的頁面
    { path: 'vendors/list', title: '廠商名冊' },
    // 「社區」分頁點進去的頁面
    { path: 'search', title: '搜尋' },
    { path: 'meetings', title: '會議紀錄' },
    { path: 'resolutions', title: '決議事項' },
    { path: 'bylaws', title: '規約' },
    { path: 'rules', title: '社區規則與慣例' },
    { path: 'documents', title: '法定文件' },
    { path: 'contracts', title: '廠商合約' },
    { path: 'equipment', title: '設備清冊' },
    { path: 'equipment/:id', title: '設備詳情' },
    { path: 'timeline', title: '社區時間軸' },
    // 「我的」頁點進去的頁面
    { path: 'me/profile', title: '個人資料' },
    { path: 'me/notifications', title: '通知設定' },
    { path: 'me/help', title: '使用說明' },
    { path: 'me/account', title: '帳號與安全' },
    // 全域新增選單（「＋」）的項目；管理人員不能交辦，所以沒有新增交辦
    { path: 'cases/new', title: '新增通報' },
    { path: 'announcements/new', title: '發布公告' },
    { path: 'files/upload', title: '上傳文件' },
    { path: 'quick-saves/new', title: '快速留存' },
  ],
}
