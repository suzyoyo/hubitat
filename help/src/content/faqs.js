// 常見問題
//   group：放在常見問題頁的哪一組（見 FAQ_GROUPS）
//   roles：哪些身分會問（身分專區只列出這個身分的問題）
//   featured：true 的會出現在首頁（2026-10-19 從 2 題加到 6 題，三種身分都有；建議 6 題左右）
//   answer：答案，一段一個字串；用「」框起來的字會變色
//   article：（選填）答案下面加一個「看教學」連結，填文章 id
// 寫法：站在使用者的角度，用他們聽得懂的話回答；不寫系統怎麼運作、不寫字數上限這類細節
export const FAQ_GROUPS = [
  { id: 'general', title: '一般問題' },
  { id: 'resident', title: '住戶常見問題' },
  { id: 'management', title: '管委會與管理人員常見問題' },
  { id: 'trouble', title: '遇到狀況時', description: '按鈕按不下去、畫面跳出提醒時，先看這裡。' },
]

export const FAQS = [
  // ── 一般問題 ──
  {
    id: 'switch-role',
    group: 'general',
    roles: ['resident', 'committee'],
    featured: true,
    question: '我是住戶也是委員，要怎麼切換？',
    answer: ['到「我的」頁，住戶按「切換至管委會」，管委會按「切換至住戶」。'],
    article: 'switch-role',
  },
  {
    id: 'notification-dot',
    group: 'general',
    roles: ['resident', 'committee', 'staff'],
    featured: true,
    question: '右上角鈴鐺的紅點要怎麼消掉？',
    answer: ['點開通知看過，紅點就會消失。想一次全部清掉，在通知頁按「全部已讀」。'],
    article: 'notifications',
  },

  // ── 住戶 ──
  {
    id: 'public-or-private',
    group: 'resident',
    roles: ['resident'],
    featured: true,
    question: '公開通報和保密通報差在哪？別人會知道是我通報的嗎？',
    answer: [
      '公共設施的問題（例如設備故障、走道漏水）會公開，其他住戶也看得到。和鄰居有關的問題（例如噪音、違規停車）會保密，只有管委會和管理室看得到。',
      '不論哪一種，其他住戶都不會知道是你通報的。',
    ],
    article: 'report-type',
  },
  {
    id: 'when-notified',
    group: 'resident',
    roles: ['resident'],
    featured: true,
    question: '通報之後，我怎麼知道有沒有人處理？',
    answer: ['有人開始處理、以及處理完成時，你都會收到通知。也可以隨時到「我的通報」看進度。'],
    article: 'report-progress',
  },
  {
    id: 'cancel-report',
    group: 'resident',
    roles: ['resident'],
    featured: true,
    question: '通報送出後可以撤回嗎？',
    answer: ['不能撤回。如果問題已經好了，可以在通報裡補充說明一聲，管理室會說明原因後結案。'],
    article: 'report-edit',
  },
  {
    id: 'cannot-edit-title',
    group: 'resident',
    roles: ['resident'],
    question: '地點寫錯了，可以改嗎？',
    answer: ['送出後地點就不能改了。請在通報的「補充說明」寫清楚正確的位置，管理室會看到。'],
    article: 'report-edit',
  },
  {
    id: 'who-handles',
    group: 'resident',
    roles: ['resident'],
    question: '為什麼看不到是哪一家廠商在修？',
    answer: ['你會看到管理室寫給你的處理說明，例如「已安排廠商，預計 10/3 到場。」，就能知道大概什麼時候會修好。'],
    article: 'report-progress',
  },
  {
    id: 'invite-code',
    group: 'resident',
    roles: ['resident'],
    question: '加入管委會的邀請碼要去哪裡拿？',
    answer: ['請向主委索取。拿到後到「我的」→「加入管委會」輸入。'],
    article: 'join-committee',
  },

  // ── 管委會與管理人員 ──
  {
    id: 'reopen-case',
    group: 'management',
    roles: ['committee', 'staff'],
    question: '修好之後又壞了，要怎麼辦？',
    answer: ['請新增一件新的案件。已經結案的案件不會再打開。'],
    article: 'case-flow',
  },
  {
    id: 'staff-close',
    group: 'management',
    roles: ['committee', 'staff'],
    featured: true,
    question: '管理人員可以自己結案嗎？',
    answer: ['不行。管理人員按「完工驗收」後，會交給主委或副主委確認結案。'],
    article: 'case-complete',
  },
  {
    id: 'resident-note',
    group: 'management',
    roles: ['committee', 'staff'],
    question: '住戶看得到我寫的處理紀錄嗎？',
    answer: ['看不到。想讓住戶知道進度，要另外寫「給住戶看的說明」。'],
    article: 'case-update',
  },
  {
    id: 'urgent-announcement',
    group: 'management',
    roles: ['committee'],
    question: '什麼時候要把公告標示為緊急？',
    answer: ['會影響住戶安全或生活、需要馬上知道的事，例如臨時停水。'],
    article: 'announcement-publish',
  },
  {
    id: 'staff-amount',
    group: 'management',
    roles: ['staff'],
    question: '為什麼我看不到合約金額和維修費用？',
    answer: ['金額相關的資料只有管委會看得到。'],
    article: 'equipment',
  },

  // ── 遇到狀況時 ──
  {
    id: 'next-disabled',
    group: 'trouble',
    roles: ['resident', 'committee', 'staff'],
    question: '按鈕按不下去？',
    answer: ['通常是還有一定要填的欄位沒填。看看哪個欄位旁邊有紅色星號 *，填好就可以了。'],
  },
  {
    id: 'please-refresh',
    group: 'trouble',
    roles: ['committee', 'staff'],
    question: '畫面提醒「可能已經有人受理了」？',
    answer: ['表示有別人比你早一步處理了這件案件。重新整理畫面，就能看到現在由誰負責。'],
  },
  {
    id: 'video-too-large',
    group: 'trouble',
    roles: ['resident', 'committee'],
    question: '照片或影片加不上去？',
    answer: ['最多可以放 3 個照片或影片。影片太長的話可能放不上去，可以剪短一點再試。'],
    article: 'new-report',
  },
  {
    id: 'code-error',
    group: 'trouble',
    roles: ['resident'],
    question: '邀請碼不能用？',
    answer: ['輸入框下面會說明原因。請確認數字有沒有打錯，或請主委給你一組新的邀請碼。'],
    article: 'join-committee',
  },
]
