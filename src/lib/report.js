// 通報（住戶端）的小工具：好幾個通報元件都會用到的規則放這裡

// 通報狀態徽章的顏色，回傳 Badge 的 variant（住戶端的徽章規則見 docs/dev-guide.md 第 5 節）
//   還沒結案（已收到、處理中）→ 藍（default）：跟你有關，但不用你做什麼
//   已經結案（已完成）        → 灰（outline）：已結束
//   report 是 getMyReports() / getReportById() 回傳的通報
//   isOpen 是假 API 給的：true 代表還沒結案
export function reportBadgeVariant(report) {
  return report.isOpen ? 'default' : 'outline'
}

// 通報的兩種類型（住戶新增通報時選的）。key 和假資料的 CASE_VISIBILITY 一樣：public 公開、private 保密
//   label 類型名稱 / tag 怎麼處理
export const REPORT_TYPES = {
  public: { label: '公共設施問題', tag: '公開處理' },
  private: { label: '涉及住戶行為', tag: '保密處理' },
}

// 字數和檔案數的上限：新增通報和通報詳情（修改）用同一組
export const REPORT_SUBJECT_MAX = 20 // 通報問題（標題）
export const REPORT_DESCRIPTION_MAX = 200 // 補充說明
export const REPORT_PHOTO_MAX = 3 // 照片和影片合計
export const REPORT_VIDEO_MAX_MB = 50 // 一段影片最大幾 MB
