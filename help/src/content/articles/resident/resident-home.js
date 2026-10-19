import { homeTourOf } from '../../home-tour.js'

export default {
  id: 'resident-home',
  title: '認識住戶首頁',
  description: '打開 App 第一眼看到的地方：你的通報、社區公告、最新的會議。',
  category: 'report',
  applicableRoles: ['resident'],
  order: 1,
  keywords: ['首頁', '住戶', '入門', '畫面'],
  published: true,
  sections: [
    {
      heading: '首頁有什麼',
      blocks: [
        // 輪播的資料和「認識 App 首頁」共用（content/home-tour.js），2026-10-19 從「截圖＋清單」改來
        { type: 'tour', slides: homeTourOf('resident') },
        // 輪播沒介紹到的，用一句話補上（「發現問題時」那一段和輪播的通報那張重複，拿掉了）
        { type: 'p', text: '「我的通報」會列出你還在處理中的通報；往下滑還有「會議紀錄」，是管委會最近一次開會的紀錄。' },
      ],
    },
    {
      // 只寫已經做好的功能（2026-10-19 加，參考管理人員首頁的寫法）
      heading: '底部的分頁',
      blocks: [
        {
          type: 'list',
          items: [
            '「社區」：社區設備的維修紀錄。',
            '「我的」：看你的留言、加入管委會。同時是委員的人，也在這裡切換到管委會。',
          ],
        },
      ],
    },
  ],
  relatedArticles: ['new-report', 'my-reports', 'announcements', 'app-screen'],
}
