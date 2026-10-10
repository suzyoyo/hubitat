// 路由設定：決定「哪個網址顯示哪個畫面」
// 這個檔案負責把三端的頁面清單組合起來，平常不用改。
// 要新增或換掉頁面，請改各端自己的檔案：resident.js、committee.js、staff.js
import { createRouter, createWebHistory } from 'vue-router'
import { roles } from '@/config/roles'
import AppShell from '@/layouts/AppShell.vue'
import PlaceholderView from '@/views/PlaceholderView.vue'
import RoleSelectView from '@/views/RoleSelectView.vue'
import committee from './committee'
import resident from './resident'
import staff from './staff'

// 每一端的頁面清單；key 要和 roles.js 裡的 id 一樣
const pageLists = { resident, committee, staff }

// 依照 roles 設定，替每一端產生一組路由
// 例如住戶端會產生 /resident/home、/resident/files、/resident/me …
const roleRoutes = roles.map((role) => {
  const { views, innerPages } = pageLists[role.id]

  // 產生一頁的路由：做好的用真的畫面，還沒做的用佔位頁
  // isTab：是不是底部分頁。外框會用它決定頂部列的樣子、要不要顯示底部導覽
  function page(path, title, isTab = false) {
    return {
      path,
      component: views[path] ?? PlaceholderView,
      meta: {
        title: `${role.label}端・${title}`, // 佔位頁上顯示的名稱
        pageTitle: title, // 頂部列顯示的標題
        isTab,
      },
    }
  }

  return {
    path: `/${role.id}`,
    component: AppShell, // 共用外框：頂部列 + 底部導覽
    props: { roleId: role.id }, // 告訴外框現在是哪一端
    redirect: `/${role.id}/home`, // 只打 /resident 時自動轉到首頁
    // children：顯示在外框「中間」的頁面
    children: [
      ...role.tabs.map((tab) => page(tab.path, tab.label, true)), // 底部分頁
      page('notifications', '通知'), // 右上角的鈴鐺
      page(role.fab.path, role.fab.title), // 右下角的「＋」按鈕
      ...innerPages.map((item) => page(item.path, item.title)), // 內頁
    ],
  }
})

const routes = [
  { path: '/', component: RoleSelectView },
  ...roleRoutes,
  // 用到時才載入（lazy load），不會拖慢正式頁面
  { path: '/playground', component: () => import('@/views/PlaygroundView.vue') },
  // 其他不存在的網址一律回到角色選擇頁
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 換頁後回到頁面頂端
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
