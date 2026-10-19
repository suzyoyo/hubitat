// 「認識我們」頁（/about，AboutView.vue）的內容
//   改文字只要改這個檔案；服務說明（body）裡用「」框起來的字會變成深藍粗體，代表 App 上的按鈕名稱（和文章一樣）
//   名稱由來、比比的自我介紹是一般文字，「」不會變色
//   文章 what-is 會直接拿這裡的文字給搜尋用，不用另外改
//   注意：只寫 App 已經做好的功能（例如「管委會交接包」還沒做，先不寫）

// 頁首
export const ABOUT_INTRO = {
  title: '認識好彼社區',
  lead: '讓住戶、管委會、管理人員一起處理社區大小事的 App。',
}

// 名稱的由來
export const ABOUT_NAME = '「好彼」取自英文名稱 Hubitat 前兩個音節的諧音，意思是「美好彼此」。Hubitat 是 Hub（資訊集中的地方）加上 Habitat（居住的環境）。'

// 我們的服務：一個服務一個區塊，桌機左右交替排列
//   screenshots：區塊旁邊的 App 截圖（src/assets/screenshots/ 的檔名＋替代文字），放進假手機裡、只露出上半截
//     放一張就是一支手機；放三張就是三支小手機並排（2026-10-19 從好彼管家的圖換成截圖）
//   links：區塊下面的按鈕，to 是網站裡的網址
export const ABOUT_SERVICES = [
  {
    title: '通報進度看得到',
    body: '住戶發現電梯異音、走道漏水，用手機就能通報。管委會受理、交辦給管理人員，管理人員聯絡廠商處理，完工後結案，每一步都看得到，也會收到通知。',
    screenshots: [{ file: 'resident-report-detail.jpg', alt: '通報詳情頁，上方是通報摘要，下方是處理進度' }],
    links: [{ to: '/articles/new-report', label: '看怎麼通報' }],
  },
  {
    title: '公告與會議紀錄集中在一起',
    body: '停水施工、社區活動、管委會的會議紀錄都在 App 裡，不怕錯過公告欄。對會議紀錄有疑問，也可以直接留言給管委會。',
    screenshots: [{ file: 'resident-announcements.jpg', alt: '社區公告頁，上方是兩週的行事曆，下面是「與我有關」「社區公告」兩個分頁' }],
    links: [{ to: '/articles/announcements', label: '看怎麼查看公告' }],
  },
  {
    title: '廠商與設備有紀錄可以查',
    body: '社區的廠商、合約和設備都有清冊。每一次維修都會記進設備的維修紀錄，管委會可以看廠商過去的施工表現，作為續約的參考。',
    screenshots: [{ file: 'committee-vendor-detail.jpg', alt: '廠商詳細頁，有施工表現和聯絡窗口' }],
    links: [{ to: '/articles/equipment', label: '看設備與維修紀錄' }],
  },
  {
    title: '三種身分，各有各的畫面',
    body: '住戶、管委會、管理人員打開 App 看到的內容不一樣，只會看到自己用得到的功能。選你的身分，看你用得到的教學。',
    screenshots: [
      { file: 'resident-home.jpg', alt: '住戶首頁' },
      { file: 'committee-home.jpg', alt: '管委會首頁' },
      { file: 'staff-home.jpg', alt: '管理人員首頁' },
    ],
    links: [
      { to: '/resident', label: '我是住戶' },
      { to: '/committee', label: '我是管委會委員' },
      { to: '/staff', label: '我是管理人員' },
    ],
  },
]

// 認識好彼管家比比（人物設定挑著放：名字、職稱、自我介紹；2026-10-19 拿掉名字由來、眼鏡兩張小卡）
export const ABOUT_MASCOT = {
  name: '比比',
  title: '好彼社區小管家',
  // 用比比的口吻自我介紹，放在對話框裡（從人物設定的 Bio 縮短）
  bio: '喵！大家好，我是好彼管家「比比」！不管你是要通報問題、查看進度，還是收到重要通知，比比都會陪在你身邊。社區的大小事，通通交給比比，一起創造「美好彼此」的社區生活吧！',
  // 比比會在 App 的哪些地方出現
  appearances: [
    '首頁的問候語旁邊，跟你打招呼。',
    '新增通報的每一步，提醒你現在要做什麼，例如「想通報哪裡的問題呢？」',
    '通報送出後，告訴你「已收到你的通報！」',
    '沒有資料時，例如還沒有任何通報，會拿著放大鏡出現。',
  ],
}
