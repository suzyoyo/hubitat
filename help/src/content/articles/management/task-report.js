export default {
  id: 'task-report',
  title: '查看被交辦的工作並回報完成',
  description: '主委或副主委交給你的工作，做完後回報。',
  category: 'task',
  applicableRoles: ['staff'],
  order: 3,
  keywords: ['交辦', '被交辦', '回報完成', '交辦給我的', '新的交辦'],
  published: true,
  steps: [
    {
      title: '打開交給你的工作',
      body: '有新的交辦時會收到通知，點通知就能打開；也可以在待辦裡找。',
    },
    {
      title: '看要做什麼、什麼時候前完成',
      body: '和案件有關的工作，就照案件的處理方式：派廠商、更新進度。',
      screenshot: { file: 'staff-task-detail.jpg', alt: '管理人員看到的交辦詳情，底部有「回報完成」' },
    },
    {
      title: '做完按「回報完成」',
      body: '可以附上照片、寫幾句說明，再送出。',
    },
  ],
  result: '交辦的主委或副主委會收到通知，確認後這件工作就完成了。',
  notes: ['如果被退回，會收到通知並看到原因，處理好後再回報一次。'],
  relatedArticles: ['case-complete', 'todos', 'case-flow'],
}
