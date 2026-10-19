export default {
  id: 'report-type',
  title: '公開通報與保密通報怎麼選',
  description: '公共設施的問題公開處理，和鄰居有關的問題保密處理。',
  category: 'report',
  applicableRoles: ['resident'],
  order: 4,
  keywords: ['公開', '保密', '隱私', '類型', '噪音', '停車', '鄰居', '公共設施問題', '涉及住戶行為'],
  published: true,
  sections: [
    {
      heading: '兩種類型的差別',
      blocks: [
        {
          type: 'table',
          caption: '兩種通報類型的差別',
          head: ['要選哪一個', '適合什麼問題', '誰看得到'],
          rows: [
            ['「公共設施問題」', '設備故障、走道漏水、照明太暗、門禁感應不良', '所有住戶都看得到，遇到同樣問題的人可以按「我也遇到了」'],
            ['「涉及住戶行為」', '鄰居深夜噪音、違規停車、走廊堆雜物', '只有管委會和管理室看得到'],
          ],
        },
        { type: 'image', screenshot: { file: 'report-step3.jpg', alt: '新增通報第 3 步，兩種類型的卡片' } },
      ],
    },
    {
      heading: '別人會知道是我通報的嗎？',
      blocks: [{ type: 'p', text: '不會。不論選哪一種，其他住戶都看不到你的姓名和戶號。' }],
    },
  ],
  relatedArticles: ['new-report', 'me-too'],
}
