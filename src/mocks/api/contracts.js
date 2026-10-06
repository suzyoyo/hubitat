// 合約相關的假 API
import { diffDays } from '@/lib/date'
import { CONTRACT_EXPIRING_DAYS, contracts } from '../data/contracts'
import { vendors } from '../data/vendors'
import { MOCK_TODAY, delay, omit } from './helpers'
import { userLabel } from './users'

// 用今天的日期算出合約狀態
export function contractStatus(contract) {
  if (contract.startDate > MOCK_TODAY) return 'upcoming' // 尚未生效
  if (contract.endDate < MOCK_TODAY) return 'expired' // 已到期
  const daysLeft = diffDays(MOCK_TODAY, contract.endDate)
  return daysLeft <= CONTRACT_EXPIRING_DAYS ? 'expiring' : 'active'
}

// 找出某家廠商「目前」的合約：優先找還沒到期的，沒有的話回傳 undefined
export function currentContractOf(vendorId) {
  return contracts
    .filter((contract) => contract.vendorId === vendorId && contractStatus(contract) !== 'expired')
    .toSorted((a, b) => a.startDate.localeCompare(b.startDate))[0]
}

// 把一筆合約整理成畫面要用的樣子
// 金額和合約檔案只有管委會看得到，其他角色會被拿掉
function present(contract, role) {
  const vendor = vendors.find((item) => item.id === contract.vendorId)
  const full = {
    ...contract,
    vendorName: vendor.name,
    status: contractStatus(contract),
    daysLeft: diffDays(MOCK_TODAY, contract.endDate), // 距離到期還有幾天
    uploadedByLabel: userLabel(contract.uploadedBy),
  }
  return role === 'committee' ? full : omit(full, ['amount', 'files'])
}

// 取得合約列表：每家廠商只列目前的那一份（歷次合約在詳情頁看），到期日近的排前面
export async function getContracts(role = 'committee') {
  await delay()
  return vendors
    .map((vendor) => currentContractOf(vendor.id))
    .filter(Boolean) // 沒有合約的廠商會是 undefined，這裡把它們濾掉
    .toSorted((a, b) => a.endDate.localeCompare(b.endDate))
    .map((contract) => present(contract, role))
}

// 取得單一合約的詳情，並附上同一家廠商的歷次合約
export async function getContractById(id, role = 'committee') {
  await delay()
  const contract = contracts.find((item) => item.id === id)
  if (!contract) return undefined
  const history = contracts
    .filter((item) => item.vendorId === contract.vendorId && item.id !== id)
    .toSorted((a, b) => b.startDate.localeCompare(a.startDate))
    .map((item) => present(item, role))
  return { ...present(contract, role), history }
}
