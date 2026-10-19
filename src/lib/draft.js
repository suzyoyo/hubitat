// 草稿（2026-10-19）：表單「存成草稿」之後，回到同一個表單時把內容帶回來
// 七個表單共用這一份（suzy 在 #160 提的：原本每個表單各有一份一模一樣的）
import { toast } from 'vue-sonner'
import { takeDraft } from '@/mocks/api'

// 有草稿就拿回來（拿了就刪掉；沒送出又要離開時可以再存一次），交給 apply 填進表單，再跳提示
//   userId：我是誰；path：表單的網址（和存的時候一樣）；apply：拿到內容後怎麼填進表單
// 例：await restoreDraft(user.id, route.fullPath, (data) => Object.assign(form, data))
export async function restoreDraft(userId, path, apply) {
  const data = await takeDraft(userId, path)
  if (!data) return
  apply(data)
  toast.info('已帶回上次存的草稿')
}
