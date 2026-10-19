// 「認識我們」頁（/about）直接顯示這一篇
// 文章欄位說明見 help/README.md「新增一篇文章」
export default {
  id: 'what-is',
  title: '好彼社區是什麼？',
  description: '一個讓住戶、管委會、管理人員一起處理社區大小事的 App。',
  category: 'about',
  applicableRoles: ['resident', 'committee', 'staff'],
  order: 1,
  keywords: ['介紹', 'Hubitat', '好彼', '產品', '功能', '認識我們', '吉祥物', '好彼管家', '管家'],
  published: true,
  sections: [
    {
      heading: '名稱的由來',
      blocks: [
        { type: 'p', text: '「好彼」取自英文名稱 Hubitat 前兩個音節的諧音，意思是「美好彼此」。Hubitat 是 Hub（資訊集中的地方）加上 Habitat（居住的環境）。' },
      ],
    },
    {
      heading: '好彼社區能幫你做什麼',
      blocks: [
        {
          type: 'list',
          items: [
            '通報後看得到進度：住戶發現電梯異音、走道漏水，用手機通報；之後隨時看得到處理到哪一步，結案時會收到通知。',
            '公告與會議紀錄集中在一起：停水施工、社區活動、管委會的會議紀錄都在 App 裡，不怕錯過公告欄。',
            '廠商與設備有紀錄可以查：每一次維修都會記進設備的維修紀錄，管委會可以看廠商的施工表現，作為續約的參考。',
          ],
        },
      ],
    },
    {
      heading: '認識好彼管家',
      mascot: 'waving', // 平板、桌機：右下角放好彼管家
      mascotRow: ['pointing', 'thinking', 'happy', 'searching'], // 手機：文字下面排四隻，順序和上面四點一樣
      blocks: [
        { type: 'p', text: '好彼管家是好彼社區的吉祥物，會在這些地方出現：' },
        {
          type: 'list',
          items: [
            '首頁的問候語旁邊，跟你打招呼。',
            '新增通報的每一步，提醒你現在要做什麼，例如「想通報哪裡的問題呢？」',
            '通報送出後，告訴你「已收到你的通報！」',
            '沒有資料時，例如還沒有任何通報，會拿著放大鏡出現。',
          ],
        },
      ],
    },
  ],
  relatedArticles: ['app-screen', 'notifications'],
}
