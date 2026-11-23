import { createMessageChannelPairTransport, WebMcpServer, withPageTools } from '@opentiny/next-sdk'
import registerLocaleManagementTools from './locale/tools'
import registerMenuManagementTools from './menu/tools'
import registerPermissionManagementTools from './permission/tools'
import registerRoleManagementTools from './role/tools'
import registerUserManagementTools from './user/tools'

const rawServer = new WebMcpServer()
const [serverTransport, clientTransport] = createMessageChannelPairTransport()

// withPageTools 包装后，registerTool 第三个参数支持路由配置对象
export const server = withPageTools(rawServer)

// clientTransport 导出给 TinyRemoter 使用
export { clientTransport }

export async function createMcpServer() {
  registerLocaleManagementTools(server)
  registerUserManagementTools(server)
  registerRoleManagementTools(server)
  registerPermissionManagementTools(server)
  registerMenuManagementTools(server)
  // 最后建立连接，确保所有工具已注册完毕
  await rawServer.connect(serverTransport)
}
