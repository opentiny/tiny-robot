import type { ChatMcpServers, ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import { IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

export interface McpExample {
  id: string
  title: string
  request: string
}

export const mcpExamples: McpExample[] = [
  { id: 'weather', title: '查询北京天气', request: '查询北京今天的天气，并给出出行建议' },
  { id: 'coffee', title: '查询附近咖啡店', request: '查询我附近的咖啡店，并按距离排序' },
  { id: 'exchange-rate', title: '获取当前汇率', request: '查询人民币兑美元的当前汇率' },
]

export const mcpServers: ChatMcpServers = [
  {
    id: 'amap-maps',
    name: '高德地图',
    description: '覆盖地图、导航、地理编码、天气、路径规划、距离测量、关键词搜索和周边搜索等地理信息服务。',
    baseUrl: import.meta.env.VITE_AMAP_MCP_URL?.trim() || 'https://dashscope.aliyuncs.com/api/v1/mcps/amap-maps/mcp',
    icon: 'https://img.alicdn.com/imgextra/i4/O1CN01iPPabT1EGRN6uatHP_!!6000000000324-0-tps-512-512.jpg',
    headers: import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim()
      ? { Authorization: `Bearer ${import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY.trim()}` }
      : undefined,
  },
  {
    id: 'model-context-protocol-mcp',
    name: 'Model Context Protocol MCP',
    description: 'MCP Server',
    baseUrl: '/modelcontextprotocol-mcp',
    installed: true,
  },
]

export const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: 'DashScope',
    apiUrl: import.meta.env.VITE_QWEN_API_URL?.trim() || undefined,
    apiKey: import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim(),
    models: [
      {
        id: 'qwen3.7-flash',
        label: 'Qwen3.7 Flash',
        icon: IconBailian,
        capabilities: { thinking: true, search: true },
      },
      {
        id: 'qwen3.7-plus',
        label: 'Qwen3.7 Plus',
        icon: IconBailian,
        capabilities: { thinking: true, search: true },
      },
      {
        id: 'qwen3.7-max',
        label: 'Qwen3.7 Max',
        icon: IconBailian,
        capabilities: { thinking: true, search: true },
      },
    ],
  },
  {
    type: 'deepseek',
    apiUrl: import.meta.env.VITE_DEEPSEEK_API_URL?.trim() || undefined,
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY?.trim(),
    models: [
      {
        id: 'deepseek-v4-flash',
        label: 'DeepSeek V4 Flash',
        icon: IconDeepseek,
        capabilities: { thinking: true },
      },
      {
        id: 'deepseek-v4-pro',
        label: 'DeepSeek V4 Pro',
        icon: IconDeepseek,
        capabilities: { thinking: true },
      },
    ],
  },
]
