// 假 API 的出入口：模擬「向伺服器要資料」
// 畫面一律從這裡匯入，例如：import { getVendors } from '@/mocks/api'
//
// 每個函式都回傳 Promise，並故意延遲一下，就像真的在等網路回應。
// 之後有真的後端時，只要改這個資料夾裡的函式內容（改成 fetch），畫面的程式碼不用動。
//
// 很多函式可以傳入 role（'resident' / 'committee' / 'staff'），
// 假 API 會依角色拿掉不該看到的欄位（例如合約金額只有管委會看得到）。

export { MOCK_NOW, MOCK_TODAY } from './helpers'
export * from './users'
export * from './community'
export * from './vendors'
export * from './contracts'
export * from './equipment'
export * from './cases'
export * from './tasks'
export * from './announcements'
export * from './notifications'
export * from './quickSaves'
export * from './meetings'
export * from './proposals'
export * from './documents'
export * from './timeline'
export * from './todos'
export * from './handover'
export * from './search'
