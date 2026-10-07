// 提案相關的假 API（只有管委會會用到）
import { diffDays } from '@/lib/date'
import { proposals } from '../data/proposals'
import { COMMITTEE_TITLES, users } from '../data/users'
import { MOCK_TODAY, delay } from './helpers'
import { describeUser, userLabel } from './users'

// 這一屆所有委員（每個人都要簽核），依職稱順序排列：主委、副主委、財務、修繕、監察
function committeeMembers() {
  const order = Object.keys(COMMITTEE_TITLES)
  return users
    .filter((user) => user.roles.includes('committee'))
    .toSorted((a, b) => order.indexOf(a.committeeTitle) - order.indexOf(b.committeeTitle))
}

// 統計同意、不同意各幾票；選項式的提案則統計每個選項幾票
function tally(proposal) {
  if (proposal.kind === 'options') {
    return proposal.options.map((option) => ({
      key: option.key,
      name: option.name,
      count: proposal.signatures.filter((sign) => sign.decision === option.key).length,
    }))
  }
  return {
    agree: proposal.signatures.filter((sign) => sign.decision === 'agree').length,
    disagree: proposal.signatures.filter((sign) => sign.decision === 'disagree').length,
  }
}

// 算出提案狀態
//   還有人沒簽 → 簽核中
//   都簽了     → 同意過半是已通過，否則已否決（選項式的提案都簽完就算通過）
export function proposalStatus(proposal) {
  const total = committeeMembers().length
  if (proposal.signatures.length < total) return 'signing'
  if (proposal.kind === 'options') return 'passed'
  const agree = proposal.signatures.filter((sign) => sign.decision === 'agree').length
  return agree > total / 2 ? 'passed' : 'rejected'
}

// userId：目前是哪位委員在看，用來判斷「我簽了沒」
function present(proposal, userId) {
  const members = committeeMembers()
  const mySignature = proposal.signatures.find((sign) => sign.userId === userId)
  const status = proposalStatus(proposal)
  return {
    ...proposal,
    status,
    proposerLabel: userLabel(proposal.proposerId),
    signedCount: proposal.signatures.length,
    totalCount: members.length,
    tally: tally(proposal),
    daysLeft: diffDays(MOCK_TODAY, proposal.deadline),
    mySignature: mySignature ?? null,
    needsMySign: status === 'signing' && !mySignature, // 等我簽核
    // 每位委員的簽核進度（詳情頁的那一排頭像）
    signers: members.map((member) => {
      const sign = proposal.signatures.find((item) => item.userId === member.id)
      return {
        userId: member.id,
        shortName: describeUser(member, 'committee').shortName, // 王主委
        isMe: member.id === userId,
        signedAt: sign ? sign.at : null,
      }
    }),
    // 已簽核委員的意見：不具名，所以只給文字，不給是誰寫的
    comments: proposal.signatures.filter((sign) => sign.comment).map((sign) => sign.comment),
  }
}

// 取得提案列表，新的在前
// filter 可以不傳（全部），或傳 'mine' 等我簽核 / 'signing' 簽核中 / 'passed' 已通過 / 'rejected' 已否決
export async function getProposals(userId, filter) {
  await delay()
  return proposals
    .map((proposal) => present(proposal, userId))
    .filter((proposal) => {
      if (!filter) return true
      if (filter === 'mine') return proposal.needsMySign
      return proposal.status === filter
    })
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// 取得單一提案的詳情
export async function getProposalById(id, userId) {
  await delay()
  const proposal = proposals.find((item) => item.id === id)
  return proposal ? present(proposal, userId) : undefined
}
