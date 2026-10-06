// 第一版的會議假 API
// ⚠️ 暫時保留：第三批會擴充會議資料（決議、住戶留言），屆時這個檔案會移除
import { meetings } from '../data/meetings'
import { delay } from './helpers'

// 取得會議紀錄，新的排前面
export async function getMeetings() {
  await delay()
  return meetings.toSorted((a, b) => b.heldAt.localeCompare(a.heldAt))
}
