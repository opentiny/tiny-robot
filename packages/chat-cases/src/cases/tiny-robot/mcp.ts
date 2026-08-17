import type { ChatMcpServers } from '@opentiny/tiny-robot-chat'

const dashScopeApiKey = import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim()

function assertDashScopeApiKey(serverId: string) {
  if (!dashScopeApiKey) {
    throw new Error(`Missing VITE_ALIYUN_DASHSCOPE_KEY for MCP server "${serverId}".`)
  }
}

export const mcpServers = [
  {
    id: 'amap-maps',
    name: '高德地图',
    description: '覆盖地图、导航、地理编码、天气、路径规划、距离测量、关键词搜索和周边搜索等地理信息服务。',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1/mcps/amap-maps/mcp',
    icon: 'https://img.alicdn.com/imgextra/i4/O1CN01iPPabT1EGRN6uatHP_!!6000000000324-0-tps-512-512.jpg',
    headers: dashScopeApiKey ? { Authorization: `Bearer ${dashScopeApiKey}` } : undefined,
    validate: assertDashScopeApiKey,
  },
  {
    id: 'model-context-protocol-mcp',
    name: 'Model Context Protocol MCP',
    description: 'MCP Server',
    baseUrl: '/modelcontextprotocol-mcp',
    icon: '/modelcontextprotocol.png',
    installed: true,
  },
] satisfies ChatMcpServers
