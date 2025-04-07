import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/demo',
      name: 'Native Demo',
      component: () => import('../views/native/ChatView.vue'),
    },
    {
      path: '/matechat-demo',
      name: 'MateChat Demo',
      component: () => import('../views/matechat/MateChatDemo.vue'),
    },
    {
      path: '/tiny-robot-demo',
      name: 'TinyRobotDemo',
      component: () => import('../views/tinyrobot/TinyRobotDemo.vue'),
    },
    {
      path: '/',
      redirect: '/demo',
    },
  ],
})

export default router
