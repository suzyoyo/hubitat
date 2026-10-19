import { homeTourOf } from '../../home-tour.js'

export default {
  id: 'committee-home',
  title: '認識管委會首頁',
  description: '每天打開先看這裡：要處理的事、交辦的工作、住戶的意見和公告。',
  category: 'daily',
  applicableRoles: ['committee'],
  order: 1,
  keywords: ['首頁', '管委會', '入門', '捷徑'],
  published: true,
  sections: [
    {
      heading: '首頁有什麼',
      blocks: [
        // 輪播的資料和「認識 App 首頁」共用（content/home-tour.js），2026-10-19 從「截圖＋清單」改來
        { type: 'tour', slides: homeTourOf('committee') },
        // 輪播沒介紹到的，用一句話補上
        { type: 'p', text: '往下滑還有「住戶意見」，是住戶在會議紀錄裡的留言；以及「公告與動態」，點一下就能看公告內容。' },
      ],
    },
    {
      heading: '右下角的「＋」',
      blocks: [
        { type: 'p', text: '按右下角的「＋」，可以快速新增通報；主委、副主委還可以新增交辦、發布公告。' },
        { type: 'image', screenshot: { file: 'committee-fab-menu.jpg', alt: '按「＋」後跳出的新增選單' } },
      ],
    },
    {
      // 只寫已經做好的功能（2026-10-19 加，參考管理人員首頁的寫法）
      heading: '底部的分頁',
      blocks: [
        {
          type: 'list',
          items: [
            '「案件」：住戶通報的所有問題。',
            '「廠商」：廠商的緊急聯絡電話、鑰匙放在哪裡，還有廠商名冊。',
            '「社區」：廠商合約、設備清冊。',
            '「我的」：切換到住戶、查看緊急標示使用紀錄。',
          ],
        },
      ],
    },
  ],
  relatedArticles: ['todos', 'case-flow', 'tasks', 'switch-role'],
}
