// 「現在看哪個身分」：側邊導覽、搜尋篩選都看這個
// 記在瀏覽器裡，下次打開還是同一個身分；瀏覽器不讓存的時候（例如無痕模式）就只記在這一頁
import { ref } from 'vue'
import { ROLE_IDS } from '@/content/roles'

const KEY = 'hubitat-help-role'

function load() {
  try {
    const saved = localStorage.getItem(KEY)
    return ROLE_IDS.includes(saved) ? saved : 'resident'
  } catch {
    return 'resident'
  }
}

export const currentRole = ref(load())

export function setCurrentRole(roleId) {
  if (!ROLE_IDS.includes(roleId)) return
  currentRole.value = roleId
  try {
    localStorage.setItem(KEY, roleId)
  } catch {
    // 存不了也沒關係，這一頁還是會切換
  }
}
