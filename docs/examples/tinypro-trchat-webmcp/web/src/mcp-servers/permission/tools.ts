import type { PageAwareServer } from '@opentiny/next-sdk'
import { z } from '@opentiny/next-sdk'

function registerPermissionManagementTools(server: PageAwareServer) {
  server.registerTool(
    'add-permission',
    {
      title: '添加权限',
      description: '添加权限',
      inputSchema: {
        name: z.string().describe('权限名称'),
        desc: z.string().describe('权限描述'),
      },
    },
    { route: '/vue-pro/permission/allPermission' },
  )
}

export default registerPermissionManagementTools
