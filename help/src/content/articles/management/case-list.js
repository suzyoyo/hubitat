export default {
  id: 'case-list',
  title: '查看案件列表',
  description: '住戶通報的所有問題，可以依狀態、地點篩選。',
  category: 'case',
  applicableRoles: ['committee', 'staff'],
  order: 1,
  keywords: ['案件', '列表', '篩選', '狀態', '地點', '通報'],
  published: true,
  steps: [
    {
      title: '按底部的「案件」',
      body: '會列出社區所有的案件。',
      screenshot: { file: 'committee-cases.jpg', alt: '案件列表，上方有狀態、地點兩個篩選' },
    },
    {
      title: '用「狀態」「地點」篩選',
      body: '例如只看「待受理」的案件，或只看某一棟的案件。',
    },
    {
      title: '點案件卡片',
      body: '可以看到住戶的描述、照片和處理紀錄。',
    },
  ],
  sections: [
    {
      heading: '案件的四種狀態',
      blocks: [
        {
          type: 'table',
          caption: '案件狀態與住戶看到的狀態',
          head: ['你看到的', '意思', '住戶看到的'],
          rows: [
            ['待受理', '住戶剛通報，還沒有人接手', '已收到'],
            ['處理中', '已經有人在處理', '處理中'],
            ['待結案', '已經修好，等主委或副主委確認', '處理中'],
            ['已結案', '處理完成', '已完成'],
          ],
        },
      ],
    },
  ],
  relatedArticles: ['case-flow', 'case-accept', 'todos'],
}
