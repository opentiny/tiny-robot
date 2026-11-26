/* eslint-disable prefer-template */

import type { RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layout/default-layout.vue'

export default [
  {
    path: '/',
    redirect: `${import.meta.env.VITE_CONTEXT}login`,
  },
  {
    path: import.meta.env.VITE_CONTEXT,
    redirect: { path: `${import.meta.env.VITE_CONTEXT}login` },
  },
  {
    path: import.meta.env.VITE_CONTEXT + 'login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    name: 'root',
    path: import.meta.env.VITE_CONTEXT,
    component: DefaultLayout,
    children: [],
  },
  {
    path: import.meta.env.VITE_CONTEXT + 'preview',
    name: 'preview',
    component: () => import('@/views/preview/index.vue'),
  },
  {
    name: 'redirect',
    path: import.meta.env.VITE_CONTEXT + 'redirect',
    component: () => import('@/views/redirect.vue'),
  },
  {
    // 菜单路由在导航守卫里才挂上。先接住当前地址，避免启动时出现 No match。
    path: `${import.meta.env.VITE_CONTEXT}:pathMatch(.*)*`,
    name: 'notFound',
    component: () => import('@/views/not-found/index.vue'),
  },
] as RouteRecordRaw[]
