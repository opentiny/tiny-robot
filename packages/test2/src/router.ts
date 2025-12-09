import { createRouter, createWebHistory } from 'vue-router'
import Bubble from './demos/bubble.vue'
import List from './demos/list.vue'
import Test from './demos/test.vue'

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
    {
      path: '/test',
      component: Test,
    },
  ],
})

export default router
