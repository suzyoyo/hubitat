// 快速留存假資料：先拍下收據、單據或現場照片，之後再補齊資料
// 管委會和管理人員都可以使用
// 欄位說明：
//   id       唯一編號
//   ownerId  留存的人（對應 users.js）
//   name     名稱（選填，沒填會是空字串）
//   note     備註（選填）
//   photos   照片檔名
//   savedAt  留存時間
//   resolved 是否已補齊。false 的會出現在留存者的待辦「需補資料」裡
//   linked   補齊後歸到哪裡：type 是 'case' 案件 或 'equipment' 設備，id 是編號
//            （還沒補齊就不寫）

export const quickSaves = [
  {
    id: 'qs-001',
    ownerId: 'u-s02',
    name: '電梯保養單 09/30',
    note: '大同電梯來做 C 棟複檢時留下的保養單，還沒登記到設備紀錄。',
    photos: ['保養單.jpg'],
    savedAt: '2026-09-30T15:10',
    resolved: false,
  },
  {
    id: 'qs-002',
    ownerId: 'u-s02',
    name: '信箱更換收據',
    note: '金城五金更換 C 棟信箱門片的收據。',
    photos: ['收據.jpg'],
    savedAt: '2026-09-20T15:40',
    resolved: true,
    linked: { type: 'case', id: 'CASE-20260915-001' },
  },
  {
    id: 'qs-003',
    ownerId: 'u-c04',
    name: '中庭植栽報價單',
    note: '綠意園藝現場給的手寫報價，提案時要用。',
    photos: ['報價單_1.jpg', '報價單_2.jpg'],
    savedAt: '2026-09-29T17:25',
    resolved: false,
  },
  {
    id: 'qs-004',
    ownerId: 'u-s01',
    name: '',
    note: '揚水馬達拆回檢修前的現場照片。',
    photos: ['馬達現況.jpg'],
    savedAt: '2026-09-29T10:05',
    resolved: true,
    linked: { type: 'equipment', id: 'e-006' },
  },
]
