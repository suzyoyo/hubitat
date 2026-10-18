// 聯絡支援的資料
// ⚠️ 目前全部是「測試資料」，不是真的客服管道（2026-10-18 團隊決定先放假資料）
//   換成正式資料時：改這裡的內容，並把 isTestData 改成 false，頁面上的「測試資料」標示就會消失
export const CONTACT = {
  isTestData: true,
  channels: [
    {
      id: 'office',
      title: '社區管理室電話',
      value: '02-1234-5678',
      hours: '每天 08:00–22:00',
      description: '操作上遇到問題、或要請管理室協助時撥打。',
    },
    {
      id: 'email',
      title: '客服信箱',
      value: 'support@example.com',
      hours: '平日 3 個工作天內回覆',
      description: '寫下你的身分、遇到的問題和畫面上的文字，會比較快找到原因。',
    },
  ],
  emergency: '漏水、停電、電梯受困等緊急狀況，請直接撥打社區管理室電話，不要只在 App 裡通報。',
}
