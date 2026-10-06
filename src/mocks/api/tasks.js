// 交辦相關的假 API
import { diffDays } from '@/lib/date'
import { cases } from '../data/cases'
import { tasks } from '../data/tasks'
import { MOCK_NOW, MOCK_TODAY, delay } from './helpers'
import { userLabel } from './users'

// 算出畫面上要顯示的狀態
// 還在進行中、而且已經超過期限的，顯示為「已逾期」
export function taskDisplayStatus(task) {
  if (task.status === 'in_progress' && task.deadline < MOCK_NOW) return 'overdue'
  return task.status
}

function present(task) {
  const relatedCase = cases.find((item) => item.id === task.caseId)
  const deadlineDate = task.deadline.split('T')[0]
  return {
    ...task,
    displayStatus: taskDisplayStatus(task),
    isOpen: task.status === 'in_progress' || task.status === 'reported',
    assignerLabel: userLabel(task.assignerId),
    assigneeLabel: userLabel(task.assigneeId),
    caseTitle: relatedCase ? relatedCase.title : '',
    // 距離期限還有幾天：0 是今天到期，負數是已經過了幾天
    daysLeft: diffDays(MOCK_TODAY, deadlineDate),
  }
}

// 取得交辦列表，期限近的排前面
// filters 可以傳：
//   status     'open' 未結案（預設）/ 'all' 全部 /
//              或畫面上的狀態：'reported' 待確認、'overdue' 已逾期、'in_progress' 進行中、'done' 已完成
//   assigneeId 只看交辦給某個人的
//   assignerId 只看某個人交辦出去的
export async function getTasks(filters = {}) {
  await delay()
  const { status = 'open', assigneeId, assignerId } = filters
  return tasks
    .map(present)
    .filter((task) => {
      if (status === 'open' && !task.isOpen) return false
      if (status !== 'open' && status !== 'all' && task.displayStatus !== status) return false
      if (assigneeId && task.assigneeId !== assigneeId) return false
      if (assignerId && task.assignerId !== assignerId) return false
      return true
    })
    .toSorted((a, b) => a.deadline.localeCompare(b.deadline))
}

// 取得單一交辦的詳情
export async function getTaskById(id) {
  await delay()
  const task = tasks.find((item) => item.id === id)
  return task ? present(task) : undefined
}
