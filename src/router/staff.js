// 管理人員端的頁面清單
// 做好一個新畫面時，只要改這個檔案：匯入畫面，加進 views
// 寫法可以參考住戶端的 resident.js
// 管理人員端沒畫的畫面沿用管委會的（Figma 管理人員區塊 1483:15338），直接用 views/committee/ 的頁面
import CaseCompleteView from '@/views/committee/CaseCompleteView.vue'
import CaseDetailView from '@/views/committee/CaseDetailView.vue'
import CasesView from '@/views/committee/CasesView.vue'
import TaskDetailView from '@/views/committee/TaskDetailView.vue'

export default {
  // 已經做好的畫面：「網址」對應「畫面」
  // 網址只寫 /staff/ 後面那一段，例如 'home'、'cases/:id'
  // 沒列在這裡的頁面，會先顯示佔位頁
  views: {
    // 和管委會端共用的頁面
    cases: CasesView,
    'cases/:id': CaseDetailView,
    'cases/:id/complete': CaseCompleteView,
    'tasks/:id': TaskDetailView,
  },

  // 內頁：從別的頁面點進去的頁面（底部分頁、通知、「＋」按鈕不用寫在這裡）
  // title 是還沒做好時，佔位頁上顯示的名稱
  innerPages: [
    { path: 'cases/:id', title: '案件詳情' },
    { path: 'cases/:id/complete', title: '回報完成' }, // 案件詳情的「完工驗收」
    { path: 'tasks/:id', title: '交辦詳情' },
    // 全域新增選單（「＋」）的項目；管理人員不能交辦，所以沒有新增交辦
    { path: 'cases/new', title: '新增通報' },
    { path: 'announcements/new', title: '發布公告' },
    { path: 'files/upload', title: '上傳文件' },
    { path: 'quick-saves/new', title: '快速留存' },
  ],
}
