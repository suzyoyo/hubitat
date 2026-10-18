export default {
  id: 'report-place',
  title: '如何選擇通報地點',
  description: '先選大範圍、再選具體地點；清單裡沒有的，可以自己寫。',
  category: 'report',
  applicableRoles: ['resident'],
  order: 3,
  keywords: ['地點', '位置', '其他', '棟', '樓層', '通報'],
  published: true,
  steps: [
    {
      title: '點一個範圍',
      body: '新增通報的第一步會列出社區的各個範圍，例如各棟大樓和公共設施。點一下，就會展開裡面的地點。',
    },
    {
      title: '點具體的地點',
      body: '例如「1F 大廳」「電梯／電梯口」。選到的地點會有藍色外框。',
      screenshot: { file: 'report-step1.jpg', alt: '展開 B 棟後，選了「電梯／電梯口」' },
    },
    {
      title: '找不到地點，就點「其他」',
      body: '清單最後面有「其他」，點了可以自己寫地點，例如「5 樓住戶門口」。',
      screenshot: { file: 'report-step1-other.jpg', alt: '點了「其他」後出現的地點輸入框' },
    },
    {
      title: '按「下一步」',
      body: '選好地點後，按畫面下方的「下一步」。',
    },
  ],
  relatedArticles: ['new-report', 'me-too'],
}
