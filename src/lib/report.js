// 通報（住戶端）的小工具：好幾個通報元件都會用到的規則放這裡

// 通報狀態徽章的顏色，回傳 Badge 的 variant
//   「處理中」是淺橘（secondary），「已收到」「已完成」是淺藍（default）
//   report 是 getMyReports() / getReportById() 回傳的通報
//   status 是 pending 代表管委會還沒受理，住戶看到的是「已收到」
export function reportBadgeVariant(report) {
  if (report.isOpen && report.status !== 'pending') return 'secondary'
  return 'default'
}
