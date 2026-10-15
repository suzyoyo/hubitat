// 住戶端的頁面清單
// 做好一個新畫面時，只要改這個檔案：匯入畫面，加進 views
import AnnouncementsView from '@/views/resident/AnnouncementsView.vue'
import FilesView from '@/views/resident/FilesView.vue'
import HomeView from '@/views/resident/HomeView.vue'
import JoinCommitteeView from '@/views/resident/JoinCommitteeView.vue'
import MeetingDetailView from '@/views/resident/MeetingDetailView.vue'
import MeView from '@/views/resident/MeView.vue'
import MyCommentsView from '@/views/resident/MyCommentsView.vue'
import NewReportView from '@/views/resident/NewReportView.vue'
import NotificationsView from '@/views/resident/NotificationsView.vue'
import ReportDetailView from '@/views/resident/ReportDetailView.vue'
import ReportsView from '@/views/resident/ReportsView.vue'

export default {
  // 已經做好的畫面：「網址」對應「畫面」
  // 網址只寫 /resident/ 後面那一段，例如 'home'、'reports/:id'
  // 沒列在這裡的頁面，會先顯示佔位頁
  views: {
    home: HomeView,
    files: FilesView, // 底部分頁「社區」
    me: MeView,
    'me/join': JoinCommitteeView, // 「我的」頁的「加入管委會」
    'me/comments': MyCommentsView, // 會議紀錄留言送出後的「查看我的留言」
    'meetings/:id': MeetingDetailView,
    reports: ReportsView,
    'reports/:id': ReportDetailView,
    announcements: AnnouncementsView,
    notifications: NotificationsView, // 右上角的鈴鐺
    'reports/new': NewReportView, // 右下角「通報」按鈕（網址定在 src/config/roles.js 的 fab）
  },

  // 內頁：從別的頁面點進去的頁面（底部分頁、通知、「＋」按鈕不用寫在這裡）
  // title 是還沒做好時，佔位頁上顯示的名稱
  innerPages: [
    { path: 'reports', title: '我的通報' },
    { path: 'reports/:id', title: '通報詳情' },
    { path: 'announcements', title: '社區公告' },
    { path: 'meetings/:id', title: '會議紀錄' },
    // 「社區」分頁連出去的頁面
    { path: 'meetings', title: '管委會報告' },
    { path: 'timeline', title: '社區時間軸' },
    { path: 'bylaws', title: '社區規約' },
    { path: 'documents', title: '公開文件' },
    { path: 'equipment', title: '設備與維修史' },
    { path: 'search', title: '搜尋' },
    // 「我的」頁連出去的頁面
    { path: 'me/profile', title: '個人資料' },
    { path: 'me/notifications', title: '通知設定' },
    { path: 'me/help', title: '使用說明' },
    { path: 'me/account', title: '帳號與安全' },
    { path: 'me/join', title: '加入管委會' },
    { path: 'me/comments', title: '我的留言' }, // 會議紀錄留言送出後的「查看我的留言」
  ],
}
