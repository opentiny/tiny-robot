export type McpServerConfig = {
  type: 'sse' | 'streamableHttp'
  name: string
  description?: string
  baseUrl: string
  headers?: Record<string, string>
  logoUrl?: string
}

export const McpServers = {
  'china-railway': {
    type: 'sse',
    description: '开源社区开发者封装,提供 12306购票信息查询等服务',
    name: '12306 车票查询',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1/mcps/china-railway/sse',
    logoUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01yUKR7l1FrpKqvxNjt_!!6000000000541-2-tps-512-512.png',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY}`,
    },
  },
  'amap-maps': {
    type: 'sse',
    description:
      '高德地图MCP Server现已覆盖15大核心接口，提供全场景覆盖的地理信息服务，包括生成专属地图、导航到目的地、打车、地理编码、逆地理编码、IP定位、天气查询、骑行路径规划、步行路径规划、驾车路径规划、公交路径规划、距离测量、关键词搜索、周边搜索、详情搜索等。',
    name: '高德地图',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1/mcps/amap-maps/sse',
    logoUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01iPPabT1EGRN6uatHP_!!6000000000324-0-tps-512-512.jpg',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY}`,
    },
  },
  'model-context-protocol-mcp': {
    type: 'streamableHttp',
    name: 'Model Context Protocol MCP',
    baseUrl: window.location.origin + '/modelcontextprotocol-mcp',
    logoUrl: window.location.origin + '/modelcontextprotocol.png',
  },
} satisfies Record<string, McpServerConfig>

export type McpServerKey = keyof typeof McpServers
