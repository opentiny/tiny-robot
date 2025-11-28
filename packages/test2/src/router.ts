import { createRouter, createWebHistory } from 'vue-router'
import Bubble from './demos/bubble.vue'
import List from './demos/list.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/bubble',
    },
    {
      path: '/bubble',
      component: Bubble,
    },
    {
      path: '/list',
      component: List,
    },
  ],
})

export default router
