// 搜尋：在社區檔案裡找關鍵字
// 不同角色能搜尋的範圍不同：
//   住戶     → 已發布的會議、公開文件、社區規約條文、設備
//   管理人員 → 案件、已發布的會議、文件、合約
//   管委會   → 案件、所有會議、文件、合約
import { formatFullDate } from '@/lib/date'
import { CASE_STATUSES, cases } from '../data/cases'
import { contracts } from '../data/contracts'
import { bylaws, legalDocuments, publicDocuments } from '../data/documents'
import { equipment } from '../data/equipment'
import { meetings } from '../data/meetings'
import { vendors } from '../data/vendors'
import { areaName } from './community'
import { currentContractOf } from './contracts'
import { delay } from './helpers'

// 一筆搜尋結果：title 標題 / snippet 符合的內容 / meta 第三行的補充資訊
function result(id, title, snippet, meta) {
  return { id, title, snippet, meta }
}

function searchCases(keyword) {
  return cases
    .filter((item) => item.title.includes(keyword) || item.description.includes(keyword))
    .map((item) =>
      result(item.id, item.title, item.description, `${CASE_STATUSES[item.status].label}・${areaName(item.areaId)}`),
    )
}

// publishedOnly：只搜尋已發布的會議（住戶、管理人員）
function searchMeetings(keyword, publishedOnly) {
  const results = []
  for (const meeting of meetings) {
    if (publishedOnly && meeting.status !== 'published') continue
    const date = formatFullDate(meeting.heldAt)
    // 找這場會議裡符合的決議；找到就以「決議」的形式列出
    const matched = meeting.resolutions.filter(
      (item) => item.title.includes(keyword) || item.note.includes(keyword),
    )
    for (const item of matched) {
      results.push(result(meeting.id, meeting.title, `決議：${item.title}`, `${date}・決議事項`))
    }
    // 決議沒符合，但會議名稱或摘要有符合
    const inMeeting = meeting.title.includes(keyword) || (meeting.summary ?? '').includes(keyword)
    if (matched.length === 0 && inMeeting) {
      results.push(result(meeting.id, meeting.title, meeting.summary ?? '', `${date}・會議紀錄`))
    }
  }
  return results
}

function searchLegalDocuments(keyword) {
  return legalDocuments
    .filter((doc) => doc.name.includes(keyword))
    .map((doc) => result(doc.id, doc.name, doc.result ?? '', `有效至 ${formatFullDate(doc.expiresAt)}・法定文件`))
}

function searchPublicDocuments(keyword) {
  const docs = publicDocuments
    .filter((doc) => doc.title.includes(keyword))
    .map((doc) => result(doc.id, doc.title, doc.tag, `公告於 ${formatFullDate(doc.publishedAt)}`))
  const safety = legalDocuments
    .filter((doc) => doc.isPublic && doc.file && doc.name.includes(keyword))
    .map((doc) => result(doc.id, doc.name, doc.result ?? '', `效期至 ${formatFullDate(doc.expiresAt)}`))
  return [...docs, ...safety]
}

// 在現行規約的條文裡搜尋
function searchBylaw(keyword) {
  const current = bylaws.find((item) => item.isCurrent)
  return current.chapters.flatMap((chapter) =>
    chapter.articles
      .filter((article) => article.title.includes(keyword) || article.text.includes(keyword))
      .map((article) =>
        result(`${current.id}-${article.no}`, `第 ${article.no} 條【${article.title}】`, article.text, chapter.title),
      ),
  )
}

function searchContracts(keyword) {
  return vendors
    .map((vendor) => ({ vendor, contract: currentContractOf(vendor.id) }))
    .filter(({ contract }) => contract)
    .filter(({ vendor, contract }) => vendor.name.includes(keyword) || contract.service.includes(keyword))
    .map(({ vendor, contract }) =>
      result(
        contract.id,
        vendor.name,
        contract.service,
        `${formatFullDate(contract.startDate)}～${formatFullDate(contract.endDate)}`,
      ),
    )
}

function searchEquipment(keyword) {
  return equipment
    .filter((item) => item.status !== 'retired')
    .filter((item) => item.name.includes(keyword) || item.place.includes(keyword))
    .map((item) => result(item.id, item.name, item.place, '設備'))
}

// 搜尋
// 回傳：keyword 關鍵字 / total 總共幾筆 / groups 依種類分組的結果（每組有 key、label、items）
// 沒有輸入關鍵字時，回傳 0 筆
export async function search(keyword, role = 'resident') {
  await delay()
  const text = keyword.trim()

  let groups = []
  if (text !== '') {
    if (role === 'resident') {
      groups = [
        { key: 'meeting', label: '會議', items: searchMeetings(text, true) },
        { key: 'document', label: '文件', items: searchPublicDocuments(text) },
        { key: 'bylaw', label: '規約', items: searchBylaw(text) },
        { key: 'equipment', label: '設備', items: searchEquipment(text) },
      ]
    } else {
      groups = [
        { key: 'case', label: '案件', items: searchCases(text) },
        { key: 'meeting', label: '會議', items: searchMeetings(text, role !== 'committee') },
        { key: 'document', label: '文件', items: searchLegalDocuments(text) },
        { key: 'contract', label: '合約', items: searchContracts(text) },
      ]
    }
  }

  // reduce：把每一組的筆數加總
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)
  return { keyword: text, total, groups }
}
