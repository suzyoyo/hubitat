// 假 API 共用的小工具

// 假裝「今天」是這一天，這樣不管哪天打開，畫面內容都固定
// 合約「7 天後到期」、設備「保養逾期 11 天」這些文字，都是用這個日期算出來的
export const MOCK_TODAY = '2026-10-01'

// 等待一段時間（毫秒）再繼續，用來模擬網路延遲
export function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 從物件中拿掉指定的欄位，回傳新的物件（不會動到原本的資料）
// 用在「某些角色不能看的欄位」，例如：omit(contract, ['amount', 'files'])
export function omit(object, keys) {
  const result = { ...object }
  for (const key of keys) {
    delete result[key]
  }
  return result
}
