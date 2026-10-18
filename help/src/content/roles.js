// 三種使用者身分
//   id：用在網址（/resident、/committee、/staff）和文章的 applicableRoles
//   entry：首頁身分入口卡的標題
//   quickStart：身分專區最上面「第一次使用？從這裡開始」依序列出的文章 id
export const ROLES = [
  {
    id: 'resident',
    label: '住戶',
    entry: '我是住戶',
    description: '通報社區問題、查看處理進度，閱讀公告與會議紀錄。',
    quickStart: ['app-screen', 'new-report', 'report-progress'],
  },
  {
    id: 'committee',
    label: '管委會',
    entry: '我是管委會委員',
    description: '受理與交辦案件、確認結案、發布公告，查看廠商、合約與設備。',
    quickStart: ['committee-home', 'todos', 'case-flow'],
  },
  {
    id: 'staff',
    label: '管理人員',
    entry: '我是管理人員',
    description: '受理案件、派廠商、回報完成，處理被交辦的工作。',
    quickStart: ['staff-home', 'todos', 'case-flow'],
  },
]

export const ROLE_IDS = ROLES.map((role) => role.id)

export function findRole(id) {
  return ROLES.find((role) => role.id === id)
}
