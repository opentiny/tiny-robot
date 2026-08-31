import type { ChatPromptsOptions, ChatWelcomeOptions } from '@opentiny/tiny-robot-chat'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'

export const doubaoNavigation = {
  work: 'new-task',
  chat: 'new-chat',
} as const

export const doubaoConversationStorageKey = 'tiny-robot-doubao-conversations'

export const doubaoMockConversations = [
  {
    title: '新对话',
    metadata: { color: 'pink' },
    messages: [
      { role: 'user', content: '帮我制定一个周末杭州两日游计划' },
      {
        role: 'assistant',
        content: '可以安排西湖、灵隐寺和河坊街三类行程，并根据交通距离合理分配时间。',
      },
    ],
  },
  {
    title: '设计与创意',
    metadata: { color: 'green' },
    messages: [
      { role: 'user', content: '为一个智能家居产品想三个简洁的宣传语' },
      {
        role: 'assistant',
        content: '可以考虑：让每个空间，都懂你的生活。',
      },
    ],
  },
  {
    title: '用户输入1',
    metadata: { color: 'pink' },
    messages: [
      { role: 'user', content: '把下面这段内容整理成会议纪要' },
      {
        role: 'assistant',
        content: '请把需要整理的原始内容发给我，我会按议题、结论和待办事项进行归纳。',
      },
    ],
  },
] satisfies readonly {
  title: string
  metadata: Record<string, string>
  messages: readonly ChatMessage[]
}[]

export const doubaoConversationWelcome: ChatWelcomeOptions = {
  title: '有什么我能帮你的吗？',
  description: '',
  align: 'center',
}

export const doubaoWorkWelcome: ChatWelcomeOptions = {
  title: '今天有什么工作要处理?',
  description: '',
  align: 'center',
}

export const doubaoConversationPrompts: ChatPromptsOptions = {
  vertical: true,
  wrap: false,
  items: [
    { id: 'hot-topic', label: '热点：国产动画电影《年末》综合票房突破 60 万元', size: 'small' },
    { id: 'sleep', label: '每天睡够几小时才算睡眠充足?', size: 'small' },
    { id: 'probability', label: '举一个概率为0却可能发生的例子', size: 'small' },
    { id: 'industry', label: '未来5年哪些行业可能迎来爆发?', size: 'small' },
  ],
}

export const doubaoWorkPrompts: ChatPromptsOptions = {
  vertical: true,
  wrap: false,
  items: [
    { id: 'daily', label: '处理日常工作', size: 'small' },
    { id: 'content', label: '内容创作', size: 'small' },
    { id: 'research', label: '完成调研分析', size: 'small' },
    { id: 'creative', label: '设计与创意', size: 'small' },
  ],
}
