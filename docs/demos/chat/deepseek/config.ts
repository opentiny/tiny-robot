import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { ChatWelcomeOptions } from '@opentiny/tiny-robot-chat'

export const deepseekConversationStorageKey = 'tiny-robot-deepseek-conversations-v2'

function createMockMessages(title: string): readonly ChatMessage[] {
  return [
    { role: 'user', content: title },
    {
      role: 'assistant',
      content: `这是“${title}”的示例回答，用于验证 DeepSeek 会话切换和消息展示。`,
    },
  ]
}

export const deepseekMockConversations = [
  {
    title: '初次问候与自我介绍',
    metadata: { group: '置顶' },
    messages: createMockMessages('初次问候与自我介绍'),
  },
  {
    title: 'square-pen含义解释',
    metadata: { group: '昨天' },
    messages: createMockMessages('square-pen含义解释'),
  },
  {
    title: '借鉴考夫曼学英语',
    metadata: { group: '30天内' },
    messages: createMockMessages('借鉴考夫曼学英语'),
  },
  {
    title: 'VSCode重启TS服务快捷键',
    metadata: { group: '30天内' },
    messages: createMockMessages('VSCode重启TS服务快捷键'),
  },
  {
    title: '浏览器Agent视觉操作优化',
    metadata: { group: '30天内' },
    messages: createMockMessages('浏览器Agent视觉操作优化'),
  },
] satisfies readonly {
  title: string
  metadata: Record<string, string>
  messages: readonly ChatMessage[]
}[]

export const deepseekWelcome: ChatWelcomeOptions = {
  title: '有什么我能帮你的吗？',
  description: '',
  align: 'center',
}
