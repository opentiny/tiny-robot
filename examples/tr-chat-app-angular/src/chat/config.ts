import type { ChatMcpServers, ChatProviderConfig, ChatUIOptions } from '@opentiny/tiny-robot-chat'
export interface ClientEnv {
  VITE_QWEN_API_URL?: string
  VITE_DEEPSEEK_API_URL?: string
  VITE_ALIYUN_DASHSCOPE_KEY?: string
  VITE_DEEPSEEK_API_KEY?: string
}
const reasoningFields: ChatProviderConfig['models'][number]['features'] = [
  {
    key: 'reasoning',
    label: '思考强度',
    type: 'select',
    defaultValue: 'off',
    options: [
      { value: 'off', label: '关闭' },
      { value: 'low', label: '低' },
      { value: 'high', label: '高' },
      { value: 'max', label: '最高' },
    ],
  },
]
const qwenFields: ChatProviderConfig['models'][number]['features'] = [
  ...reasoningFields,
  { key: 'search', label: '联网搜索', type: 'switch' },
]

export function createChatConfig(env: ClientEnv, origin: string) {
  const endpoint = (value?: string) => (value?.trim() ? new URL(value.trim(), origin).toString() : undefined)
  const modelProviders: ChatProviderConfig[] = []
  const qwenKey = env.VITE_ALIYUN_DASHSCOPE_KEY?.trim()
  const deepseekKey = env.VITE_DEEPSEEK_API_KEY?.trim()
  if (qwenKey || env.VITE_QWEN_API_URL?.trim())
    modelProviders.push({
      type: 'qwen',
      label: 'DashScope',
      apiKey: qwenKey,
      apiUrl: endpoint(env.VITE_QWEN_API_URL),
      models: ['qwen3.7-flash', 'qwen3.7-plus', 'qwen3.7-max'].map((id) => ({
        id,
        label: id,
        icon: '/qwen.svg',
        features: qwenFields,
      })),
    })
  if (deepseekKey || env.VITE_DEEPSEEK_API_URL?.trim())
    modelProviders.push({
      type: 'deepseek',
      apiKey: deepseekKey,
      apiUrl: endpoint(env.VITE_DEEPSEEK_API_URL),
      models: ['deepseek-v4-flash', 'deepseek-v4-pro'].map((id) => ({
        id,
        label: id,
        icon: '/deepseek.svg',
        features: reasoningFields,
      })),
    })
  const mcpServers: ChatMcpServers = [
    {
      id: 'amap-maps',
      name: '高德地图',
      description: '地图、天气与路线规划。',
      baseUrl: 'https://dashscope.aliyuncs.com/api/v1/mcps/amap-maps/mcp',
      headers: qwenKey ? { Authorization: `Bearer ${qwenKey}` } : undefined,
    },
    {
      id: 'model-context-protocol-mcp',
      name: 'Model Context Protocol 文档',
      description: '检索 MCP 文档。',
      baseUrl: new URL('/modelcontextprotocol-mcp', origin).href,
    },
  ]
  const ui: ChatUIOptions = {
    brand: { name: 'AI 工作台' },
    welcome: { title: '你好，有什么可以帮你？', description: '一起探索想法、梳理知识、完成任务。' },
    prompts: {
      items: [
        { label: '帮我制定学习计划', description: '从目标出发，拆解每一步' },
        { label: '解释一个复杂概念', description: '用具体例子理解新知识' },
      ],
    },
    layout: { rightAside: { mode: 'dock', width: 400 } },
  }
  return { modelProviders, mcpServers, ui }
}
export type ChatAppConfig = ReturnType<typeof createChatConfig>
