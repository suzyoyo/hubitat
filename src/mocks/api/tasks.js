// 交辦相關的假 API
import { diffDays, formatFullDate, formatTime } from '@/lib/date'
import { cases } from '../data/cases'
import { notifications } from '../data/notifications'
import { tasks } from '../data/tasks'
import { MOCK_NOW, MOCK_TODAY, delay } from './helpers'
import { findUser, userLabel } from './users'

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

// ── 交辦人的動作：確認完成、退回、撤回 ─────────────────────
// 下面三個都只改記憶體裡的資料，重新整理網頁會變回原本的假資料
// 只有交辦人能用，狀態也要對；不能用時回傳 false，成功回傳 true

// 找出「這個人交辦的、而且現在是這個狀態」的交辦；找不到回傳 undefined
// statuses 是允許的狀態，例如 ['reported']
function findMyTask(id, userId, statuses) {
  return tasks.find((task) => task.id === id && task.assignerId === userId && statuses.includes(task.status))
}

// 發一則通知給被交辦人
// 被交辦人是管理人員就發到管理人員端，是委員就發到管委會端
function notifyAssignee(task, title, reason) {
  const assignee = findUser(task.assigneeId)
  notifications.push({
    id: `n-${task.id}-${notifications.length + 1}`,
    userId: task.assigneeId,
    role: assignee.staffTitle ? 'staff' : 'committee',
    title,
    body: `${task.title}：${reason}`,
    at: MOCK_NOW,
    read: false,
    link: { type: 'task', id: task.id },
  })
}

// 確認完成：對方回報完成後（待確認），交辦人確認 → 已完成
export async function confirmTask(id, userId) {
  await delay()
  const task = findMyTask(id, userId, ['reported'])
  if (!task) return false
  task.status = 'done'
  task.doneAt = MOCK_NOW
  return true
}

// 退回：對方回報完成，但交辦人覺得還沒做好 → 改回進行中，請對方再做
//   reason 必填。退回後會通知對方，這件交辦也會自動回到對方的待辦
//   newDeadline 新的完成期限（例如 '2026-10-05T18:00'），選填；要比現在晚
//     原本的期限可能已經過了，不給新期限的話，對方一被退回就是「已逾期」
export async function returnTask(id, userId, reason, newDeadline = '') {
  await delay()
  const task = findMyTask(id, userId, ['reported'])
  if (!task || !reason) return false
  if (newDeadline && newDeadline <= MOCK_NOW) return false
  task.status = 'in_progress'
  task.returnNote = { at: MOCK_NOW, note: reason }
  let message = reason
  if (newDeadline) {
    task.deadline = newDeadline
    message += `（新期限 ${formatFullDate(newDeadline)} ${formatTime(newDeadline)}）`
  }
  notifyAssignee(task, '交辦被退回', message)
  return true
}

// 撤回：還在進行中（包含已逾期）的交辦，交辦人決定不用做了 → 已撤回
//   reason 必填。撤回後會通知對方
export async function withdrawTask(id, userId, reason) {
  await delay()
  const task = findMyTask(id, userId, ['in_progress'])
  if (!task || !reason) return false
  task.status = 'withdrawn'
  task.withdrawReason = { at: MOCK_NOW, note: reason }
  notifyAssignee(task, '交辦已撤回', reason)
  return true
}
