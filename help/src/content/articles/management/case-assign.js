export default {
  id: 'case-assign',
  title: '如何交辦案件',
  description: '把案件交給管理人員處理，並設定完成期限。',
  category: 'task',
  applicableRoles: ['committee'],
  audienceNote: '只有主委、副主委可以交辦。',
  order: 1,
  keywords: ['交辦', '指派', '分派', '管理人員', '期限', '撤回交辦'],
  published: true,
  before: ['案件要先受理，才能交辦。'],
  steps: [
    {
      title: '在案件裡按「交辦」',
      body: '打開案件，按畫面下方的「交辦」。',
    },
    {
      title: '寫下要做什麼',
      body: '填「交辦標題」，例如「聯繫電梯廠商檢修 B 棟電梯」；需要的話，在「交辦內容」寫得更詳細。',
      screenshot: { file: 'case-assign.jpg', alt: '新增交辦頁，關聯案件已鎖定，下面是交辦標題、交辦內容、交辦對象' },
    },
    {
      title: '選交給誰、什麼時候前完成',
      body: '在「交辦對象」選管理人員；「完成期限」可以不填。',
    },
    {
      title: '按「確認新增」',
      body: '對方會收到通知。',
    },
  ],
  result: '案件的負責人會變成你交辦的管理人員。',
  sections: [
    {
      heading: '想收回交辦？',
      blocks: [{ type: 'p', text: '在案件裡按「撤回交辦」，寫下原因後送出，對方會收到通知。' }],
    },
  ],
  relatedArticles: ['tasks', 'case-flow', 'task-report'],
}
