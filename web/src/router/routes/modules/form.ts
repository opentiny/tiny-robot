import { RoleType } from '@/types/roleType'

export default {
  path: 'form',
  name: 'Form',
  id: 'Form',
  label: 'Form',
  component: () => import('@/views/form/index.vue'),
  meta: {
    locale: 'menu.form',
    requiresAuth: true,
    order: 3,
    roles: [RoleType.admin],
  },
  children: [
    {
      path: 'base',
      name: 'Base',
      id: 'Base',
      label: 'Base',
      component: () => import('@/views/form/base/index.vue'),
      meta: {
        locale: 'menu.form.base',
        requiresAuth: true,
        roles: [RoleType.admin],
      },
    },
    {
      path: 'step',
      name: 'Step',
      id: 'Step',
      label: 'Step',
      component: () => import('@/views/form/step/index.vue'),
      meta: {
        locale: 'menu.form.step',
        requiresAuth: true,
        roles: [RoleType.admin],
      },
    },
    {
      path: 'advance',
      name: 'Advance',
      id: 'Advance',
      label: 'Advance',
      component: () => import('@/views/form/advance/index.vue'),
      meta: {
        locale: 'menu.form.advance',
        requiresAuth: true,
        roles: [RoleType.admin],
      },
    },
    {
      path: 'editor',
      name: 'Editor',
      id: 'Editor',
      label: 'Editor',
      component: () => import('@/views/form/editor/index.vue'),
      meta: {
        locale: 'menu.form.editor',
        requiresAuth: true,
        roles: [RoleType.admin],
      },
      children: [
        {
          path: 'create',
          name: 'EditorCreate',
          id: 'EditorCreate',
          label: 'EditorCreate',
          component: () => import('@/views/form/editor/create/index.vue'),
          meta: {
            locale: 'menu.form.editor.create',
            requiresAuth: true,
            roles: [RoleType.admin],
            hidden: true,
          },
        },
      ],
    },
  ],
}
