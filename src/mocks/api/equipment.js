// 設備相關的假 API
import { addMonths, diffDays } from '@/lib/date'
import { equipment, MAINTENANCE_CYCLES, MAINTENANCE_DUE_SOON_DAYS } from '../data/equipment'
import { vendors } from '../data/vendors'
import { areaName } from './community'
import { MOCK_TODAY, delay, omit } from './helpers'

// 算出下次保養日；不需要定期保養的設備回傳 null
export function nextMaintenanceDate(item) {
  if (!item.cycle || !item.lastMaintainedAt) return null
  return addMonths(item.lastMaintainedAt, MAINTENANCE_CYCLES[item.cycle].months)
}

// 算出清冊上要顯示的狀態
// 設備本身有狀況（待維修、維修中、已報廢）時優先顯示；正常的設備再看保養日期
export function equipmentDisplayStatus(item) {
  if (item.status !== 'normal') return item.status
  const nextDate = nextMaintenanceDate(item)
  if (!nextDate) return 'normal'
  const daysLeft = diffDays(MOCK_TODAY, nextDate)
  if (daysLeft < 0) return 'overdue' // 保養逾期
  if (daysLeft <= MAINTENANCE_DUE_SOON_DAYS) return 'due_soon' // 保養將到期
  return 'normal'
}

function vendorName(vendorId) {
  const vendor = vendors.find((item) => item.id === vendorId)
  return vendor ? vendor.name : ''
}

// 把一台設備整理成畫面要用的樣子
function present(item, role) {
  const nextDate = nextMaintenanceDate(item)
  return {
    ...item,
    areaName: areaName(item.areaId),
    vendorName: vendorName(item.vendorId),
    displayStatus: equipmentDisplayStatus(item),
    nextMaintenanceAt: nextDate,
    // 距離下次保養還有幾天；負數表示已經逾期幾天
    daysToMaintenance: nextDate ? diffDays(MOCK_TODAY, nextDate) : null,
    // 保固是否還有效
    inWarranty: item.warrantyUntil >= MOCK_TODAY,
    // 已使用幾年（無條件捨去）
    yearsInUse: Math.floor(diffDays(item.installedAt, MOCK_TODAY) / 365),
    // 紀錄依日期排序，新的在前
    records: item.records
      .toSorted((a, b) => b.date.localeCompare(a.date))
      .map((record) => {
        const full = { ...record, vendorName: vendorName(record.vendorId) }
        // 費用只有管委會看得到
        return role === 'committee' ? full : omit(full, ['cost'])
      }),
  }
}

// 狀態的排序：需要處理的排前面
const STATUS_ORDER = ['needs_repair', 'repairing', 'overdue', 'due_soon', 'normal', 'retired']

// 取得設備清冊，需要處理的排前面
export async function getEquipmentList(role = 'committee') {
  await delay()
  return equipment
    .map((item) => present(item, role))
    .toSorted(
      (a, b) => STATUS_ORDER.indexOf(a.displayStatus) - STATUS_ORDER.indexOf(b.displayStatus),
    )
}

// 取得單一設備的詳情
export async function getEquipmentById(id, role = 'committee') {
  await delay()
  const item = equipment.find((entry) => entry.id === id)
  return item ? present(item, role) : undefined
}
