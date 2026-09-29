import type { ChatPromptsOptions, ChatWelcomeOptions } from '@opentiny/tiny-robot-chat'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'

export const douBaoMockConversations = [
  {
    title: '总结PDF文档',
    metadata: { color: 'blue' },
    messages: [
      { role: 'user', content: '请帮我总结这份 PDF 文档的重点内容' },
      {
        role: 'assistant',
        content: '可以，请上传文档后我会按主题、关键结论和待办事项进行整理。',
      },
    ],
  },
  {
    title: '生成会议议程模板',
    metadata: { color: 'cyan' },
    messages: [
      { role: 'user', content: '生成一个 30 分钟项目周会的议程模板' },
      {
        role: 'assistant',
        content: '建议包含进展同步、风险讨论、决策事项和下周计划四个部分。',
      },
    ],
  },
  {
    title: '用Python写一个自动爬取天气信息的示例',
    metadata: { color: 'green' },
    messages: [
      { role: 'user', content: '用 Python 写一个自动爬取天气信息的示例' },
      {
        role: 'assistant',
        content: '可以使用 requests 获取公开接口数据，并用定时任务控制执行频率。',
      },
    ],
  },
  {
    title: '规划一份厦门出游攻略',
    metadata: { color: 'yellow' },
    messages: [
      { role: 'user', content: '帮我规划一份厦门出游攻略' },
      {
        role: 'assistant',
        content: '可以围绕鼓浪屿、环岛路和沙坡尾安排两到三天的轻松行程。',
      },
    ],
  },
  {
    title: '历史对话默认',
    metadata: { color: 'orange' },
    messages: [
      { role: 'user', content: '这是一个历史对话示例' },
      {
        role: 'assistant',
        content: '已为你保留这段演示历史。',
      },
    ],
  },
  {
    title: '历史对话默认',
    metadata: { color: 'pink' },
    messages: [
      { role: 'user', content: '查看另一个历史对话示例' },
      {
        role: 'assistant',
        content: '这是另一个可切换的本地历史会话。',
      },
    ],
  },
] satisfies readonly {
  title: string
  metadata: Record<string, string>
  messages: readonly ChatMessage[]
}[]

export const douBaoConversationWelcome: ChatWelcomeOptions = {
  title: '有什么我能帮你的吗？',
  description: '',
  align: 'center',
}

export const douBaoConversationPrompts: ChatPromptsOptions = {
  vertical: true,
  wrap: false,
  items: [
    {
      id: 'hot-topic',
      label: '热点：沈腾新片《欢迎来龙餐馆》爆火带动出品方股价大涨',
      size: 'small',
    },
    { id: 'english-role', label: '帮我设计一个能陪练英语口语的AI角色设定', size: 'small' },
    { id: 'nuts', label: '常吃坚果对健康有哪些益处？', size: 'small' },
    { id: 'english-plan', label: '设计每天15分钟的英语启蒙亲子计划', size: 'small' },
  ],
}
