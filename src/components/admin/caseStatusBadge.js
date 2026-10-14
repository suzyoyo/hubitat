// 案件的狀態徽章（dev-guide 第 5 節管理端的顏色），案件卡 AdminCaseCard 和案件詳情頁共用
//   逾期、還沒受理 → 紅：已經出問題
//   待驗收        → 橘：輪到管委會確認
//   已受理、施工中 → 藍：進行中，在等別人
//   已結案、已取消 → 灰：已結束
// item 是 getCases()、getCaseById() 回傳的一筆；回傳 { variant, text }
export function caseStatusBadge(item) {
  if (item.isOverdue) return { variant: 'destructive', text: `逾期 ${item.overdueDays} 天` }
  if (item.status === 'pending') return { variant: 'destructive', text: '尚未受理' }
  if (item.status === 'to_verify') return { variant: 'secondary', text: item.statusLabel }
  if (item.isOpen) return { variant: 'default', text: item.statusLabel }
  return { variant: 'outline', text: item.statusLabel }
}
