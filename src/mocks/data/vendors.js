// 廠商假資料
// 欄位說明：
//   id         唯一編號
//   name       廠商名稱
//   taxId      統一編號
//   categories 分類，可以多個，見下方 VENDOR_CATEGORIES
//   services   處理項目（廠商名冊上顯示的小標籤，也用來搜尋「遇到的問題」）
//   status     合作狀態，見下方 VENDOR_STATUSES
//   contacts   聯絡窗口，至少一位
//                name 姓名或專線名稱 / title 職稱 / phone 電話 / line LINE 帳號（選填）
//                isEmergency 是否列入「廠商緊急聯絡」清單
//   createdAt  新增日期（名冊預設依這個排序）
//
// 合約放在 contracts.js、負責的設備放在 equipment.js，
// 兩邊都用 vendorId 指回這裡

export const VENDOR_CATEGORIES = {
  elevator: { label: '電梯' },
  fire: { label: '消防' },
  plumbing: { label: '水電' },
  cleaning: { label: '清潔' },
  security: { label: '保全' },
  gardening: { label: '園藝' },
  mechanical: { label: '機電' },
  waterproof: { label: '防水' },
  pest: { label: '消毒' },
  gas: { label: '瓦斯' },
}

export const VENDOR_STATUSES = {
  active: { label: '合作中' },
  candidate: { label: '候選' },
  inactive: { label: '停用' },
}

export const vendors = [
  {
    id: 'v-001',
    name: '大同電梯',
    taxId: '12345678',
    categories: ['elevator'],
    services: ['電梯故障', '電梯定期保養', '電梯年度檢查'],
    status: 'active',
    contacts: [
      { name: '林經理', title: '業務窗口', phone: '02-2700-1234', isEmergency: false },
      { name: '王技師', title: '維修負責人', phone: '0911-222-333', isEmergency: false },
      { name: '24 小時報修專線', title: '', phone: '0800-123-456', isEmergency: true },
    ],
    createdAt: '2023-10-01',
  },
  {
    id: 'v-002',
    name: '永安消防工程',
    taxId: '23456789',
    categories: ['fire'],
    services: ['消防設備檢修', '滅火器更換', '消防安檢申報'],
    status: 'active',
    contacts: [
      {
        name: '陳先生',
        title: '業務經理',
        phone: '0912-345-678',
        line: 'yongan_chen',
        isEmergency: true,
      },
    ],
    createdAt: '2026-09-28',
  },
  {
    id: 'v-003',
    name: '立信水電行',
    taxId: '34567890',
    categories: ['plumbing'],
    services: ['漏水', '排水堵塞', '跳電', '照明維修'],
    status: 'active',
    contacts: [{ name: '林先生', title: '負責人', phone: '02-2765-4321', isEmergency: true }],
    createdAt: '2024-03-15',
  },
  {
    id: 'v-004',
    name: '潔淨清潔公司',
    taxId: '45678901',
    categories: ['cleaning'],
    services: ['公共區域清潔', '垃圾清運', '水塔清洗'],
    status: 'active',
    contacts: [{ name: '吳主任', title: '現場主任', phone: '02-2788-5566', isEmergency: false }],
    createdAt: '2024-04-01',
  },
  {
    id: 'v-005',
    name: '全安保全',
    taxId: '56789012',
    categories: ['security'],
    services: ['門禁', '監視系統', '駐衛保全'],
    status: 'active',
    contacts: [{ name: '黃主任', title: '駐點主任', phone: '02-2311-7788', isEmergency: false }],
    createdAt: '2024-01-01',
  },
  {
    id: 'v-006',
    name: '綠意園藝',
    taxId: '67890123',
    categories: ['gardening'],
    services: ['植栽修剪', '中庭植栽養護'],
    status: 'active',
    contacts: [{ name: '蔡小姐', title: '業務窗口', phone: '0935-666-777', isEmergency: false }],
    createdAt: '2024-11-01',
  },
  {
    id: 'v-007',
    name: '欣欣機電',
    taxId: '78901234',
    categories: ['mechanical'],
    services: ['機電維護', '發電機保養', '抽水馬達檢修'],
    status: 'active',
    contacts: [{ name: '林組長', title: '維修組長', phone: '02-2599-3344', isEmergency: false }],
    createdAt: '2025-03-01',
  },
  {
    id: 'v-008',
    name: '昇益工程行',
    taxId: '89012345',
    categories: ['waterproof'],
    services: ['屋頂防水', '外牆抓漏', '地坪止滑'],
    status: 'active',
    contacts: [{ name: '許老闆', title: '負責人', phone: '0928-123-987', isEmergency: false }],
    createdAt: '2026-08-20',
  },
  {
    id: 'v-009',
    name: '大台北瓦斯',
    taxId: '90123456',
    categories: ['gas'],
    services: ['瓦斯漏氣', '管線檢查'],
    status: 'active',
    contacts: [{ name: '24 小時服務專線', title: '', phone: '02-2345-1234', isEmergency: true }],
    createdAt: '2023-10-01',
  },
  {
    id: 'v-010',
    name: '環安病媒防治',
    taxId: '11223344',
    categories: ['pest'],
    services: ['環境消毒', '除蟲', '病媒防治'],
    status: 'candidate',
    contacts: [{ name: '簡先生', title: '業務', phone: '0955-432-100', isEmergency: false }],
    createdAt: '2026-09-10',
  },
  {
    id: 'v-011',
    name: '安欣工程',
    taxId: '22334455',
    categories: ['plumbing'],
    services: ['排水疏通', '管線更換'],
    status: 'candidate',
    contacts: [{ name: '鄭先生', title: '估價人員', phone: '0966-789-012', isEmergency: false }],
    createdAt: '2026-09-27',
  },
  {
    id: 'v-012',
    name: '順達環保',
    taxId: '33445566',
    categories: ['cleaning'],
    services: ['水溝清理', '化糞池清運'],
    status: 'inactive',
    contacts: [{ name: '洪小姐', title: '客服', phone: '02-2933-1100', isEmergency: false }],
    createdAt: '2022-05-01',
  },
  {
    id: 'v-013',
    name: '金城五金',
    taxId: '44556677',
    categories: ['plumbing'],
    services: ['門窗鎖具', '信箱維修', '五金更換'],
    status: 'active',
    contacts: [{ name: '金老闆', title: '負責人', phone: '02-2766-8899', isEmergency: false }],
    createdAt: '2025-06-10',
  },
]
