// 管委會端的頁面清單
// 做好一個新畫面時，只要改這個檔案：匯入畫面，加進 views
// 寫法可以參考住戶端的 resident.js
import AnnouncementDetailView from '@/views/committee/AnnouncementDetailView.vue'
import HomeView from '@/views/committee/HomeView.vue'
import ProposalsView from '@/views/committee/ProposalsView.vue'
import TaskDetailView from '@/views/committee/TaskDetailView.vue'
import TodosView from '@/views/committee/TodosView.vue'

export default {
  // 已經做好的畫面：「網址」對應「畫面」
  // 網址只寫 /committee/ 後面那一段，例如 'home'、'cases/:id'
  // 沒列在這裡的頁面，會先顯示佔位頁
  views: {
    home: HomeView,
    'announcements/:id': AnnouncementDetailView,
    todos: TodosView,
    proposals: ProposalsView,
    'tasks/:id': TaskDetailView,
  },

  // 內頁：從別的頁面點進去的頁面（底部分頁、通知、「＋」按鈕不用寫在這裡）
  // title 是還沒做好時，佔位頁上顯示的名稱
  innerPages: [
    { path: 'tasks', title: '交辦進度' },
    { path: 'proposals', title: '提案與簽核' },
    { path: 'proposals/new', title: '新增提案' },
    { path: 'todos', title: '我的待辦' },
    { path: 'opinions', title: '住戶意見' },
    { path: 'announcements', title: '公告與動態' },
    { path: 'meetings/:id', title: '會議詳情' },
    // 待辦點進去的詳情頁
    { path: 'cases/:id', title: '案件詳情' },
    { path: 'tasks/:id', title: '交辦詳情' },
    { path: 'proposals/:id', title: '提案詳情' },
    { path: 'announcements/:id', title: '公告詳情' },
    { path: 'contracts/:id', title: '合約詳情' },
    { path: 'documents/:id', title: '文件詳情' },
    { path: 'quick-saves/:id', title: '留存詳情' },
  ],
}
