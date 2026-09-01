import type { ChatMcpServers, ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import { IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

export interface McpExample {
  id: string
  title: string
  request: string
}

const defaultApiUrl = `${import.meta.env.BASE_URL}api`

export const mcpExamples: McpExample[] = [
  { id: 'weather', title: '查询北京天气', request: '查询北京今天的天气，并给出出行建议' },
  { id: 'coffee', title: '查询附近咖啡店', request: '查询我附近的咖啡店，并按距离排序' },
  { id: 'exchange-rate', title: '获取当前汇率', request: '查询人民币兑美元的当前汇率' },
]

export const mcpServers: ChatMcpServers = []

export const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: 'DashScope',
    apiUrl: defaultApiUrl,
    models: [
      {
        id: 'qwen3.7-flash',
        label: 'Qwen3.7 Flash',
        icon: IconBailian,
        capabilities: { thinking: true, search: true },
      },
      { id: 'qwen3.7-plus', label: 'Qwen3.7 Plus', icon: IconBailian, capabilities: { thinking: true, search: true } },
      { id: 'qwen3.7-max', label: 'Qwen3.7 Max', icon: IconBailian, capabilities: { thinking: true, search: true } },
    ],
  },
  {
    type: 'deepseek',
    apiUrl: defaultApiUrl,
    models: [
      { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash', icon: IconDeepseek, capabilities: { thinking: true } },
      { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro', icon: IconDeepseek, capabilities: { thinking: true } },
    ],
  },
]
