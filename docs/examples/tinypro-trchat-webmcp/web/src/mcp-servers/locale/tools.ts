import type { PageAwareServer } from '@opentiny/next-sdk'
import { z } from '@opentiny/next-sdk'

function registerLocaleManagementTools(server: PageAwareServer) {
  server.registerTool(
    'add-i18n-entry',
    {
      title: '添加国际化词条',
      description: '添加国际化词条',
      inputSchema: {
        key: z.string().describe('词条关键字，请自行创建，不要询问用户'),
        content: z.string().describe('词条内容'),
        lang: z.union([z.literal(1), z.literal(2)]).describe('词条语言ID，英文 enUS 为：1，中文 zhCN 为：2'),
      },
    },
    // 第三个参数传路由配置：工具被调用时自动跳转到 /locale
    // 页面加载完成后，通过 postMessage 把 input 转发给页面内的处理器
    { route: '/vue-pro/locale' },
  )
}

export default registerLocaleManagementTools
