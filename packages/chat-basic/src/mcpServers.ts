export type McpServerConfig = {
  type: 'sse' | 'streamableHttp'
  name: string
  description?: string
  baseUrl: string
  headers?: Record<string, string>
  logoUrl?: string
  validate?: (serverId: string) => void
}

const dashScopeApiKey = import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim()
const dashScopeHeaders = dashScopeApiKey
  ? {
      Authorization: `Bearer ${dashScopeApiKey}`,
    }
  : undefined

function assertDashScopeApiKey(serverId: string) {
  if (!dashScopeApiKey) {
    throw new Error(`Missing VITE_ALIYUN_DASHSCOPE_KEY for MCP server "${serverId}".`)
  }
}

export const McpServers = {
  'china-railway': {
    type: 'sse',
    name: '12306 车票查询',
    description: '开源社区开发者封装，提供 12306 购票信息查询等服务。',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1/mcps/china-railway/sse',
    headers: dashScopeHeaders,
    logoUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01yUKR7l1FrpKqvxNjt_!!6000000000541-2-tps-512-512.png',
    validate: assertDashScopeApiKey,
  },
  'amap-maps': {
    type: 'sse',
    name: '高德地图',
    description: '覆盖地图、导航、地理编码、天气、路径规划、距离测量、关键词搜索和周边搜索等地理信息服务。',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1/mcps/amap-maps/sse',
    headers: dashScopeHeaders,
    logoUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01iPPabT1EGRN6uatHP_!!6000000000324-0-tps-512-512.jpg',
    validate: assertDashScopeApiKey,
  },
  'model-context-protocol-mcp': {
    type: 'streamableHttp',
    name: 'Model Context Protocol MCP',
    description: 'MCP Server',
    baseUrl: window.location.origin + '/modelcontextprotocol-mcp',
    logoUrl: 'https://modelcontextprotocol.io/favicon.ico',
  },
} satisfies Record<string, McpServerConfig>

export type McpServerKey = keyof typeof McpServers
