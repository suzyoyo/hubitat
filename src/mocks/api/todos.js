// 我的待辦：不另外存資料，而是從交辦、案件、提案、公告、合約、文件、留存裡，
// 挑出「跟我有關、還沒完成」的項目彙整而成
import { addDays, diffDays } from '@/lib/date'
import { announcements } from '../data/announcements'
import { cases } from '../data/cases'
import { contracts } from '../data/contracts'
import { legalDocuments } from '../data/documents'
import { proposals } from '../data/proposals'
import { quickSaves } from '../data/quickSaves'
import { tasks } from '../data/tasks'
import { COMMITTEE_TITLES } from '../data/users'
import { vendors } from '../data/vendors'
import { contractStatus } from './contracts'
import { legalDocumentStatus } from './documents'
import { MOCK_TODAY, delay } from './helpers'
import { proposalStatus } from './proposals'
import { findUser, userLabel } from './users'

// 待辦的種類。管委會和管理人員各自會用到其中幾種
export const TODO_KINDS = {
  // 管委會
  assigned: { label: '交辦給我的' },
  confirm: { label: '待我確認' },
  sign: { label: '等我簽核' },
  review: { label: '待我審核' },
  my_case: { label: '我負責的案件' },
  expiring: { label: '快到期文件' },
  incomplete: { label: '需補資料' },
  // 管理人員
  new_case: { label: '新報修' },
  in_progress: { label: '施工中' },
  to_verify: { label: '待標記完成' },
}

// 建立一筆待辦
//   kind 種類 / title 標題 / hint 第二行的說明
//   createdAt 建立時間：交辦、提案、公告是建立或送出的時間，案件是通報時間，留存是留存時間；
//             快到期的合約、文件是系統依日期提醒的，沒有建立時間，是 null
//   dueAt 到期時間（沒有期限就是 null）
//   link 點了要去哪裡：type 資料種類、id 編號
//   isUrgent 是否緊急（案件由通報的人標示；其他種類不傳，預設是 false）
function todo(kind, title, hint, createdAt, dueAt, link, isUrgent = false) {
  return {
    id: `${kind}-${link.id}`,
    kind,
    kindLabel: TODO_KINDS[kind].label,
    title,
    hint,
    createdAt,
    dueAt,
    // 距離到期還有幾天：0 是今天，負數是已經過了幾天；沒有期限是 null
    daysLeft: dueAt ? diffDays(MOCK_TODAY, dueAt.split('T')[0]) : null,
    link,
    isUrgent,
  }
}

// 我還沒補齊的留存（兩種角色都會用到）
function incompleteQuickSaves(userId) {
  return quickSaves
    .filter((item) => item.ownerId === userId && !item.resolved)
    .map((item) =>
      todo('incomplete', item.name || '未命名的留存', '已留存，尚待補齊資料', item.savedAt, null, {
        type: 'quickSave',
        id: item.id,
      }),
    )
}

// 交辦給我、還在進行中的
//   被退回過的，提示改成退回原因，讓對方知道要改什麼
function assignedTasks(userId) {
  return tasks
    .filter((task) => task.assigneeId === userId && task.status === 'in_progress')
    .map((task) => {
      const hint = task.returnNote ? `已退回：${task.returnNote.note}` : `交辦人：${userLabel(task.assignerId)}`
      return todo('assigned', task.title, hint, task.createdAt, task.deadline, {
        type: 'task',
        id: task.id,
      })
    })
}

function committeeTodos(userId) {
  const user = findUser(userId)
  const items = [...assignedTasks(userId)]

  // 我交辦出去、對方已回報完成，等我確認的
  for (const task of tasks) {
    if (task.assignerId === userId && task.status === 'reported') {
      items.push(
        todo('confirm', task.title, `${userLabel(task.assigneeId)} 已回報完成`, task.createdAt, task.deadline, {
          type: 'task',
          id: task.id,
        }),
      )
    }
  }

  // 還在簽核中、我還沒簽的提案
  for (const proposal of proposals) {
    const signed = proposal.signatures.some((sign) => sign.userId === userId)
    if (proposalStatus(proposal) === 'signing' && !signed) {
      items.push(
        todo('sign', proposal.title, `發起人：${userLabel(proposal.proposerId)}`, proposal.createdAt, proposal.deadline, {
          type: 'proposal',
          id: proposal.id,
        }),
      )
    }
  }

  // 待審核的公告：只有主委、副主委可以審核
  if (COMMITTEE_TITLES[user.committeeTitle].canReviewAnnouncement) {
    for (const item of announcements) {
      if (item.status === 'pending') {
        items.push(
          todo('review', item.title, `${userLabel(item.authorId)} 送出`, item.createdAt, item.startAt, {
            type: 'announcement',
            id: item.id,
          }),
        )
      }
    }
  }

  // 我負責、還沒結案的案件
  for (const item of cases) {
    const open = !['closed', 'cancelled'].includes(item.status)
    if (item.assigneeId === userId && open) {
      const vendor = vendors.find((entry) => entry.id === item.vendorId)
      const hint = vendor ? `廠商：${vendor.name}` : '尚未派廠商'
      items.push(todo('my_case', item.title, hint, item.reportedAt, item.deadline ?? null, { type: 'case', id: item.id }, item.isUrgent))
    }
  }

  // 即將到期的合約
  for (const contract of contracts) {
    if (contractStatus(contract) === 'expiring') {
      const vendor = vendors.find((entry) => entry.id === contract.vendorId)
      items.push(
        todo('expiring', `${contract.service}合約（${vendor.name}）`, '合約即將到期', null, contract.endDate, {
          type: 'contract',
          id: contract.id,
        }),
      )
    }
  }

  // 法定文件：將到期的歸「快到期文件」，缺件的歸「需補資料」
  for (const doc of legalDocuments) {
    const status = legalDocumentStatus(doc)
    if (status === 'expiring') {
      items.push(todo('expiring', doc.name, '文件即將到期', null, doc.expiresAt, { type: 'legalDocument', id: doc.id }))
    }
    if (status === 'missing') {
      items.push(todo('incomplete', `${doc.name}缺件，請上傳`, '尚未上傳檔案', null, doc.dueAt, { type: 'legalDocument', id: doc.id }))
    }
  }

  return [...items, ...incompleteQuickSaves(userId)]
}

function staffTodos(userId) {
  const items = [...assignedTasks(userId)]

  // 管理人員要處理所有進行中的案件，依狀態分成三種
  const kindOfStatus = { pending: 'new_case', in_progress: 'in_progress', to_verify: 'to_verify' }
  for (const item of cases) {
    const kind = kindOfStatus[item.status]
    if (!kind) continue // 其他狀態（已受理、已結案…）不列入
    const vendor = vendors.find((entry) => entry.id === item.vendorId)
    let hint = vendor ? `廠商：${vendor.name}` : '尚未派廠商'
    if (kind === 'to_verify') hint = '廠商已完工，請確認後標記完成'
    // 新報修沒有期限，用通報時間排序；其他用處理期限
    const dueAt = kind === 'new_case' ? item.reportedAt : (item.deadline ?? null)
    items.push(todo(kind, item.title, hint, item.reportedAt, dueAt, { type: 'case', id: item.id }, item.isUrgent))
  }

  return [...items, ...incompleteQuickSaves(userId)]
}

// 取得我的待辦
//   role 是 'committee' 或 'staff'（住戶沒有待辦）
// 回傳：
//   items  待辦清單，到期日近的排前面，沒有期限的排最後
//   counts 每一種各有幾件，例如 { sign: 2, expiring: 3 }
//   total  總共幾件
export async function getMyTodos(userId, role) {
  await delay()
  const raw = role === 'staff' ? staffTodos(userId) : committeeTodos(userId)
  const items = raw.toSorted((a, b) => {
    if (a.dueAt === null) return 1
    if (b.dueAt === null) return -1
    return a.dueAt.localeCompare(b.dueAt)
  })
  const counts = {}
  for (const item of items) {
    counts[item.kind] = (counts[item.kind] ?? 0) + 1
  }
  return { items, counts, total: items.length }
}

// ── 已完成 ─────────────────────────────────────

// 「已完成」看最近幾天
export const DONE_TODO_DAYS = 30

// 已完成的種類名稱：TODO_KINDS 的「等我簽核」「待我審核」是還沒做的說法，做完了要換掉
const DONE_KIND_LABELS = {
  assigned: '交辦給我的',
  confirm: '我交辦的',
  sign: '提案簽核',
  review: '公告審核',
  my_case: '我負責的案件',
  to_verify: '我負責的案件',
}

// 建立一筆已完成的待辦（格式和 todo() 一樣，多一個 doneAt，沒有期限）
//   kind 用 TODO_KINDS 的種類，「我的待辦」的類型篩選才能共用
//   doneAt 完成的時間
function doneTodo(kind, title, hint, doneAt, link) {
  return { id: `${kind}-${link.id}`, kind, kindLabel: DONE_KIND_LABELS[kind], title, hint, doneAt, link }
}

// 我完成的事（管委會）。快到期文件、需補資料不算：它們是被處理掉，不是我做完的
function committeeDoneTodos(userId) {
  const items = []
  for (const task of tasks) {
    if (task.status !== 'done') continue
    // 交辦給我、我做完而且交辦人確認了
    if (task.assigneeId === userId) {
      items.push(doneTodo('assigned', task.title, `交辦人：${userLabel(task.assignerId)}`, task.doneAt, { type: 'task', id: task.id }))
    }
    // 我交辦出去、我確認完成的
    if (task.assignerId === userId) {
      items.push(doneTodo('confirm', task.title, `已確認 ${userLabel(task.assigneeId)} 的回報`, task.doneAt, { type: 'task', id: task.id }))
    }
  }
  // 我簽過的提案（不管提案通過了沒）
  for (const proposal of proposals) {
    const mine = proposal.signatures.find((sign) => sign.userId === userId)
    if (mine) {
      items.push(doneTodo('sign', proposal.title, '我已簽核', mine.at, { type: 'proposal', id: proposal.id }))
    }
  }
  // 我審核過的公告：審核通過（已發布）或退回
  for (const item of announcements) {
    if (item.reviewerId !== userId) continue
    if (item.rejectedAt) {
      items.push(doneTodo('review', item.title, `已退回：${item.rejectReason}`, item.rejectedAt, { type: 'announcement', id: item.id }))
    } else if (item.publishedAt) {
      items.push(doneTodo('review', item.title, '審核通過', item.publishedAt, { type: 'announcement', id: item.id }))
    }
  }
  // 我負責、已經結案的案件
  for (const item of cases) {
    if (item.assigneeId === userId && item.status === 'closed') {
      items.push(doneTodo('my_case', item.title, '已結案', item.closedAt, { type: 'case', id: item.id }))
    }
  }
  return items
}

// 我完成的事（管理人員）：交辦給我、已完成的，和我負責、已結案的案件
function staffDoneTodos(userId) {
  const items = []
  for (const task of tasks) {
    if (task.status === 'done' && task.assigneeId === userId) {
      items.push(doneTodo('assigned', task.title, `交辦人：${userLabel(task.assignerId)}`, task.doneAt, { type: 'task', id: task.id }))
    }
  }
  for (const item of cases) {
    if (item.assigneeId === userId && item.status === 'closed') {
      items.push(doneTodo('to_verify', item.title, '已結案', item.closedAt, { type: 'case', id: item.id }))
    }
  }
  return items
}

// 取得我最近完成的事（「我的待辦」的「已完成」分頁）
//   role 是 'committee' 或 'staff'
// 只列最近 DONE_TODO_DAYS 天完成的，新的在前
// 回傳的每一筆和 getMyTodos() 的 items 格式一樣，多了 doneAt（完成時間），沒有 dueAt、daysLeft
export async function getMyDoneTodos(userId, role) {
  await delay()
  const raw = role === 'staff' ? staffDoneTodos(userId) : committeeDoneTodos(userId)
  const since = addDays(MOCK_TODAY, -DONE_TODO_DAYS) // 例如 '2026-09-01'
  return raw.filter((item) => item.doneAt >= since).toSorted((a, b) => b.doneAt.localeCompare(a.doneAt))
}
