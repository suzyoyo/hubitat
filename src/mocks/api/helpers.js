// 假 API 共用的小工具
import { ref, watch } from 'vue'

// 假裝「今天」是這一天，這樣不管哪天打開，畫面內容都固定
// 合約「7 天後到期」、設備「保養逾期 11 天」這些文字，都是用這個日期算出來的
export const MOCK_TODAY = '2026-10-01'

// 假裝「現在」的時間，用來算「2 小時前」「今天 18:00 前」這類文字
export const MOCK_NOW = '2026-10-01T13:42'

// 展示錯誤畫面用的開關（在 /playground 的「狀態畫面」切換）
// 打開後，所有假 API 都會失敗，就像網路斷掉或伺服器壞掉
// 記在 localStorage，換頁、重新整理都還在；打開時外框會顯示橘色橫幅提醒，看完要關掉
// 用 ref 放在這裡（寫法和 lib/fontSize.js 一樣）：playground 一切換，外框的橫幅馬上知道
const MOCK_FAIL_KEY = 'hubitat-mock-fail'

function readMockFail() {
  try {
    return localStorage.getItem(MOCK_FAIL_KEY) === '1'
  } catch {
    return false
  }
}

export const mockFail = ref(readMockFail())

watch(mockFail, (on) => {
  try {
    if (on) localStorage.setItem(MOCK_FAIL_KEY, '1')
    else localStorage.removeItem(MOCK_FAIL_KEY)
  } catch {
    // 存不了：這次有效，重新整理後回到正常
  }
})

// 等待一段時間（毫秒）再繼續，用來模擬網路延遲
// 每個假 API 都會先呼叫它，所以「故意失敗」放在這裡，一次讓全部的假 API 失敗
export async function delay(ms = 400) {
  await new Promise((resolve) => setTimeout(resolve, ms))
  if (mockFail.value) throw new Error('假 API 故意失敗（在 /playground 的「狀態畫面」可以關掉）')
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
