// 路由設定：決定「哪個網址顯示哪個畫面」
import { createRouter, createWebHistory } from 'vue-router'
import { roles } from '@/config/roles'
import AppShell from '@/layouts/AppShell.vue'
import PlaceholderView from '@/views/PlaceholderView.vue'
import RoleSelectView from '@/views/RoleSelectView.vue'

// 依照 roles 設定，替每一端產生一組路由
// 例如住戶端會產生 /resident/home、/resident/files、/resident/me …
const roleRoutes = roles.map((role) => ({
  path: `/${role.id}`,
  component: AppShell, // 共用外框：頂部列 + 底部導覽
  props: { roleId: role.id }, // 告訴外框現在是哪一端
  redirect: `/${role.id}/home`, // 只打 /resident 時自動轉到首頁
  // children：顯示在外框「中間」的頁面
  children: [
    // 每個底部分頁一個佔位頁
    ...role.tabs.map((tab) => ({
      path: tab.path,
      component: PlaceholderView,
      meta: { title: `${role.label}端・${tab.label}` },
    })),
    {
      path: 'notifications',
      component: PlaceholderView,
      meta: { title: `${role.label}端・通知` },
    },
    {
      path: role.fab.path,
      component: PlaceholderView,
      meta: { title: `${role.label}端・${role.fab.title}` },
    },
  ],
}))

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
