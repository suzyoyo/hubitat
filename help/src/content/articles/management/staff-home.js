import { homeTourOf } from '../../home-tour.js'

export default {
  id: 'staff-home',
  title: '認識管理人員首頁',
  description: '打開先看「我的待辦」：新的通報、交給你的工作都在這裡。',
  category: 'daily',
  applicableRoles: ['staff'],
  order: 2,
  keywords: ['首頁', '管理人員', '管理員', '總幹事', '入門'],
  published: true,
  sections: [
    {
      heading: '首頁有什麼',
      blocks: [
        // 輪播的資料和「認識 App 首頁」共用（content/home-tour.js），2026-10-19 從「截圖＋清單」改來
        { type: 'tour', slides: homeTourOf('staff') },
        // 輪播沒介紹到的，用一句話補上
        { type: 'p', text: '往下滑還有「公告與動態」，是社區最新的公告。' },
      ],
    },
    {
      heading: '底部的分頁',
      blocks: [
        {
          type: 'list',
          items: [
            '「案件」：住戶通報的所有問題。',
            '「廠商」：廠商的緊急聯絡電話、鑰匙放在哪裡。',
            '「社區」：社區的設備清冊。',
          ],
        },
      ],
    },
  ],
  relatedArticles: ['todos', 'case-accept', 'task-report', 'emergency-contacts'],
}
