import type { ChatMcpServers } from '@opentiny/tiny-robot-chat'

const amapMcpApiKey = import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim()

export const mcpServers = [
  {
    id: 'amap-maps',
    name: '高德地图',
    description: '覆盖地图、导航、地理编码、天气、路径规划、距离测量、关键词搜索和周边搜索等地理信息服务。',
    baseUrl: import.meta.env.VITE_AMAP_MCP_URL?.trim() || 'https://dashscope.aliyuncs.com/api/v1/mcps/amap-maps/mcp',
    icon: 'https://img.alicdn.com/imgextra/i4/O1CN01iPPabT1EGRN6uatHP_!!6000000000324-0-tps-512-512.jpg',
    headers: amapMcpApiKey ? { Authorization: `Bearer ${amapMcpApiKey}` } : undefined,
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
