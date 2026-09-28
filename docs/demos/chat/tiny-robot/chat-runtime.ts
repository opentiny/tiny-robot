import type { ChatMcpServers } from '@opentiny/tiny-robot-chat'

export { modelProviders } from '../shared/modelProviders'

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

export const mcpServers: ChatMcpServers = []
