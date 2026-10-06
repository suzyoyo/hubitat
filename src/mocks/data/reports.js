// 通報（報修）假資料
// 欄位說明：
//   id          唯一編號
//   reporterId  通報人（對應 users.js 的 id）
//   category    類別，見下方 REPORT_CATEGORIES
//   location    地點，例如「1F 大廳」  ┐ 畫面上會組成「1F 大廳｜感應門故障」
//   subject     主旨，例如「感應門故障」┘ 這兩項送出後不能修改
//   description 通報人寫的補充說明（最多 200 字）
//   status      目前狀態，見下方 REPORT_STATUSES
//   submittedAt 送出時間
//   updatedAt   最後更新時間
//   timeline    處理進度紀錄（由舊到新），每筆有 at 時間、status 當時的狀態、text 說明
//               最後一筆就是畫面上的「管委會回覆」
//   photos      照片網址（目前先留空）
//
// 時間一律寫成 '2026-09-25T14:30' 這種格式（ISO 8601），
// 要顯示成「9/25 14:30」時用 src/lib/date.js 的函式轉換

// 通報狀態：key 是存在資料裡的值，label 是畫面上顯示的文字
export const REPORT_STATUSES = {
  received: { label: '已收到' },
  processing: { label: '處理中' },
  done: { label: '已完成' },
}

// 通報類別：isPublic 表示其他住戶是否看得到
export const REPORT_CATEGORIES = {
  facility: { label: '公共設施修繕', visibility: '公共區域・公開顯示', isPublic: true },
  violation: { label: '住戶違規', visibility: '住戶違規・不公開顯示', isPublic: false },
}

export const reports = [
  {
    id: 'r-001',
    reporterId: 'u-c04',
    category: 'facility',
    location: '1F 大廳',
    subject: '感應門故障',
    description: '進入大廳時，感應門偶爾不會自動開啟，需要用力推才會動，已持續約三天。',
    status: 'processing',
    submittedAt: '2026-09-20T10:15',
    updatedAt: '2026-09-25T14:30',
    timeline: [
      { at: '2026-09-20T10:15', status: 'received', text: '已收到，好彼管家已通知管理人員。' },
      { at: '2026-09-22T09:00', status: 'processing', text: '管理人員已受理。' },
      {
        at: '2026-09-25T14:30',
        status: 'processing',
        text: '已通報原廠工程師排查線路，預計近日到場檢修。',
      },
    ],
    photos: [],
  },
  {
    id: 'r-002',
    reporterId: 'u-c04',
    category: 'facility',
    location: '地下室 B2',
    subject: '梯廳燈不亮',
    description: 'B2 梯廳靠車道側的燈不亮，晚上取車時很暗。',
    status: 'received',
    submittedAt: '2026-09-25T08:40',
    updatedAt: '2026-09-25T09:30',
    timeline: [
      {
        at: '2026-09-25T09:30',
        status: 'received',
        text: '已收到通報，總幹事已登記並將巡檢更換燈泡。',
      },
    ],
    photos: [],
  },
  {
    id: 'r-003',
    reporterId: 'u-c04',
    category: 'facility',
    location: '頂樓花園',
    subject: '灑水噴頭漏水',
    description: '頂樓花園東側的灑水噴頭一直滴水，地面有積水。',
    status: 'processing',
    submittedAt: '2026-09-23T16:05',
    updatedAt: '2026-09-24T15:20',
    timeline: [
      { at: '2026-09-23T16:05', status: 'received', text: '已收到，好彼管家已通知管理人員。' },
      { at: '2026-09-24T15:20', status: 'processing', text: '水電廠商已初步查勘，待料更換止水閥。' },
    ],
    photos: [],
  },
  {
    id: 'r-004',
    reporterId: 'u-c04',
    category: 'violation',
    location: '8F 住戶',
    subject: '夜間裝潢噪音',
    description: '深夜 11 點後隔壁仍在裝潢施工，連續三晚影響睡眠。',
    status: 'done',
    submittedAt: '2026-09-08T23:20',
    updatedAt: '2026-09-12T11:00',
    timeline: [
      { at: '2026-09-08T23:20', status: 'received', text: '已收到通報，好彼管家已轉交管委會。' },
      { at: '2026-09-09T10:00', status: 'processing', text: '管委會已受理。' },
      { at: '2026-09-10T14:00', status: 'processing', text: '管委會已聯繫相關住戶，持續追蹤。' },
      { at: '2026-09-12T11:00', status: 'done', text: '該住戶已調整施工時間，本案結案。' },
    ],
    photos: [],
  },
  {
    id: 'r-005',
    reporterId: 'u-c04',
    category: 'facility',
    location: '停車場 B1',
    subject: '車道反光鏡歪斜',
    description: 'B1 車道轉彎處的反光鏡角度歪掉，看不到對向來車。',
    status: 'done',
    submittedAt: '2026-09-02T18:30',
    updatedAt: '2026-09-04T10:10',
    timeline: [
      { at: '2026-09-02T18:30', status: 'received', text: '已收到，好彼管家已通知管理人員。' },
      { at: '2026-09-04T10:10', status: 'done', text: '管理人員已重新固定反光鏡並確認角度。' },
    ],
    photos: [],
  },
]
