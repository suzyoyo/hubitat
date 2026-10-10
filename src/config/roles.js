// 三端使用者的設定：每一端有哪些底部分頁、右下角的「＋」按鈕做什麼
// 路由（src/router/index.js）和外框（src/layouts/AppShell.vue）都讀這份設定
import {
  FolderOpenIcon,
  HouseIcon,
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
    // text 是顯示在按鈕上的字（沒有就只顯示＋），title 是按下後那一頁的標題
    fab: { path: 'report', title: '新增通報', text: '通報' },
  },
  {
    id: 'committee',
    label: '管委會',
    description: '待辦、交辦、簽核與社區檔案',
    tabs: managementTabs,
    fab: { path: 'new', title: '全域新增選單' },
  },
  {
    id: 'staff',
    label: '管理人員',
    description: '物業公司、警衛：處理案件與登記',
    tabs: managementTabs,
    fab: { path: 'new', title: '全域新增選單' },
  },
]

// 用 id 找出某一端的設定，例如 getRole('resident')
export function getRole(id) {
  return roles.find((role) => role.id === id)
}
