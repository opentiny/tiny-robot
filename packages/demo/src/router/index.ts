import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/tiny-robot-demo',
      name: 'TinyRobotDemo',
      component: () => import('../views/tinyrobot/TinyRobotDemo.vue'),
    },
    {
      path: '/matechat-demo',
      name: 'MateChat Demo',
      component: () => import('../views/matechat/MateChatDemo.vue'),
    },
    {
      path: '/',
      redirect: '/tiny-robot-demo',
    },
  ],
})

export default router
