// 住戶端的頁面清單
// 做好一個新畫面時，只要改這個檔案：匯入畫面，加進 views
import HomeView from '@/views/resident/HomeView.vue'

export default {
  // 已經做好的畫面：「網址」對應「畫面」
  // 網址只寫 /resident/ 後面那一段，例如 'home'、'reports/:id'
  // 沒列在這裡的頁面，會先顯示佔位頁
  views: {
    home: HomeView,
  },

  // 內頁：從別的頁面點進去的頁面（底部分頁、通知、「＋」按鈕不用寫在這裡）
  // title 是還沒做好時，佔位頁上顯示的名稱
  innerPages: [
    { path: 'reports', title: '我的通報' },
    { path: 'reports/:id', title: '通報詳情' },
    { path: 'announcements', title: '社區公告' },
    { path: 'meetings/:id', title: '會議紀錄' },
  ],
}
