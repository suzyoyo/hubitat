// 交接包：換屆時整理給下一屆的資料
// 內容都是從其他資料彙整的，只有「卸任者的話」是手寫的
import { cases } from '../data/cases'
import { contracts } from '../data/contracts'
import { legalDocuments } from '../data/documents'
import { handoverNote } from '../data/handover'
import { meetings } from '../data/meetings'
import { TERM } from '../data/users'
import { vendors } from '../data/vendors'
import { areaName } from './community'
import { contractStatus } from './contracts'
import { legalDocumentStatus } from './documents'
import { MOCK_TODAY, delay } from './helpers'
import { userLabel } from './users'

// 取得交接包的內容
// 回傳的 sections 有五個部分，每個部分都有 label 名稱、unit 單位、items 清單
export async function getHandoverPackage() {
  await delay()

  // 1. 未結案案件
  const openCases = cases
    .filter((item) => !['closed', 'cancelled'].includes(item.status))
    .map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      areaName: areaName(item.areaId),
      assigneeLabel: item.assigneeId ? userLabel(item.assigneeId) : '尚未指派',
    }))

  // 2. 還沒開始執行的決議
  const pendingResolutions = meetings.flatMap((meeting) =>
    meeting.resolutions
      .filter((item) => item.execution === 'not_started')
      .map((item) => ({
        id: item.id,
        title: item.title,
        execution: item.execution,
        meetingTitle: meeting.title,
        ownerLabel: userLabel(item.ownerId),
      })),
  )

  // 3. 任內的會議（這一屆任期開始之後召開的）
  const termMeetings = meetings
    .filter((meeting) => meeting.heldAt >= TERM.startDate)
    .map((meeting) => ({ id: meeting.id, title: meeting.title, heldAt: meeting.heldAt, summary: meeting.summary ?? '' }))

  // 4. 即將到期的合約與文件
  const expiringContracts = contracts
    .filter((contract) => contractStatus(contract) === 'expiring')
    .map((contract) => ({
      id: contract.id,
      title: `${vendors.find((vendor) => vendor.id === contract.vendorId).name}・${contract.service}`,
      expiresAt: contract.endDate,
    }))
  const expiringDocuments = legalDocuments
    .filter((doc) => ['expiring', 'missing'].includes(legalDocumentStatus(doc)))
    .map((doc) => ({ id: doc.id, title: doc.name, expiresAt: doc.expiresAt }))

  // 5. 合作中的廠商
  const activeVendors = vendors
    .filter((vendor) => vendor.status === 'active')
    .map((vendor) => ({ id: vendor.id, name: vendor.name, services: vendor.services }))

  return {
    term: TERM,
    updatedAt: MOCK_TODAY,
    note: { ...handoverNote, updatedByLabel: userLabel(handoverNote.updatedBy) },
    sections: [
      { key: 'openCases', label: '未結案案件', unit: '件', items: openCases },
      { key: 'pendingResolutions', label: '未執行決議', unit: '件', items: pendingResolutions },
      { key: 'meetings', label: '任內會議摘要', unit: '份', items: termMeetings },
      {
        key: 'expiring',
        label: '即將到期的合約與文件',
        unit: '份',
        items: [...expiringContracts, ...expiringDocuments],
      },
      { key: 'vendors', label: '合作中廠商名冊', unit: '家', items: activeVendors },
    ],
  }
}
