// 待辦（管委會、管理人員）的小工具：好幾個待辦元件都會用到的規則放這裡

// 期限徽章，回傳 { text, variant }；沒有期限回傳 null
//   逾期、今天到期 → 紅（destructive）：已經出問題
//   還沒到期       → 橘（secondary）：輪到你處理
//   todo 是 getMyTodos() 回傳的 items 其中一筆
export function todoDeadlineBadge(todo) {
  const days = todo.daysLeft
  if (days === null) return null
  if (days < 0) return { text: `逾期 ${-days} 天`, variant: 'destructive' }
  if (days === 0) return { text: '今日到期', variant: 'destructive' }
  return { text: `剩餘 ${days} 天`, variant: 'secondary' }
}

// 待辦的 link.type 對應到哪一種頁面
const TODO_LINK_PATHS = {
  case: 'cases',
  task: 'tasks',
  proposal: 'proposals',
  announcement: 'announcements',
  contract: 'contracts',
  legalDocument: 'documents',
  quickSave: 'quick-saves',
}

// 一筆待辦點了要去哪裡（管委會端），例如 { type: 'case', id: 'CASE-1' } → '/committee/cases/CASE-1'
export function todoLink(todo) {
  return `/committee/${TODO_LINK_PATHS[todo.link.type]}/${todo.link.id}`
}
