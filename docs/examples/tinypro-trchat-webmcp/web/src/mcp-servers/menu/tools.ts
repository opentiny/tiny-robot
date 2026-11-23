import type { PageAwareServer } from '@opentiny/next-sdk'
import { z } from '@opentiny/next-sdk'

function registerMenuManagementTools(server: PageAwareServer) {
  server.registerTool(
    'add-menu',
    {
      title: '添加菜单',
      description: '添加菜单',
      inputSchema: {
        name: z.string().describe('名称'),
        order: z.number().describe('优先级').default(0),
        parentMenu: z.string().describe('父菜单').optional(),
        icon: z.string().describe('图标').optional().default(''),
        component: z.string().describe('组件'),
        path: z.string().describe('路径'),
        locale: z.string().describe('国际化'),
      },
    },
    { route: '/vue-pro/menu/allMenu' },
  )
}

export default registerMenuManagementTools
