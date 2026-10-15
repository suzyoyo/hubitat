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

// ── 新增交辦、回報完成 ─────────────────────────────────────

// 這個人能不能交辦給別人：只有主委、副主委（權限表）
export function canAssignTasks(userId) {
  return ['chair', 'viceChair'].includes(findUser(userId)?.committeeTitle)
}

// 新增交辦（主委、副主委用），回傳新增好的交辦；不能新增的話回傳 undefined
//   input 要傳：
//     title      標題
//     content    內容（最多 200 字）
//     assigneeId 交辦給誰（對應 users.js）
//     deadline   完成期限，例如 '2026-10-08T18:00'，要比現在晚
//     caseId     關聯的案件（選填）。案件要還沒結案，而且同一件案件同時只能有一筆還沒完成的交辦
//                有傳的話，案件的處理紀錄會多一筆「交辦」（不給住戶看）
// 交辦後會通知被交辦人；新交辦只存在記憶體，重新整理網頁就不見了
export async function createTask(userId, input) {
  await delay()
  if (!canAssignTasks(userId) || !input.title?.trim() || !findUser(input.assigneeId)) return undefined
  if (!input.deadline || input.deadline <= MOCK_NOW) return undefined
  const relatedCase = input.caseId ? cases.find((item) => item.id === input.caseId) : undefined
  if (input.caseId) {
    if (!relatedCase || ['closed', 'cancelled'].includes(relatedCase.status)) return undefined
    const hasOpenTask = tasks.some(
      (task) => task.caseId === input.caseId && ['in_progress', 'reported'].includes(task.status),
    )
    if (hasOpenTask) return undefined
  }
  // 新編號：現有最大的編號 + 1，例如 TASK-104 → TASK-105
  const maxNumber = Math.max(...tasks.map((task) => Number(task.id.slice(5))))
  const task = {
    id: `TASK-${maxNumber + 1}`,
    title: input.title.trim(),
    content: input.content ?? '',
    assignerId: userId,
    assigneeId: input.assigneeId,
    createdAt: MOCK_NOW,
    deadline: input.deadline,
    status: 'in_progress',
  }
  if (relatedCase) {
    task.caseId = relatedCase.id
    relatedCase.logs.push({
      at: MOCK_NOW,
      actorId: userId,
      label: '交辦',
      text: `${userLabel(userId)}交辦給${userLabel(input.assigneeId)}（${task.id}）`,
    })
  }
  tasks.push(task)
  notifyAssignee(task, '新的交辦', `${userLabel(userId)}交辦，期限 ${formatFullDate(task.deadline)} ${formatTime(task.deadline)}`)
  return present(task)
}

// 回報完成（被交辦的人用）：進行中（包含已逾期）→ 待確認，等交辦人確認
//   note 備註、files 附件檔名的清單，都是選填
//   被退回過的，回報後清掉退回原因
// 連到案件的交辦，在案件上按「完工驗收」時會自動回報，不用再按這個
// 成功回傳 true，不能回報（不是交辦給自己的、狀態不對）回傳 false
export async function reportTask(id, userId, { note = '', files = [] } = {}) {
  await delay()
  const task = tasks.find((item) => item.id === id && item.assigneeId === userId && item.status === 'in_progress')
  if (!task) return false
  task.status = 'reported'
  task.report = { at: MOCK_NOW, note, files: [...files] }
  delete task.returnNote
  return true
}
