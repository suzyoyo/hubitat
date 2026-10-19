// 待辦（管委會、管理人員）的小工具：好幾個待辦元件都會用到的規則放這裡

// 期限徽章，回傳 { text, variant }；沒有期限回傳 null
//   新通報（待受理的案件）→ 紅「尚未受理」：已經出問題（dev-guide 第 5 節）。它的到期日是通報時間，只用來排序，不顯示逾期
//   逾期、今天到期 → 紅（destructive）：已經出問題
//   還沒到期       → 橘（secondary）：輪到你處理
//   沒有期限的其他待辦 → 依種類顯示要做什麼（2026-10-19：每張待辦卡右上角都要有徽章，原本沒期限的就空著）
//     輪到你處理的用橘（secondary），我負責、在等別人的「處理中」用藍（default）
//   todo 是 getMyTodos() 回傳的 items 其中一筆
const NO_DEADLINE_BADGES = {
  incomplete: { text: '待補資料', variant: 'secondary' },
  in_progress: { text: '處理中', variant: 'default' }, // 管理人員端負責的案件（suzy 在 #159 提醒補上）
  to_close: { text: '待結案', variant: 'secondary' },
  confirm: { text: '待確認', variant: 'secondary' },
  assigned: { text: '待處理', variant: 'secondary' },
  sign: { text: '待簽核', variant: 'secondary' },
  review: { text: '待審核', variant: 'secondary' },
  expiring: { text: '即將到期', variant: 'secondary' },
  my_case: { text: '處理中', variant: 'default' },
}

export function todoDeadlineBadge(todo) {
  if (todo.kind === 'new_case') return { text: '尚未受理', variant: 'destructive' }
  const days = todo.daysLeft
  if (days === null) return NO_DEADLINE_BADGES[todo.kind] ?? null
  if (days < 0) return { text: `逾期 ${-days} 天`, variant: 'destructive' }
  if (days === 0) return { text: '今日到期', variant: 'destructive' }
  return { text: `剩餘 ${days} 天`, variant: 'secondary' }
}

// 首頁「我的待辦」要放的幾張：建立時間新的在前（2026-10-16 和 suzy 定的）
//   剛進來的事（新通報、新交辦、待我結案）首頁一定看得到；全部待辦頁才照到期日排
//   沒有建立時間的（快到期的合約、文件，是系統依日期提醒的）排最後
//   items 是 getMyTodos() 回傳的 items；count 是要幾張
export function newestTodos(items, count = 2) {
  return items.toSorted((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).slice(0, count)
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
