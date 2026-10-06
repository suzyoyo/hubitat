// 廠商合約假資料
// 欄位說明：
//   id         唯一編號
//   vendorId   哪一家廠商（對應 vendors.js 的 id）
//   startDate  合約起日
//   endDate    合約訖日
//   amount     合約金額（元／年）。只有管委會看得到
//   service    服務內容
//   frequency  承諾頻率，例如「每月保養 1 次」（沒有就不寫）
//   visits     合約期間應到場的次數（用來顯示「保養完成 11 / 12 次」，沒有就不寫）
//   files      合約檔案。只有管委會看得到
//   uploadedBy 上傳的人（對應 users.js 的 id）
//   uploadedAt 上傳日期
//
// 合約狀態不存在資料裡，而是用今天的日期算出來的，
// 這樣日子一天天過去，狀態會自動改變。計算方式在 src/mocks/api/contracts.js

// 合約狀態的顯示文字
export const CONTRACT_STATUSES = {
  upcoming: { label: '尚未生效' },
  active: { label: '合約內' },
  expiring: { label: '即將到期' },
  expired: { label: '已到期' },
}

// 到期前幾天算「即將到期」
export const CONTRACT_EXPIRING_DAYS = 30

export const contracts = [
  // 大同電梯：目前這一期，加上前兩期（歷次合約）
  {
    id: 'ct-001',
    vendorId: 'v-001',
    startDate: '2025-10-09',
    endDate: '2026-10-08',
    amount: 92000,
    service: '電梯定期保養與故障維修',
    frequency: '每月保養 1 次',
    visits: 12,
    files: [{ name: '大同電梯_2025合約.pdf', pages: 2 }],
    uploadedBy: 'u-c01',
    uploadedAt: '2025-10-05',
  },
  {
    id: 'ct-002',
    vendorId: 'v-001',
    startDate: '2024-10-09',
    endDate: '2025-10-08',
    amount: 88000,
    service: '電梯定期保養與故障維修',
    frequency: '每月保養 1 次',
    visits: 12,
    files: [{ name: '大同電梯_2024合約.pdf', pages: 2 }],
    uploadedBy: 'u-c01',
    uploadedAt: '2024-10-02',
  },
  {
    id: 'ct-003',
    vendorId: 'v-001',
    startDate: '2023-10-09',
    endDate: '2024-10-08',
    amount: 85000,
    service: '電梯定期保養與故障維修',
    frequency: '每月保養 1 次',
    visits: 12,
    files: [{ name: '大同電梯_2023合約.pdf', pages: 2 }],
    uploadedBy: 'u-c01',
    uploadedAt: '2023-10-03',
  },
  {
    id: 'ct-004',
    vendorId: 'v-005',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    amount: 480000,
    service: '駐衛保全、門禁與監視系統維護',
    files: [{ name: '全安保全_2026合約.pdf', pages: 6 }],
    uploadedBy: 'u-c01',
    uploadedAt: '2025-12-20',
  },
  {
    id: 'ct-005',
    vendorId: 'v-004',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    amount: 240000,
    service: '公共區域清潔、垃圾清運、水塔清洗',
    frequency: '每日清潔、每半年清洗水塔',
    files: [{ name: '潔淨清潔_2026合約.pdf', pages: 4 }],
    uploadedBy: 'u-c03',
    uploadedAt: '2026-03-25',
  },
  {
    id: 'ct-006',
    vendorId: 'v-007',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    amount: 120000,
    service: '機電維護（含電梯機房電力）',
    frequency: '每季巡檢 1 次',
    visits: 4,
    files: [{ name: '欣欣機電_2026合約.pdf', pages: 3 }],
    uploadedBy: 'u-c01',
    uploadedAt: '2026-02-24',
  },
  {
    id: 'ct-007',
    vendorId: 'v-006',
    startDate: '2025-11-01',
    endDate: '2026-10-31',
    amount: 60000,
    service: '中庭植栽養護與定期修剪',
    frequency: '每月修剪 1 次',
    visits: 12,
    files: [{ name: '綠意園藝_2025合約.pdf', pages: 2 }],
    uploadedBy: 'u-c03',
    uploadedAt: '2025-10-28',
  },
  {
    id: 'ct-008',
    vendorId: 'v-002',
    startDate: '2026-11-01',
    endDate: '2027-10-31',
    amount: 48000,
    service: '消防設備檢修、年度消防安全檢查申報',
    frequency: '每季檢修 1 次',
    visits: 4,
    files: [{ name: '永安消防_2026合約.pdf', pages: 2 }],
    uploadedBy: 'u-s01',
    uploadedAt: '2026-09-28',
  },
]
