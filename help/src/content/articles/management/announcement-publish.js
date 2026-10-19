export default {
  id: 'announcement-publish',
  title: '如何發布公告',
  description: '發布施工、維護、活動等公告，通知住戶。',
  category: 'announce',
  applicableRoles: ['committee'],
  audienceNote: '只有主委、副主委可以發布。',
  order: 1,
  keywords: ['公告', '發布', '停水', '施工', '活動', '緊急', '推播', '通知住戶'],
  published: true,
  steps: [
    {
      title: '按「＋」，選「發布公告」',
      body: '按右下角的「＋」，選「發布公告」。',
    },
    {
      title: '選類型、寫標題和內容',
      body: '先選公告類型：施工、維護、活動或其他，再寫標題和內容。',
      screenshot: { file: 'committee-announcement-form.jpg', alt: '發布公告表單的上半部，有公告類型、公告標題、影響範圍' },
    },
    {
      title: '選影響範圍和日期',
      body: '選會影響哪幾棟（也可以選全社區），再填日期和時間。活動公告還要填地點。',
    },
    {
      title: '選要不要通知住戶',
      body: '「推播通知」可以選通知受影響的住戶、通知全社區，或不通知。很緊急的事，可以打開「標示為緊急」。',
    },
    {
      title: '按「發布公告」',
      body: '確認內容後送出。',
    },
  ],
  result: '住戶馬上就能在「社區公告」看到；有選通知的話，住戶會收到通知。',
  notes: ['有沒填完的欄位時，畫面會提醒你。'],
  relatedArticles: ['announcement-manage', 'urgent-log'],
}
