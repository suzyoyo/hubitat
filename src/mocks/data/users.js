// 使用者假資料
// 欄位說明：
//   id       唯一編號
//   role     角色：'resident' 住戶 / 'committee' 管委會 / 'staff' 管理人員（對應 src/config/roles.js）
//   name     顯示名稱
//   building 棟別（住戶才有）
//   unit     戶號（住戶才有）

export const users = [
  { id: 'u-001', role: 'resident', name: '李伯伯', building: 'A', unit: '8樓之1' },
  { id: 'u-101', role: 'committee', name: '李委員' },
  { id: 'u-201', role: 'staff', name: '張管理員' },
]
