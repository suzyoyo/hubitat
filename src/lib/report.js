// 通報（住戶端）的小工具：好幾個通報元件都會用到的規則放這裡

// 通報狀態徽章的顏色，回傳 Badge 的 variant（住戶端的徽章規則見 docs/dev-guide.md 第 5 節）
//   還沒結案（已收到、處理中）→ 藍（default）：跟你有關，但不用你做什麼
//   已經結案（已完成）        → 灰（outline）：已結束
//   report 是 getMyReports() / getReportById() 回傳的通報
//   isOpen 是假 API 給的：true 代表還沒結案
export function reportBadgeVariant(report) {
  return report.isOpen ? 'default' : 'outline'
}
