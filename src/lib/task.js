// 交辦（管委會端）的小工具：交辦進度列表和交辦詳情都會用到的規則放這裡
import { TASK_DISPLAY_STATUSES } from '@/mocks/data/tasks'

// 狀態徽章的顏色（dev-guide 第 5 節，管理端那張表）
//   已逾期 → 紅：已經出問題；待確認 → 橘：輪到我（交辦人）確認
//   進行中 → 藍：在等對方做；已完成、已撤回 → 灰
const STATUS_VARIANTS = {
  overdue: 'destructive',
  reported: 'secondary',
  in_progress: 'default',
  done: 'outline',
  withdrawn: 'outline',
}

// 狀態徽章，回傳 { text, variant }；看的人是交辦人
//   已逾期改成顯示逾期幾天；待確認寫成「待我確認」，讓交辦人知道輪到自己
//   task 是 getTasks() / getTaskById() 回傳的一筆
export function taskStatusBadge(task) {
  const variant = STATUS_VARIANTS[task.displayStatus]
  if (task.displayStatus === 'overdue') return { text: `逾期 ${-task.daysLeft} 天`, variant }
  if (task.displayStatus === 'reported') return { text: '待我確認', variant }
  return { text: TASK_DISPLAY_STATUSES[task.displayStatus].label, variant }
}
