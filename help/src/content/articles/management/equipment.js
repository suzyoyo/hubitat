export default {
  id: 'equipment',
  title: '查看設備清冊與維修紀錄',
  description: '社區每一台設備的資料、保養時間，以及以前修過什麼。',
  category: 'vendor',
  applicableRoles: ['committee', 'staff'],
  order: 4,
  keywords: ['設備', '設備清冊', '維修紀錄', '維修史', '保養', '電梯', '保養逾期'],
  published: true,
  steps: [
    {
      title: '打開「設備清冊」',
      body: '按底部的「社區」，再按「設備清冊」。',
    },
    {
      title: '找設備',
      body: '可以搜尋設備名稱或位置，也可以把需要處理的設備排在前面。',
      screenshot: { file: 'committee-equipment-list.jpg', alt: '設備清冊，有搜尋、篩選與排序' },
    },
    {
      title: '點設備看詳細資料',
      body: '可以看到設備資料、下次什麼時候保養，以及以前的維修紀錄。點一筆維修紀錄，可以看當時的案件。',
      screenshot: { file: 'committee-equipment-detail.jpg', alt: '設備詳情頁，下方是維修紀錄' },
    },
  ],
  notes: ['維修費用只有管委會看得到。'],
  relatedArticles: ['case-equipment', 'case-close', 'contracts'],
}
