import { createRouter, createWebHistory } from 'vue-router'
import Basic from './demos/basic.vue'
import List from './demos/list.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/basic',
    },
    {
      path: '/basic',
      component: Basic,
    },
    {
      path: '/list',
      component: List,
    },
  ],
})

export default router
