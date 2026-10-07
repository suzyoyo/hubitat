// 我的待辦：不另外存資料，而是從交辦、案件、提案、公告、合約、文件、留存裡，
// 挑出「跟我有關、還沒完成」的項目彙整而成
import { diffDays } from '@/lib/date'
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
//   dueAt 到期時間（沒有期限就是 null）
//   link 點了要去哪裡：type 資料種類、id 編號
function todo(kind, title, hint, dueAt, link) {
  return {
    id: `${kind}-${link.id}`,
    kind,
    kindLabel: TODO_KINDS[kind].label,
    title,
    hint,
    dueAt,
    // 距離到期還有幾天：0 是今天，負數是已經過了幾天；沒有期限是 null
    daysLeft: dueAt ? diffDays(MOCK_TODAY, dueAt.split('T')[0]) : null,
    link,
  }
}

// 我還沒補齊的留存（兩種角色都會用到）
function incompleteQuickSaves(userId) {
  return quickSaves
    .filter((item) => item.ownerId === userId && !item.resolved)
    .map((item) =>
      todo('incomplete', item.name || '未命名的留存', '已留存，尚待補齊資料', null, {
        type: 'quickSave',
        id: item.id,
      }),
    )
}

// 交辦給我、還在進行中的
function assignedTasks(userId) {
  return tasks
    .filter((task) => task.assigneeId === userId && task.status === 'in_progress')
    .map((task) =>
      todo('assigned', task.title, `交辦人：${userLabel(task.assignerId)}`, task.deadline, {
        type: 'task',
        id: task.id,
      }),
    )
}

function committeeTodos(userId) {
  const user = findUser(userId)
  const items = [...assignedTasks(userId)]

  // 我交辦出去、對方已回報完成，等我確認的
  for (const task of tasks) {
    if (task.assignerId === userId && task.status === 'reported') {
      items.push(
        todo('confirm', task.title, `${userLabel(task.assigneeId)} 已回報完成`, task.deadline, {
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
        todo('sign', proposal.title, `發起人：${userLabel(proposal.proposerId)}`, proposal.deadline, {
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
          todo('review', item.title, `${userLabel(item.authorId)} 送出`, item.startAt, {
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
      items.push(todo('my_case', item.title, hint, item.deadline ?? null, { type: 'case', id: item.id }))
    }
  }

  // 即將到期的合約
  for (const contract of contracts) {
    if (contractStatus(contract) === 'expiring') {
      const vendor = vendors.find((entry) => entry.id === contract.vendorId)
      items.push(
        todo('expiring', `${contract.service}合約（${vendor.name}）`, '合約即將到期', contract.endDate, {
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
      items.push(todo('expiring', doc.name, '文件即將到期', doc.expiresAt, { type: 'legalDocument', id: doc.id }))
    }
    if (status === 'missing') {
      items.push(todo('incomplete', `${doc.name}缺件，請上傳`, '尚未上傳檔案', doc.dueAt, { type: 'legalDocument', id: doc.id }))
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
    items.push(todo(kind, item.title, hint, dueAt, { type: 'case', id: item.id }))
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
