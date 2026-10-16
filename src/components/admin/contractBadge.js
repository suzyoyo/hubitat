// 合約的狀態徽章（dev-guide 第 5 節管理端的顏色），合約卡、合約詳情、廠商詳細共用
//   即將到期 → 橘：快到期，輪到管委會決定要不要續約
//   尚未生效 → 藍：在等開始
//   合約內、已到期 → 灰：正常或已結束
// item 是 getContracts()、getContractById() 回傳的一筆；回傳 { variant, text }
import { CONTRACT_STATUSES } from '@/mocks/data/contracts'

export function contractBadge(item) {
  if (item.status === 'expiring') return { variant: 'secondary', text: `${item.daysLeft} 天後到期` }
  if (item.status === 'upcoming') return { variant: 'default', text: CONTRACT_STATUSES.upcoming.label }
  return { variant: 'outline', text: CONTRACT_STATUSES[item.status].label }
}
