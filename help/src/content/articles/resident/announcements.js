export default {
  id: 'announcements',
  title: '查看社區公告',
  description: '停水、施工、社區活動等公告，都在這裡看。',
  category: 'notice',
  applicableRoles: ['resident'],
  order: 1,
  keywords: ['公告', '停水', '停電', '施工', '活動', '行事曆', '與我有關'],
  published: true,
  popular: true,
  steps: [
    {
      title: '打開社區公告',
      body: '在首頁「公告與動態」右邊，按「看全部」。想看某一則，直接點首頁上的公告也可以。',
    },
    {
      title: '看社區行事曆',
      body: '最上面是兩週的日期，有公告的日子下面有小圓點。',
      screenshot: { file: 'resident-announcements.jpg', alt: '社區公告頁，上方是兩週的行事曆，下面是「與我有關」「社區公告」兩個分頁' },
    },
    {
      title: '切換「與我有關」和「社區公告」',
      body: '「與我有關」是會影響你住的那一棟的公告；「社區公告」是全社區的公告。',
    },
    {
      title: '點公告看內容',
      body: '會看到公告的日期時間、地點和注意事項。',
      screenshot: { file: 'resident-announcement-detail.jpg', alt: '公告詳細內容的彈出視窗' },
    },
  ],
  sections: [
    {
      heading: '公告上的標籤',
      blocks: [
        {
          type: 'badges',
          items: [
            { tone: 'red', label: '今天開始', meaning: '今天就會影響你，例如「施工中」「今天開始」。' },
            { tone: 'blue', label: '明天開始', meaning: '明天開始，可以先準備。' },
            { tone: 'gray', label: '3 天後開始', meaning: '還有幾天才開始。' },
          ],
        },
      ],
    },
  ],
  relatedArticles: ['notifications', 'resident-home', 'meetings'],
}
