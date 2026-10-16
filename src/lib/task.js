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

// 狀態徽章，回傳 { text, variant }
//   已逾期改成顯示逾期幾天；待確認寫成「待我確認」，讓交辦人知道輪到自己
//   task 是 getTasks() / getTaskById() 回傳的一筆
//   viewerId 是看的人；不傳就當作交辦人在看（交辦進度列表）
//   被交辦的人回報完成後看到的是藍色「待確認」：在等交辦人，不是輪到自己（2026-10-16）
export function taskStatusBadge(task, viewerId = task.assignerId) {
  const variant = STATUS_VARIANTS[task.displayStatus]
  if (task.displayStatus === 'overdue') return { text: `逾期 ${-task.daysLeft} 天`, variant }
  if (task.displayStatus === 'reported') {
    if (viewerId !== task.assignerId) return { text: '待確認', variant: 'default' }
    return { text: '待我確認', variant }
  }
  return { text: TASK_DISPLAY_STATUSES[task.displayStatus].label, variant }
}
