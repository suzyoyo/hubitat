// 文件相關的假 API：法定文件、公開文件、社區規約、社區規則
import { diffDays } from '@/lib/date'
import {
  DOCUMENT_EXPIRING_DAYS,
  LEGAL_DOCUMENT_TYPES,
  PUBLIC_DOCUMENT_CATEGORIES,
  bylaws,
  communityRules,
  legalDocuments,
  publicDocuments,
} from '../data/documents'
import { MOCK_TODAY, delay } from './helpers'

// 算出法定文件的狀態
export function legalDocumentStatus(doc) {
  if (!doc.file) return 'missing' // 缺件
  if (doc.expiresAt < MOCK_TODAY) return 'expired'
  const daysLeft = diffDays(MOCK_TODAY, doc.expiresAt)
  return daysLeft <= DOCUMENT_EXPIRING_DAYS ? 'expiring' : 'valid'
}

function presentLegal(doc) {
  return {
    ...doc,
    typeLabel: LEGAL_DOCUMENT_TYPES[doc.type].label,
    status: legalDocumentStatus(doc),
    daysLeft: diffDays(MOCK_TODAY, doc.expiresAt),
  }
}

// 取得法定文件（管委會、管理人員用），需要處理的排前面，其餘依到期日
export async function getLegalDocuments() {
  await delay()
  const order = ['missing', 'expired', 'expiring', 'valid']
  return legalDocuments.map(presentLegal).toSorted((a, b) => {
    if (a.status !== b.status) return order.indexOf(a.status) - order.indexOf(b.status)
    return a.expiresAt.localeCompare(b.expiresAt)
  })
}

// 取得公開文件（住戶端「公開文件」），依分類分組：財務報告、安全證明、會議通知
// 「安全證明」來自法定文件裡設為公開、而且已經上傳檔案的那些
export async function getPublicDocuments() {
  await delay()
  const safety = legalDocuments
    .filter((doc) => doc.isPublic && doc.file)
    .map((doc) => ({
      id: doc.id,
      category: 'safety',
      title: doc.name,
      tag: doc.result,
      expiresAt: doc.expiresAt,
      file: doc.file,
    }))

  // Object.keys：取出分類的代號 ['finance', 'safety', 'notice']，依這個順序分組
  return Object.keys(PUBLIC_DOCUMENT_CATEGORIES).map((category) => {
    const items =
      category === 'safety'
        ? safety
        : publicDocuments
            .filter((doc) => doc.category === category)
            .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    return { category, label: PUBLIC_DOCUMENT_CATEGORIES[category].label, items }
  })
}

// 取得現行有效的社區規約（含章節與條文）
export async function getCurrentBylaw() {
  await delay()
  return bylaws.find((item) => item.isCurrent)
}

// 取得歷屆社區規約（不含條文），新的在前
export async function getBylawVersions() {
  await delay()
  return bylaws
    .toSorted((a, b) => b.version - a.version)
    .map((item) => ({
      id: item.id,
      version: item.version,
      revisedAt: item.revisedAt,
      action: item.action,
      isCurrent: item.isCurrent,
      summary: item.summary,
      file: item.file,
    }))
}

// 取得社區規則與慣例
export async function getCommunityRules() {
  await delay()
  return communityRules
}
