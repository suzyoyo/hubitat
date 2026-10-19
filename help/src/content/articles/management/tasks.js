export default {
  id: 'tasks',
  title: '查看交辦進度',
  description: '看交出去的工作做到哪裡，確認完成或退回。',
  category: 'task',
  applicableRoles: ['committee'],
  audienceNote: '給交辦工作的主委、副主委。',
  order: 2,
  keywords: ['交辦', '交辦進度', '確認完成', '退回說明', '逾期', '新增交辦'],
  published: true,
  steps: [
    {
      title: '打開「交辦進度」',
      body: '在首頁按「交辦進度」，會列出你交辦出去的工作，快到期的排在前面。',
      screenshot: { file: 'committee-tasks.jpg', alt: '交辦進度頁，有狀態篩選和交辦卡片' },
    },
    {
      title: '點「查看詳情」',
      body: '可以看到交給誰、什麼時候前要完成。',
      screenshot: { file: 'committee-task-detail.jpg', alt: '交辦詳情頁，對方已回報，底部有「退回說明」和「確認完成」' },
    },
    {
      title: '對方回報後，確認完成或退回',
      body: '對方做完後，卡片會出現橘色的「待我確認」。沒問題按「確認完成」；還要再做的話，按「退回說明」並寫下原因。',
    },
  ],
  sections: [
    {
      heading: '其他常用的功能',
      blocks: [
        { type: 'p', text: '不需要再做了：在交辦詳情按「撤回交辦」。' },
        { type: 'p', text: '有和案件無關的工作要交辦，例如請管理人員找廠商報價：按交辦進度頁上方的「新增交辦」。' },
      ],
    },
  ],
  relatedArticles: ['case-assign', 'task-report'],
}
