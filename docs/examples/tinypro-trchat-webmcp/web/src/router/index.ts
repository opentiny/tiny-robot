import NProgress from 'nprogress' // progress bar
import { createRouter, createWebHistory } from 'vue-router'
import constant from './constant'
import createRouteGuard from './guard'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 本地地址
    ...constant,
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

createRouteGuard(router)

export default router
