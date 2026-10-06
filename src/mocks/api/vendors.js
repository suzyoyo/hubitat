// 廠商相關的假 API
import { equipment } from '../data/equipment'
import { vendors } from '../data/vendors'
import { caseStatsOfVendor } from './cases'
import { contractStatus, currentContractOf } from './contracts'
import { delay } from './helpers'

// 取得廠商名冊
// status 可以不傳（全部），或傳 'active' 合作中 / 'candidate' 候選 / 'inactive' 停用
// 每筆會多一個 contractStatus：目前合約的狀態；沒有合約是 'none'
export async function getVendors(status) {
  await delay()
  return vendors
    .filter((vendor) => !status || vendor.status === status)
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)) // 新增日期新的在前
    .map((vendor) => {
      const contract = currentContractOf(vendor.id)
      return { ...vendor, contractStatus: contract ? contractStatus(contract) : 'none' }
    })
}

// 取得單一廠商的詳情：附上目前合約的編號、負責的設備、服務紀錄
// 合約的完整內容請另外用 getContractById 取得（金額只有管委會看得到）
export async function getVendorById(id) {
  await delay()
  const vendor = vendors.find((item) => item.id === id)
  if (!vendor) return undefined

  const contract = currentContractOf(id)
  const ownEquipment = equipment.filter((item) => item.vendorId === id)

  // 服務紀錄：把這家廠商在各設備留下的紀錄收集起來，新的在前
  const serviceRecords = equipment
    .flatMap((item) =>
      item.records
        .filter((record) => record.vendorId === id)
        .map((record) => ({
          id: record.id,
          date: record.date,
          type: record.type,
          title: record.title,
          equipmentId: item.id,
          equipmentName: item.name,
        })),
    )
    .toSorted((a, b) => b.date.localeCompare(a.date))

  // 合約期間內完成了幾次保養（用來顯示「保養完成 11 / 12 次」）
  // 廠商一次到場可能保養好幾台設備，所以同一個月只算一次
  let maintenanceDone = 0
  if (contract) {
    const months = serviceRecords
      .filter(
        (record) =>
          record.type === 'maintenance' &&
          record.date >= contract.startDate &&
          record.date <= contract.endDate,
      )
      .map((record) => record.date.slice(0, 7)) // '2026-09-10' → '2026-09'
    // Set 會自動去掉重複的值，size 是剩下幾個
    maintenanceDone = new Set(months).size
  }

  const repairStats = caseStatsOfVendor(id)

  return {
    ...vendor,
    contractId: contract ? contract.id : null,
    contractStatus: contract ? contractStatus(contract) : 'none',
    equipment: ownEquipment.map((item) => ({ id: item.id, name: item.name, spec: item.spec })),
    serviceRecords,
    stats: {
      maintenanceDone,
      maintenancePlanned: contract && contract.visits ? contract.visits : null,
      // 報修統計（從案件算出來）
      repairCount: repairStats.count, // 結案的報修件數
      averageRepairDays: repairStats.averageDays, // 從通報到完成的平均天數
      averageScore: repairStats.averageScore, // 平均評分
    },
  }
}

// 取得廠商緊急聯絡清單：把各廠商標記為緊急的窗口挑出來
export async function getEmergencyContacts() {
  await delay()
  return vendors
    .filter((vendor) => vendor.status === 'active')
    .flatMap((vendor) =>
      vendor.contacts
        .filter((contact) => contact.isEmergency)
        .map((contact) => ({
          vendorId: vendor.id,
          vendorName: vendor.name,
          contactName: contact.name,
          phone: contact.phone,
        })),
    )
}
