import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { ChatProviderConfig, ChatWelcomeOptions } from '@opentiny/tiny-robot-chat'
import { deepseekModelProviders } from '../deepseek/config'

export const geminiConversationStorageKey = 'tiny-robot-gemini-conversations-v1'
export const geminiDefaultModelId = 'deepseek-v4-flash'

export const geminiModelOptions = [
  { id: 'deepseek-v4-flash-lite', label: '3.5 Flash-Lite', description: '极速回答' },
  { id: 'deepseek-v4-flash', label: '3.6 Flash', description: '全方位帮助' },
  { id: 'deepseek-v4-pro', label: '3.1 Pro', description: '高阶数学与代码' },
] as const

const deepseekProvider = deepseekModelProviders[0]

export const geminiModelProviders: ChatProviderConfig[] = deepseekProvider
  ? [
      {
        ...deepseekProvider,
        models: geminiModelOptions.map(({ id, label }) => ({
          id,
          label,
          capabilities: { thinking: true },
        })),
      },
    ]
  : []

function createMockMessages(title: string): readonly ChatMessage[] {
  return [
    { role: 'user', content: title },
    {
      role: 'assistant',
      content: `这是“${title}”的示例回答，用于验证 Gemini 案例的会话切换和消息展示。`,
    },
  ]
}

export const geminiMockConversations = [
  {
    title: 'Simple Number Exchange',
    messages: createMockMessages('Simple Number Exchange'),
  },
  {
    title: '训练密码链接解析服务',
    messages: createMockMessages('训练密码链接解析服务'),
  },
  {
    title: '寻找隐藏的注册码',
    messages: createMockMessages('寻找隐藏的注册码'),
  },
  {
    title: 'Playwright 安装 Chromium 浏览器',
    messages: createMockMessages('Playwright 安装 Chromium 浏览器'),
  },
  {
    title: '图片高清化及细节修正反馈',
    messages: createMockMessages('图片高清化及细节修正反馈'),
  },
  {
    title: 'VS Code 实名跳转问题解答',
    messages: createMockMessages('VS Code 实名跳转问题解答'),
  },
  {
    title: '布局组件定位 Prop 命名方案',
    messages: createMockMessages('布局组件定位 Prop 命名方案'),
  },
] satisfies readonly {
  title: string
  messages: readonly ChatMessage[]
}[]

export const geminiWelcome: ChatWelcomeOptions = {
  title: '我们应该重点关注什么？',
  description: '',
  align: 'center',
}
