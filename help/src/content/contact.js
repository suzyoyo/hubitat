// 聯絡支援的資料（2026-10-19 從「電話＋信箱」改成表單）
//   這一頁是「聯絡好彼團隊」的管道，不是社區管理室：每個社區的電話不一樣，社區的事請找自己的管理室
// ⚠️ 目前是「測試資料」：表單還沒有接到真的收件地方，送出只是假裝成功
//   接好之後：在 ContactView.vue 的 submitForm() 改成真的送出，並把 isTestData 改成 false，完成畫面的「沒有真的寄出」就會消失
export const CONTACT = {
  isTestData: true,

  // 預計多久回覆，送出後的完成畫面也會用到
  replyTime: '3 個工作天內',

  // 你的身分（單選）
  roles: [
    { value: 'resident', label: '住戶' },
    { value: 'committee', label: '管委會委員' },
    { value: 'staff', label: '管理人員' },
    { value: 'other', label: '其他' },
  ],

  // 想詢問什麼（下拉選單，選項 5 個以上用下拉）
  topics: [
    { value: 'how-to', label: '不知道怎麼操作' },
    { value: 'account', label: '登入或帳號問題' },
    { value: 'bug', label: '畫面出錯、功能壞掉' },
    { value: 'suggestion', label: '功能建議' },
    { value: 'join', label: '我們社區想使用好彼社區' },
    { value: 'other', label: '其他' },
  ],

  privacy: '你填的資料只用來回覆這次的問題，不會拿去做其他用途。',

  emergency: '漏水、停電、電梯受困等緊急狀況，請直接聯絡社區管理室或管委會。這份表單是寄給好彼團隊的，不會通知社區，也沒辦法派人處理。',
}
