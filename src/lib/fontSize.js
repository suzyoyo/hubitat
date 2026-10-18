// 住戶「我的 → 顯示設定」的字體大小（2026-10-19，展示用）
//   選「大」＝WCAG（網頁無障礙標準）的大字：內文 24px、粗體 19px，樣式在 style.css 的 .large-text
//   目前只有住戶端「首頁、社區、我的」三個分頁會變（AppShell 加上 .large-text），底部 tab 和內頁不變
//   「小」「中」還是原本的字級
// localStorage：瀏覽器幫每個網站留的小抽屜，重新整理或關掉網頁後東西還在
import { ref, watch } from 'vue'

export const FONT_SIZES = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
]

const FONT_SIZE_KEY = 'hubitat-font-size'

// 一開始先看抽屜裡有沒有上次選的；沒有（或放了看不懂的值）就用「中」
function readSaved() {
  try {
    const saved = localStorage.getItem(FONT_SIZE_KEY)
    return FONT_SIZES.some((item) => item.value === saved) ? saved : 'medium'
  } catch {
    return 'medium'
  }
}

// 放在這裡（不放在頁面裡），「我的」改了，外框馬上知道
export const fontSize = ref(readSaved())

// fontSize 一改變，就把新的值存進抽屜
watch(fontSize, (value) => {
  try {
    localStorage.setItem(FONT_SIZE_KEY, value)
  } catch {
    // 無痕模式等存不進去的情況：這次有效，重新整理後回到「中」
  }
})
