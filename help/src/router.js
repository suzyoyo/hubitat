// 使用手冊的網址
// 每篇文章都有自己的網址（/articles/文章id），可以直接分享
import { createRouter, createWebHistory } from 'vue-router'
import ArticleView from '@/views/ArticleView.vue'
import ContactView from '@/views/ContactView.vue'
import FaqView from '@/views/FaqView.vue'
import HomeView from '@/views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import RoleView from '@/views/RoleView.vue'
import SearchView from '@/views/SearchView.vue'
import SectionView from '@/views/SectionView.vue'
import { SITE_NAME, setPageTitle } from '@/lib/title'

const routes = [
  { path: '/', component: HomeView, meta: { title: SITE_NAME } },
  // 認識我們：內容只有一篇，直接顯示那篇文章，不用再點一次
  { path: '/about', component: ArticleView, props: { id: 'what-is' } },
  { path: '/start', component: SectionView, props: { categoryId: 'start' }, meta: { title: '開始使用' } },
  { path: '/resident', component: RoleView, props: { roleId: 'resident' }, meta: { title: '住戶使用指南' } },
  { path: '/committee', component: RoleView, props: { roleId: 'committee' }, meta: { title: '管委會使用指南' } },
  { path: '/staff', component: RoleView, props: { roleId: 'staff' }, meta: { title: '管理人員使用指南' } },
  { path: '/articles/:id', component: ArticleView, props: true }, // 標題由文章頁自己設定
  { path: '/search', component: SearchView, meta: { title: '搜尋教學' } },
  { path: '/faq', component: FaqView, meta: { title: '常見問題' } },
  { path: '/contact', component: ContactView, meta: { title: '聯絡支援' } },
  { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { title: '找不到這一頁' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 換頁時回到最上面；網址有 #段落 時捲到那一段；按上一頁時回到原本的位置
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: decodeURIComponent(to.hash), top: 88 }
    if (to.path === from.path) return false // 只改搜尋字時不要跳動
    return { top: 0 }
  },
})

// 瀏覽器分頁上的標題
router.afterEach((to) => {
  if (to.meta.title) setPageTitle(to.meta.title)
})

export default router
