// 判斷「使用手冊是不是從好彼社區 App 裡打開的」，以及怎麼回去（2026-10-20）
//   App 加到手機主畫面後，從「我的」→「使用說明」打開手冊，手冊會留在 App 的視窗裡，
//   這個視窗沒有網址列、也沒有返回鍵，所以手冊要自己在頂部放「回到好彼社區」（components/BackToAppBar.vue）
//
// 怎麼判斷是從 App 來的（任一個成立就算）：
//   1. 畫面是「主畫面 App」模式（display-mode: standalone；iPhone 舊版用 navigator.standalone）
//   2. 網址有 ?from=app（電腦上測試用：npm run dev:help 之後打開 http://localhost:5180/?from=app）
// 判斷結果記在 sessionStorage：在手冊裡換頁、重新整理都還記得；關掉視窗就忘記
import { OPEN_APP } from '@/content/open-app'

const STORAGE_KEY = 'hubitat-help-from-app'

// App 的首頁網址：手冊在 /hubitat/help/，App 就在 /hubitat/；本機開發時手冊在另一個 port，用正式網址
const BASE = import.meta.env.BASE_URL
const APP_HOME = BASE.endsWith('/help/') ? BASE.slice(0, -'help/'.length) : OPEN_APP.url

// 讀、寫 sessionStorage：私密瀏覽等情況可能會出錯，出錯就當作沒有記錄
function load() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}
function save(value) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // 存不了也沒關係，這次瀏覽還是會顯示
  }
}

// 剛打開手冊時判斷一次（這個檔案第一次被 import 的時候）
function detect() {
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  const hasParam = new URLSearchParams(window.location.search).get('from') === 'app'
  if (!isStandalone && !hasParam) return load()

  // 已經記過就沿用（在手冊裡換頁時，上一頁是手冊自己，不能拿來當回去的地方）
  const saved = load()
  if (saved) return saved

  // 回去的地方：剛剛在 App 的哪一頁（document.referrer，例如 /hubitat/resident/me），不是 App 的頁面就回 App 首頁
  const referrer = document.referrer
  const helpUrl = window.location.origin + BASE
  const fromAppPage = referrer.startsWith(window.location.origin + APP_HOME) && !referrer.startsWith(helpUrl)
  const info = {
    returnUrl: fromAppPage ? referrer : APP_HOME,
    // 能不能用「上一頁」回去：上一頁真的是 App，而且這個視窗有上一頁
    //   用上一頁回去，App 比較有機會保持原本的樣子（例如示範時改過的假資料）
    canGoBack: fromAppPage && window.history.length > 1,
    // Vue Router 在每一頁記的編號（history.state.position），回去時算要退幾頁
    //   這個檔案執行時 Vue Router 可能還沒寫進去；它一開始寫的就是 history.length - 1
    startPosition: window.history.state?.position ?? window.history.length - 1,
  }
  save(info)
  return info
}

const info = detect()

export function useFromApp() {
  return { fromApp: Boolean(info) }
}

// 回到好彼社區
//   可以的話用「上一頁」退回去（在手冊裡看了幾頁，就一次退幾頁＋1）；不行就直接打開剛剛那一頁
export function backToApp() {
  if (!info) return
  const position = window.history.state?.position
  if (info.canGoBack && typeof position === 'number') {
    window.history.go(-(position - info.startPosition + 1))
  } else {
    window.location.href = info.returnUrl
  }
}
