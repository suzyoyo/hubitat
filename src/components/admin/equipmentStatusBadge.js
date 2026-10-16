// 設備的狀態徽章（dev-guide 第 5 節管理端的顏色），設備清冊的每一列、設備詳情共用
//   待維修、保養逾期 → 紅：已經出問題
//   保養將到期       → 橘：快到期
//   維修中           → 藍：進行中
//   正常使用中、已報廢 → 灰：正常或已結束
// item 是 getEquipmentList()、getEquipmentById() 回傳的一筆；回傳 { variant, text }
import { EQUIPMENT_DISPLAY_STATUSES } from '@/mocks/data/equipment'

const VARIANTS = {
  needs_repair: 'destructive',
  overdue: 'destructive',
  due_soon: 'secondary',
  repairing: 'default',
  normal: 'outline',
  retired: 'outline',
}

export function equipmentStatusBadge(item) {
  const status = item.displayStatus
  // 保養逾期寫出逾期幾天（設計稿「保養逾期 11 天」）
  if (status === 'overdue') return { variant: VARIANTS.overdue, text: `保養逾期 ${-item.daysToMaintenance} 天` }
  return { variant: VARIANTS[status], text: EQUIPMENT_DISPLAY_STATUSES[status].label }
}
