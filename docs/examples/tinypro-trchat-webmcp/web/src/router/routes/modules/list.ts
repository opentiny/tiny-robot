import { RoleType } from '@/types/roleType'

export default {
  path: 'list',
  name: 'List',
  id: 'List',
  label: 'List',
  component: () => import('@/views/list/index.vue'),
  meta: {
    locale: 'menu.list',
    requiresAuth: true,
    order: 2,
    roles: [RoleType.admin, RoleType.user],
  },
  children: [
    {
      path: 'table', // The midline path complies with SEO specifications
      name: 'Table',
      id: 'Table',
      label: 'Table',
      component: () => import('@/views/list/search-table/index.vue'),
      meta: {
        locale: 'menu.list.searchTable',
        requiresAuth: true,
        roles: [RoleType.admin, RoleType.user],
      },
    },
    {
      path: 'card', // The midline path complies with SEO specifications
      name: 'Card',
      id: 'Card',
      label: 'Card',
      component: () => import('@/views/list/card-list/index.vue'),
      meta: {
        locale: 'menu.list.cardList',
        requiresAuth: true,
        roles: [RoleType.admin, RoleType.user],
      },
    },
    {
      path: 'advanced-list',
      name: 'AdvancedList',
      id: 'AdvancedList',
      label: 'AdvancedList',
      component: () => import('@/views/list/advanced-list/index.vue'),
      meta: {
        locale: 'menu.list.advancedList',
        requiresAuth: true,
        roles: [RoleType.admin, RoleType.user],
      },
    },
  ],
}
