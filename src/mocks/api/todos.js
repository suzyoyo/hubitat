// 我的待辦：不另外存資料，而是從交辦、案件、提案、公告、合約、文件、留存裡，
// 挑出「跟我有關、還沒完成」的項目彙整而成
import { addDays, diffDays, formatDateTime, formatRelativeTime, formatTime } from '@/lib/date'
import { announcements } from '../data/announcements'
import { cases } from '../data/cases'
import { contracts } from '../data/contracts'
import { legalDocuments } from '../data/documents'
import { notifications } from '../data/notifications'
import { proposals } from '../data/proposals'
import { quickSaves } from '../data/quickSaves'
import { tasks } from '../data/tasks'
import { COMMITTEE_TITLES } from '../data/users'
import { vendors } from '../data/vendors'
import { reporterLabel } from './cases'
import { contractStatus } from './contracts'
import { legalDocumentStatus } from './documents'
import { MOCK_NOW, MOCK_TODAY, delay } from './helpers'
import { proposalStatus } from './proposals'
import { NEW_TASK_TITLE } from './tasks'
import { findUser, userLabel } from './users'

// 待辦的種類。管委會和管理人員各自會用到其中幾種
export const TODO_KINDS = {
  // 管委會
  assigned: { label: '交辦給我的' },
  confirm: { label: '待我確認' },
  sign: { label: '等我簽核' },
  review: { label: '待我審核' },
  my_case: { label: '我負責的案件' },
  to_close: { label: '待我結案' }, // 我負責的案件，管理人員已完工驗收，等我結案（2026-10-15）
  expiring: { label: '快到期文件' },
  incomplete: { label: '需補資料' },
  // 管理人員
  new_case: { label: '新通報' }, // 待受理的案件（2026-10-15 從「新報修」改，用詞統一叫「通報」）；管委會只有主委、副主委有
  in_progress: { label: '處理中' }, // 2026-10-15 從「施工中」改名（docs/case-flow.md）
  to_verify: { label: '待標記完成' }, // 2026-10-15 起不會出現在待辦（待結案是負責人的事），只有「已完成」還用這個種類
}

// 建立一筆待辦
//   kind 種類 / title 標題 / hint 第二行的說明
//   createdAt 建立時間：交辦、提案、公告是建立或送出的時間，案件是通報時間，留存是留存時間；
//             快到期的合約、文件是系統依日期提醒的，沒有建立時間，是 null
//   dueAt 到期時間（沒有期限就是 null）
//   link 點了要去哪裡：type 資料種類、id 編號
//   isUrgent 是否緊急（案件由通報的人標示；其他種類不傳，預設是 false）
//   isNew 是不是剛交辦、我還沒看過（只有交辦會用到，預設是 false）
function todo(kind, title, hint, createdAt, dueAt, link, isUrgent = false, isNew = false) {
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
    isNew,
  }
}

// ── 待辦第二行的說明 ─────────────────────────────
// 原則（2026-10-15 決定）：放卡片上其他地方看不到的「誰、什麼時候、做到哪裡」，不重複徽章（狀態）和標題
// 每種情況都一定有一句，卡片高度才會一樣；畫面上只顯示一行，太長用「…」截掉

// 期限的文字：今天的寫「今天 18:00」，其他寫「10/3 18:00」
function deadlineText(value) {
  if (value.startsWith(MOCK_TODAY)) return `今天 ${formatTime(value)}`
  return formatDateTime(value)
}

// 案件的說明，看案件走到哪一步：
//   待受理         → 誰通報、多久以前：「陳先生（B 棟 8 樓）・2 小時前通報」
//   已派廠商       → 廠商＋預約到場時間：「大同電梯・10/3 14:00 到場」
//   受理了、沒廠商 → 誰受理：「張管理員受理・尚未派廠商」
function caseHint(item) {
  if (item.status === 'pending') {
    const when = formatRelativeTime(item.reportedAt, MOCK_NOW) // 「2 小時前」「昨天 09:00」「9/25」
    // 「2 小時前」後面直接接「通報」；日期、時間後面空一格比較好讀
    const gap = when.endsWith('前') ? '' : ' '
    return `${reporterLabel(item)}・${when}${gap}通報`
  }
  const vendor = vendors.find((entry) => entry.id === item.vendorId)
  const name = vendor ? vendor.name : item.vendorName // 自己打的廠商存在 vendorName
  if (name) return item.scheduledAt ? `${name}・${formatDateTime(item.scheduledAt)} 到場` : `${name}・尚未約到場時間`
  return `${userLabel(item.assigneeId)}受理・尚未派廠商`
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

// 這件交辦是不是「剛交辦、我還沒看過」：還有一則沒讀的「新的交辦」通知（2026-10-15）
//   點那則通知、或打開交辦詳情，通知就會變成已讀，這件交辦就不算新的了
function isUnseenTask(userId, taskId) {
  return notifications.some(
    (item) => item.userId === userId && item.title === NEW_TASK_TITLE && item.link?.id === taskId && !item.read,
  )
}

// 交辦給我、還在進行中的
//   被退回過的，提示改成退回原因，讓對方知道要改什麼
function assignedTasks(userId) {
  return tasks
    .filter((task) => task.assigneeId === userId && task.status === 'in_progress')
    .map((task) => {
      // 例如「李主委交辦・今天 18:00 前完成」；沒有期限的只寫「李主委交辦」
      const due = task.deadline ? `・${deadlineText(task.deadline)} 前完成` : ''
      const hint = task.returnNote ? `已退回：${task.returnNote.note}` : `${userLabel(task.assignerId)}交辦${due}`
      const link = { type: 'task', id: task.id }
      return todo('assigned', task.title, hint, task.createdAt, task.deadline || null, link, false, isUnseenTask(userId, task.id))
    })
}

function committeeTodos(userId) {
  const user = findUser(userId)
  const items = [...assignedTasks(userId)]

  // 我交辦出去、對方已回報完成，等我確認的
  // 連到案件、案件在等結案的不算：結案時交辦會一起確認完成，待辦裡只放「待我結案」那一筆
  for (const task of tasks) {
    const waitingClose = cases.some((item) => item.id === task.caseId && item.status === 'to_verify')
    if (task.assignerId === userId && task.status === 'reported' && !waitingClose) {
      items.push(
        todo('confirm', task.title, `${userLabel(task.assigneeId)}已回報完成`, task.createdAt, task.deadline || null, {
          type: 'task',
          id: task.id,
        }),
      )
    }
  }

  // 待受理的案件：只有能受理的主委、副主委有（管理人員在 staffTodos）
  // 沒有期限，用通報時間排序（越早通報的越前面）；畫面上的徽章是「尚未受理」，不是「逾期」
  if (['chair', 'viceChair'].includes(user.committeeTitle)) {
    for (const item of cases) {
      if (item.status === 'pending') {
        items.push(todo('new_case', item.title, caseHint(item), item.reportedAt, item.reportedAt, { type: 'case', id: item.id }, item.isUrgent))
      }
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
          todo('review', item.title, `${userLabel(item.authorId)}送出`, item.createdAt, item.startAt, {
            type: 'announcement',
            id: item.id,
          }),
        )
      }
    }
  }

  // 我負責、還沒結案的案件
  for (const item of cases) {
    const open = item.status !== 'closed'
    if (item.assigneeId === userId && open) {
      // 管理人員已完工驗收、等我結案的：換成「待我結案」，說明寫是誰完工驗收的
      if (item.status === 'to_verify') {
        const completedBy = item.logs.findLast((log) => log.label === '完工驗收')?.actorId
        const hint = completedBy ? `${userLabel(completedBy)}已完工驗收，請結案` : '已完工驗收，請結案'
        items.push(todo('to_close', item.title, hint, item.reportedAt, item.deadline ?? null, { type: 'case', id: item.id }, item.isUrgent))
        continue
      }
      items.push(todo('my_case', item.title, caseHint(item), item.reportedAt, item.deadline ?? null, { type: 'case', id: item.id }, item.isUrgent))
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

  // 管理人員要處理的案件（規則見 docs/case-flow.md）：
  //   待受理 → 新報修（誰都可以受理）
  //   處理中 → 處理中；已受理、負責人是我（我受理、還沒派廠商）也算
  //   待結案不列入：那是等負責人（主委或副主委）結案，管理人員已經做完了
  for (const item of cases) {
    let kind = ''
    if (item.status === 'pending') kind = 'new_case'
    else if (item.status === 'in_progress') kind = 'in_progress'
    else if (item.status === 'accepted' && item.assigneeId === userId) kind = 'in_progress'
    if (!kind) continue
    const hint = caseHint(item)
    // 新報修沒有期限，用通報時間排序；其他用處理期限
    const dueAt = kind === 'new_case' ? item.reportedAt : (item.deadline ?? null)
    items.push(todo(kind, item.title, hint, item.reportedAt, dueAt, { type: 'case', id: item.id }, item.isUrgent))
  }

  return [...items, ...incompleteQuickSaves(userId)]
}

// 取得我的待辦
//   role 是 'committee' 或 'staff'（住戶沒有待辦）
// 回傳：
//   items  待辦清單：還沒看過的新交辦排最前面（新的在前），
//          其他照到期日，近的排前面，沒有期限的排最後
//   counts 每一種各有幾件，例如 { sign: 2, expiring: 3 }
//   total  總共幾件
export async function getMyTodos(userId, role) {
  await delay()
  const raw = role === 'staff' ? staffTodos(userId) : committeeTodos(userId)
  const items = raw.toSorted((a, b) => {
    // 新交辦排前面：首頁只顯示前 2 張，不這樣排會被日期比較早的案件擋住（2026-10-15）
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1
    if (a.isNew) return b.createdAt.localeCompare(a.createdAt)
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
      items.push(doneTodo('confirm', task.title, `已確認${userLabel(task.assigneeId)}的回報`, task.doneAt, { type: 'task', id: task.id }))
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
