// 文件假資料：法定文件、公開文件、社區規約、社區規則

// ── 法定文件 ──────────────────────────────────────────────
// 欄位說明：
//   id        唯一編號
//   type      文件類型，見下方 LEGAL_DOCUMENT_TYPES
//   name      文件名稱
//   result    檢查結果的標籤，例如「合格申報」（沒有就不寫）
//   expiresAt 到期日
//   isPublic  是否公開給住戶（公開的會出現在住戶端「公開文件」的安全證明）
//   file      檔名。null 代表缺件（還沒上傳）
//   dueAt     缺件時要在哪一天前補上（不缺件就不寫）
//
// 「將到期」「已過期」是用今天的日期算出來的

export const LEGAL_DOCUMENT_TYPES = {
  fire: { label: '消防安全檢查證明' },
  elevator: { label: '電梯使用許可' },
  building: { label: '建築物公共安全檢查' },
  insurance: { label: '公共意外責任險' },
  water: { label: '飲用水水質檢驗' },
}

// 法定文件的狀態（都是算出來的）
export const LEGAL_DOCUMENT_STATUSES = {
  valid: { label: '有效' },
  expiring: { label: '將到期' },
  expired: { label: '已過期' },
  missing: { label: '缺件' },
}

// 到期前幾天算「將到期」（系統會在到期前 60 天與 30 天提醒管委會）
export const DOCUMENT_EXPIRING_DAYS = 60

export const legalDocuments = [
  {
    id: 'ld-001',
    type: 'fire',
    name: '消防安檢申報證明',
    result: '合格申報',
    expiresAt: '2027-03-31',
    isPublic: true,
    file: '消防安檢申報_2026.pdf',
  },
  {
    id: 'ld-002',
    type: 'elevator',
    name: '電梯使用許可證',
    result: '安檢合格',
    expiresAt: '2026-12-31',
    isPublic: true,
    file: '電梯使用許可證_2026.pdf',
  },
  {
    id: 'ld-003',
    type: 'building',
    name: '建築物公共安全自主檢查合格證明',
    result: '主管機關核備',
    expiresAt: '2027-06-30',
    isPublic: true,
    file: '公安檢查合格證明.pdf',
  },
  {
    id: 'ld-004',
    type: 'insurance',
    name: '公共意外責任險保單',
    expiresAt: '2026-11-15',
    isPublic: false,
    file: '公共意外責任險_2025.pdf',
  },
  {
    id: 'ld-005',
    type: 'water',
    name: '飲用水水質檢驗報告',
    result: '檢驗合格',
    expiresAt: '2027-01-14',
    isPublic: true,
    file: '水質檢驗_202607.pdf',
  },
  {
    id: 'ld-006',
    type: 'elevator',
    name: '電梯年度安全檢查報告',
    expiresAt: '2027-10-05',
    isPublic: false,
    file: null,
    dueAt: '2026-10-05',
  },
]

// ── 公開文件（住戶端「公開文件」）──────────────────────────
// 欄位說明：
//   id / category 分類，見下方 PUBLIC_DOCUMENT_CATEGORIES
//   title 標題 / tag 小標籤 / publishedAt 公告日期 / file 檔名
// 「安全證明」這一類不放在這裡，而是直接取法定文件裡 isPublic 的那些

export const PUBLIC_DOCUMENT_CATEGORIES = {
  finance: { label: '財務報告' },
  safety: { label: '安全證明' },
  notice: { label: '會議通知' },
}

export const publicDocuments = [
  { id: 'pd-001', category: 'finance', title: '2026 年第 3 季公共基金收支彙總', tag: '季度報表', publishedAt: '2026-09-30', file: '2026Q3_收支彙總.pdf' },
  { id: 'pd-002', category: 'finance', title: '2026 年第 2 季公共基金收支彙總', tag: '季度報表', publishedAt: '2026-06-30', file: '2026Q2_收支彙總.pdf' },
  { id: 'pd-003', category: 'finance', title: '2025 年度公共基金決算與審計報告', tag: '年度財報', publishedAt: '2026-02-20', file: '2025_決算報告.pdf' },
  { id: 'pd-004', category: 'finance', title: '2026 年第 1 季公共基金收支彙總', tag: '季度報表', publishedAt: '2026-03-31', file: '2026Q1_收支彙總.pdf' },
  { id: 'pd-005', category: 'finance', title: '2025 年第 4 季公共基金收支彙總', tag: '季度報表', publishedAt: '2025-12-31', file: '2025Q4_收支彙總.pdf' },
  { id: 'pd-006', category: 'notice', title: '2026 年第 4 次管委會例會通知', tag: '定期會議', publishedAt: '2026-10-01', file: '第4次例會通知.pdf' },
  { id: 'pd-007', category: 'notice', title: '2026 年外牆修繕專案說明會', tag: '專案會議', publishedAt: '2026-08-10', file: '外牆修繕說明會.pdf' },
  { id: 'pd-008', category: 'notice', title: '住戶大會會議通知', tag: '全員大會', publishedAt: '2026-03-25', file: '住戶大會通知.pdf' },
]

// ── 社區規約 ──────────────────────────────────────────────
// 每次修訂都會建立新版本，舊版本保留。isCurrent 標示現行有效的版本
// chapters 只有現行版本才有：章 → 條文（no 第幾條 / title 條名 / text 內容）

export const bylaws = [
  {
    id: 'bl-v3',
    version: 3,
    revisedAt: '2026-06-15',
    action: '修訂',
    isCurrent: true,
    summary: '新增寵物管理與裝潢施工時段規定（第 15～17 條）',
    file: { name: '社區規約_第3版.pdf', sizeMB: 2.4 },
    chapters: [
      {
        title: '第三章 公共設施使用',
        articles: [
          {
            no: 15,
            title: '設施開放時段',
            text: '本社區健身房、交誼廳及閱讀室的開放時間為每日上午八時至晚間十時整。遇定期保養或特殊公告時段暫停開放，住戶應遵守各項設備使用規則。',
          },
          {
            no: 16,
            title: '寵物活動管理',
            text: '飼養寵物者進出公共區域應使用牽繩，並不得搭乘客用電梯以外的電梯。中大型犬隻通過公共廊道時，須戴嘴套或由飼主抱著。',
          },
          {
            no: 17,
            title: '環境整潔責任',
            text: '寵物排泄物應由飼主立即清理並帶回住家丟棄，不得棄置於公共中庭花圃或一般走道垃圾桶，違者經舉證後送管委會決議處分。',
          },
          {
            no: 18,
            title: '公共安寧維護',
            text: '各住戶於每日夜間十時後至翌日上午七時前，嚴禁喧嘩、高聲播放音樂或從事足以干擾鄰里安寧的行為。',
          },
        ],
      },
      {
        title: '第四章 裝潢施工',
        articles: [
          {
            no: 19,
            title: '施工時段',
            text: '裝潢施工限於週一至週六上午九時至下午五時，中午十二時至下午一時三十分應暫停發出噪音的工項。週日及國定假日不得施工。',
          },
          {
            no: 20,
            title: '施工申請',
            text: '住戶裝潢前應向管理室申請並繳交保證金，施工期間應於梯廳張貼施工公告，並做好公共區域的保護措施。',
          },
        ],
      },
    ],
  },
  {
    id: 'bl-v2',
    version: 2,
    revisedAt: '2022-03-20',
    action: '修訂',
    isCurrent: false,
    summary: '調整管理費計算方式與停車位抽籤規則',
    file: { name: '社區規約_第2版.pdf', sizeMB: 2.1 },
  },
  {
    id: 'bl-v1',
    version: 1,
    revisedAt: '2018-09-01',
    action: '制定',
    isCurrent: false,
    summary: '社區成立時訂定之初版規約',
    file: { name: '社區規約_第1版.pdf', sizeMB: 1.8 },
  },
]

// ── 社區規則與慣例（管委會自己整理的日常規則，比規約口語）────
export const communityRules = [
  { id: 'cr-1', title: '垃圾與回收', text: '垃圾集中場每日 18:00–22:00 開放，回收物請先分類。' },
  { id: 'cr-2', title: '包裹代收', text: '管理室代收包裹保留 7 天，冷藏品請當日領取。' },
  { id: 'cr-3', title: '訪客停車', text: '訪客車位限停 4 小時，需先向管理室登記。' },
  { id: 'cr-4', title: '公設預約', text: '交誼廳與烤肉區需於 3 天前向管理室預約。' },
  { id: 'cr-5', title: '搬家與大型家具', text: '搬家請於 2 天前告知管理室，並使用貨梯。' },
  { id: 'cr-6', title: '機車停放', text: '機車請停放於 B1 機車區，不得停在車道與梯廳。' },
]
