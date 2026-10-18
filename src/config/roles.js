// 三端使用者的設定：每一端有哪些底部分頁、右下角的「＋」按鈕做什麼
// 路由（src/router/index.js）和外框（src/layouts/AppShell.vue）都讀這份設定
import {
  ClipboardPenLineIcon,
  FileTextIcon,
  FolderOpenIcon,
  HouseIcon,
  MegaphoneIcon,
  PencilIcon,
  UserIcon,
  UserRoundIcon,
  UsersIcon,
  WrenchIcon,
} from '@lucide/vue'

// 管委會與管理人員的分頁相同，共用這一份
const managementTabs = [
  { path: 'home', label: '首頁', icon: HouseIcon },
  { path: 'cases', label: '案件', icon: WrenchIcon },
  { path: 'vendors', label: '廠商', icon: UsersIcon },
  { path: 'files', label: '社區', icon: FolderOpenIcon },
  { path: 'me', label: '我的', icon: UserRoundIcon },
]

// 管委會與管理人員按「＋」跳出的全域新增選單（對應設計稿「管委會端-首頁-全域新增選單」）
//   permission：誰才看得到這一項，見下面的 canUseMenuItem；沒寫就是大家都看得到
const managementMenu = [
  { path: 'tasks/new', label: '新增交辦', icon: WrenchIcon, permission: 'assign' },
  { path: 'cases/new', label: '新增通報', icon: PencilIcon },
  { path: 'announcements/new', label: '發布公告', icon: MegaphoneIcon, permission: 'publish' },
  { path: 'files/upload', label: '上傳文件', icon: FileTextIcon },
  { path: 'quick-saves/new', label: '快速留存', icon: ClipboardPenLineIcon },
]

// 這個人看不看得到選單的這一項（規則見 docs/data-model.md 的交辦、公告）
//   assign  新增交辦：只有主委、副主委
//   publish 發布公告：主委、副主委、管理人員
export function canUseMenuItem(item, user) {
  const isChairOrVice = ['chair', 'viceChair'].includes(user.committeeTitle)
  if (item.permission === 'assign') return user.currentRole === 'committee' && isChairOrVice
  if (item.permission === 'publish') return user.currentRole === 'staff' || isChairOrVice
  return true
}

export const roles = [
  {
    id: 'resident', // 用在網址：/resident/...
    label: '住戶',
    description: '查看社區狀態、通報問題',
    tabs: [
      { path: 'home', label: '首頁', icon: HouseIcon },
      { path: 'files', label: '社區', icon: FolderOpenIcon },
      { path: 'me', label: '我的', icon: UserIcon },
    ],
    // fab：右下角的圓形按鈕（Floating Action Button）
    //   有 path：按下去換到那一頁；text 是顯示在按鈕上的字（沒有就只顯示＋），title 是那一頁的標題
    //   有 menu：按下去跳出選單（管委會、管理人員），title 是給螢幕閱讀器念的名稱
    fab: { path: 'reports/new', title: '新增通報', text: '通報' },
  },
  {
    id: 'committee',
    label: '管委會',
    description: '待辦、交辦、簽核與社區檔案',
    tabs: managementTabs,
    fab: { title: '全域新增選單', menu: managementMenu },
  },
  {
    id: 'staff',
    label: '管理人員',
    description: '物業公司、警衛：處理案件與登記',
    tabs: managementTabs,
    fab: { title: '全域新增選單', menu: managementMenu },
  },
]

// 用 id 找出某一端的設定，例如 getRole('resident')
export function getRole(id) {
  return roles.find((role) => role.id === id)
}
