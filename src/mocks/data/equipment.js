// 設備假資料：設備清冊，以及每台設備的保養與維修紀錄
// 欄位說明：
//   id               唯一編號
//   name             設備名稱
//   category         設備類別，見下方 EQUIPMENT_CATEGORIES
//   areaId           所在範圍（對應 community.js 的 areas）
//   place            安裝位置的文字說明
//   spec             規格說明（沒有就不寫）
//   vendorId         負責廠商（對應 vendors.js，沒有就不寫）
//   status           設備本身的狀態，見下方 EQUIPMENT_STATUSES
//   installedAt      安裝日期（用來算「已使用幾年」）
//   warrantyUntil    保固到期日
//   cycle            保養週期，見下方 MAINTENANCE_CYCLES（不需要定期保養就不寫）
//   lastMaintainedAt 上次保養日。下次保養日 = 上次保養日 + 週期，由程式計算
//   records          保養與維修紀錄（新的在前）
//                      date 日期 / type 'maintenance' 例行保養 或 'repair' 維修
//                      title 做了什麼 / vendorId 哪家廠商處理
//                      cost 費用（只有管委會看得到，沒有就不寫）
//                      caseId 因為哪個案件而維修（沒有就不寫）

export const EQUIPMENT_CATEGORIES = {
  elevator: { label: '電梯' },
  fire: { label: '消防' },
  water: { label: '給排水' },
  power: { label: '電力' },
  lighting: { label: '照明' },
  security: { label: '安防' },
  pool: { label: '泳池' },
}

// 設備本身的狀態（存在資料裡的）
export const EQUIPMENT_STATUSES = {
  normal: { label: '正常使用中' },
  needs_repair: { label: '待維修' },
  repairing: { label: '維修中' },
  retired: { label: '已報廢' },
}

// 清冊上顯示的狀態：除了上面四種，還有兩種是用保養日期算出來的
export const EQUIPMENT_DISPLAY_STATUSES = {
  ...EQUIPMENT_STATUSES,
  overdue: { label: '保養逾期' },
  due_soon: { label: '保養將到期' },
}

// 保養週期：months 是每隔幾個月
export const MAINTENANCE_CYCLES = {
  monthly: { label: '每月', months: 1 },
  quarterly: { label: '每季', months: 3 },
  half_year: { label: '每半年', months: 6 },
  yearly: { label: '每年', months: 12 },
}

// 距離下次保養幾天內算「保養將到期」
export const MAINTENANCE_DUE_SOON_DAYS = 7

export const equipment = [
  {
    id: 'e-001',
    name: '電梯（A 棟）',
    category: 'elevator',
    areaId: 'area-a',
    place: 'A 棟 1 樓機房',
    spec: '曳引式 12 人客梯',
    vendorId: 'v-001',
    status: 'normal',
    installedAt: '2019-03-01',
    warrantyUntil: '2027-03-31',
    cycle: 'monthly',
    lastMaintainedAt: '2026-09-10',
    records: [
      { id: 'er-001', date: '2026-09-10', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
      {
        id: 'er-002',
        date: '2026-07-02',
        type: 'repair',
        title: '更換曳引機鋼索',
        vendorId: 'v-001',
        cost: 28000,
        caseId: 'CASE-20260630-001',
      },
      { id: 'er-003', date: '2026-05-10', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
      {
        id: 'er-004',
        date: '2026-03-15',
        type: 'repair',
        title: '車廂門感應器維修',
        vendorId: 'v-001',
        cost: 4500,
        caseId: 'CASE-20260312-001',
      },
      { id: 'er-101', date: '2026-08-12', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
      { id: 'er-102', date: '2026-06-10', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
      { id: 'er-103', date: '2026-04-08', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
      { id: 'er-104', date: '2026-03-11', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
      { id: 'er-105', date: '2026-02-11', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
      { id: 'er-106', date: '2026-01-14', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
      { id: 'er-107', date: '2025-12-10', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
      { id: 'er-108', date: '2025-11-12', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
      { id: 'er-109', date: '2025-10-15', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
    ],
  },
  {
    id: 'e-002',
    name: '電梯（B 棟）',
    category: 'elevator',
    areaId: 'area-b',
    place: 'B 棟 1 樓機房',
    spec: '曳引式 12 人客梯',
    vendorId: 'v-001',
    status: 'normal',
    installedAt: '2019-03-01',
    warrantyUntil: '2027-03-31',
    cycle: 'monthly',
    lastMaintainedAt: '2026-09-05',
    records: [
      { id: 'er-005', date: '2026-09-05', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
      {
        id: 'er-006',
        date: '2026-06-12',
        type: 'repair',
        title: '門機異音檢修',
        vendorId: 'v-001',
        cost: 3200,
        caseId: 'CASE-20260610-001',
      },
      { id: 'er-007', date: '2026-05-10', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
    ],
  },
  {
    id: 'e-003',
    name: '電梯（C 棟）',
    category: 'elevator',
    areaId: 'area-c',
    place: 'C 棟 1 樓機房',
    spec: '曳引式 10 人無障礙',
    vendorId: 'v-001',
    status: 'normal',
    installedAt: '2019-06-01',
    warrantyUntil: '2027-06-30',
    cycle: 'monthly',
    lastMaintainedAt: '2026-09-12',
    records: [
      { id: 'er-008', date: '2026-09-12', type: 'maintenance', title: '定期保養', vendorId: 'v-001' },
      {
        id: 'er-023',
        date: '2026-01-20',
        type: 'repair',
        title: '更換樓層按鈕面板',
        vendorId: 'v-001',
        cost: 3500,
        caseId: 'CASE-20260117-001',
      },
    ],
  },
  {
    id: 'e-004',
    name: '消防幫浦',
    category: 'fire',
    areaId: 'area-parking',
    place: '地下室 B1 機房',
    vendorId: 'v-002',
    status: 'normal',
    installedAt: '2024-12-19',
    warrantyUntil: '2026-12-18',
    cycle: 'quarterly',
    lastMaintainedAt: '2026-06-20',
    records: [
      { id: 'er-009', date: '2026-06-20', type: 'maintenance', title: '季保養與水壓測試', vendorId: 'v-002' },
      { id: 'er-010', date: '2026-03-18', type: 'maintenance', title: '季保養', vendorId: 'v-002' },
    ],
  },
  {
    id: 'e-005',
    name: '水塔',
    category: 'water',
    areaId: 'area-outdoor',
    place: '頂樓水塔區',
    vendorId: 'v-004',
    status: 'normal',
    installedAt: '2018-09-01',
    warrantyUntil: '2020-08-31',
    cycle: 'half_year',
    lastMaintainedAt: '2026-07-15',
    records: [
      { id: 'er-011', date: '2026-07-15', type: 'maintenance', title: '水塔清洗與水質檢驗', vendorId: 'v-004', cost: 6000 },
      { id: 'er-012', date: '2026-01-14', type: 'maintenance', title: '水塔清洗與水質檢驗', vendorId: 'v-004', cost: 6000 },
    ],
  },
  {
    id: 'e-006',
    name: '揚水馬達',
    category: 'water',
    areaId: 'area-outdoor',
    place: '頂樓水塔區',
    vendorId: 'v-003',
    status: 'repairing',
    installedAt: '2021-04-10',
    warrantyUntil: '2023-04-09',
    cycle: 'half_year',
    lastMaintainedAt: '2026-05-20',
    records: [
      { id: 'er-013', date: '2026-09-29', type: 'repair', title: '馬達異音，拆回檢修軸承', vendorId: 'v-003' },
      { id: 'er-014', date: '2026-05-20', type: 'maintenance', title: '定期保養', vendorId: 'v-003' },
    ],
  },
  {
    id: 'e-007',
    name: '中庭照明',
    category: 'lighting',
    areaId: 'area-outdoor',
    place: '1F 中庭花園',
    vendorId: 'v-003',
    status: 'needs_repair',
    installedAt: '2025-11-04',
    warrantyUntil: '2027-11-03',
    records: [
      { id: 'er-015', date: '2025-11-04', type: 'repair', title: '全面更換節能 LED 燈具', vendorId: 'v-003', cost: 86000 },
    ],
  },
  {
    id: 'e-008',
    name: '發電機',
    category: 'power',
    areaId: 'area-parking',
    place: 'B2 發電機房',
    vendorId: 'v-007',
    status: 'normal',
    installedAt: '2018-09-01',
    warrantyUntil: '2021-08-31',
    cycle: 'quarterly',
    lastMaintainedAt: '2026-08-20',
    records: [
      { id: 'er-016', date: '2026-08-20', type: 'maintenance', title: '季巡檢與試運轉', vendorId: 'v-007' },
    ],
  },
  {
    id: 'e-009',
    name: '監視器主機',
    category: 'security',
    areaId: 'area-a',
    place: 'A 棟 1F 管理室',
    vendorId: 'v-005',
    status: 'normal',
    installedAt: '2025-07-28',
    warrantyUntil: '2027-07-27',
    cycle: 'yearly',
    lastMaintainedAt: '2026-07-20',
    records: [
      { id: 'er-017', date: '2026-07-20', type: 'maintenance', title: '年度檢測與韌體更新', vendorId: 'v-005' },
    ],
  },
  {
    id: 'e-010',
    name: '門禁讀卡系統',
    category: 'security',
    areaId: 'area-a',
    place: '各棟大門',
    vendorId: 'v-005',
    status: 'normal',
    installedAt: '2025-07-28',
    warrantyUntil: '2027-07-27',
    cycle: 'half_year',
    lastMaintainedAt: '2026-06-01',
    records: [
      { id: 'er-018', date: '2026-06-01', type: 'maintenance', title: '讀卡機檢測與清潔', vendorId: 'v-005' },
    ],
  },
  {
    id: 'e-011',
    name: '游泳池過濾設備',
    category: 'pool',
    areaId: 'area-pool',
    place: 'B1 泳池機房',
    vendorId: 'v-007',
    status: 'normal',
    installedAt: '2020-05-15',
    warrantyUntil: '2022-05-14',
    cycle: 'quarterly',
    lastMaintainedAt: '2026-07-08',
    records: [
      { id: 'er-019', date: '2026-07-08', type: 'maintenance', title: '濾材更換與馬達檢查', vendorId: 'v-007', cost: 9800 },
    ],
  },
  {
    id: 'e-012',
    name: '火警受信總機',
    category: 'fire',
    areaId: 'area-parking',
    place: '地下室消防受信總機室',
    vendorId: 'v-002',
    status: 'normal',
    installedAt: '2025-07-01',
    warrantyUntil: '2028-06-30',
    cycle: 'quarterly',
    lastMaintainedAt: '2026-09-15',
    records: [
      { id: 'er-020', date: '2026-09-15', type: 'maintenance', title: '季檢修與迴路測試', vendorId: 'v-002' },
    ],
  },
  {
    id: 'e-013',
    name: '車道柵欄機',
    category: 'security',
    areaId: 'area-parking',
    place: 'B1 車道出入口',
    vendorId: 'v-005',
    status: 'normal',
    installedAt: '2022-02-10',
    warrantyUntil: '2024-02-09',
    cycle: 'yearly',
    lastMaintainedAt: '2026-02-12',
    records: [
      { id: 'er-021', date: '2026-02-12', type: 'maintenance', title: '年度保養與感應線圈校正', vendorId: 'v-005' },
    ],
  },
  {
    id: 'e-014',
    name: '舊型抽水馬達',
    category: 'water',
    areaId: 'area-parking',
    place: 'B3 蓄水池機房',
    status: 'retired',
    installedAt: '2012-06-01',
    warrantyUntil: '2014-05-31',
    records: [
      { id: 'er-022', date: '2024-12-19', type: 'repair', title: '汰換為新型低噪靜音泵，舊機報廢', vendorId: 'v-007' },
    ],
  },
]
