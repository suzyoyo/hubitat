import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// use(router)：把路由功能裝進 App，之後才能用 <RouterView> 和 <RouterLink>
createApp(App).use(router).mount('#app')
