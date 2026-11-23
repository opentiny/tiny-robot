import type { PageAwareServer } from '@opentiny/next-sdk'
import { z } from '@opentiny/next-sdk'

function registerRoleManagementTools(server: PageAwareServer) {
  server.registerTool(
    'add-role',
    {
      title: '添加角色',
      description: '添加角色，不需要生成角色卡片',
      inputSchema: {
        name: z.string().describe('角色名称'),
        // TODO: 用户的语言可能是添加用户和删除用户的权限，而不是 user::add 和 user::remove 权限或者权限 ID 为 2 和 3，需要做下转换
        permissions: z.array(z.number()).describe('角色拥有的权限'),
      },
    },
    { route: '/vue-pro/role/allRole' },
  )

  server.registerTool(
    'bind-menu-for-role',
    {
      title: '绑定菜单',
      description: '给某个角色绑定菜单',
      inputSchema: {
        role: z.string().describe('需要绑定菜单的角色名称'),
        menu: z.string().describe('需要绑定的菜单名称'),
      },
    },
    { route: '/vue-pro/role/allRole' },
  )
}

export default registerRoleManagementTools
