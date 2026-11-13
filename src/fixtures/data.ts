import type { ConversationInfo, ConversationStorageStrategy, ChatMessage } from '@opentiny/tiny-robot-kit'
import type { SkillDefinition, McpExtensionTool } from '@opentiny/tiny-robot'

export function createDemoStorage(longConversation = false): ConversationStorageStrategy {
  const now = Date.now()
  const conversations: ConversationInfo[] = [
    { id: 'weekly', title: '本周产品进展', createdAt: now, updatedAt: now },
    { id: 'release', title: '1.0 版本体验', createdAt: now - 1000, updatedAt: now - 1000 },
    { id: 'ideas', title: '下一步计划', createdAt: now - 2000, updatedAt: now - 2000 },
  ]
  const messages = new Map<string, ChatMessage[]>([
    [
      'weekly',
      [
        { id: 'weekly-q', role: 'user', content: '帮我梳理一下本周的产品进展。' },
        {
          id: 'weekly-a',
          role: 'assistant',
          content:
            '## 本周进展\n\n- **聊天体验**：完成会话列表、模型选择与流式回复的组合。\n- **扩展管理**：梳理 MCP 和 Skill 的发现、导入与管理流程。\n- **工具确认**：为需要确认的操作增加允许与拒绝入口。',
        },
        {
          id: 'weekly-tip',
          role: 'assistant',
          content: '你可以从会话列表切换任务，也可以继续补充本周的工作内容。',
        },
      ],
    ],
    [
      'release',
      [
        { role: 'user', content: '1.0 有哪些适合先体验的能力？' },
        {
          role: 'assistant',
          content:
            '可以从 Chat 页面开始，再体验扩展管理、模型选择和工具确认。每个场景都可以独立接入已有业务。',
        },
      ],
    ],
    ['ideas', [{ role: 'assistant', content: '把下一步想做的事情记在这里，我们一起整理成行动清单。' }]],
  ])
  if (longConversation) {
    conversations.unshift({ id: 'launch', title: '项目上线讨论', createdAt: now, updatedAt: now })
    messages.set('launch', launchMessages)
  }
  return {
    loadConversations: () => structuredClone(conversations),
    loadMessages: (id) => structuredClone(messages.get(id) ?? []),
    saveConversation: (conversation) => {
      const index = conversations.findIndex((item) => item.id === conversation.id)
      const copy = { ...conversation }
      if (index < 0) conversations.unshift(copy)
      else conversations[index] = copy
    },
    saveMessages: (id, values) => {
      messages.set(id, JSON.parse(JSON.stringify(values)))
    },
    deleteConversation: (id) => {
      const index = conversations.findIndex((item) => item.id === id)
      if (index >= 0) conversations.splice(index, 1)
      messages.delete(id)
    },
  }
}

const launchMessages: ChatMessage[] = [
  { id: 'launch-q1', role: 'user', content: '上线前需要准备哪些材料？' },
  {
    id: 'launch-a1',
    role: 'assistant',
    content:
      '先准备这四份材料：\n\n1. **发布说明**：列出新增能力、修复事项和影响范围。\n2. **验证记录**：汇总核心流程的结果与已知问题。\n3. **操作手册**：写清部署顺序、负责人和预计用时。\n4. **回退方案**：明确触发条件、恢复步骤和数据备份位置。',
  },
  { id: 'launch-q2', role: 'user', content: '如何安排上线当天的人员分工？' },
  {
    id: 'launch-a2',
    role: 'assistant',
    content:
      '发布前确认四类角色和联系方式：\n\n- **发布负责人**决定开始、暂停或回退。\n- **部署人员**执行发布并记录时间。\n- **验证人员**检查登录和核心业务。\n- **支持人员**汇总反馈并及时同步。',
  },
  { id: 'launch-q3', role: 'user', content: '发布后应该关注哪些指标？' },
  {
    id: 'launch-a3',
    role: 'assistant',
    content:
      '可以把指标放进同一个看板：\n\n- **可用性**：登录和核心操作能否完成。\n- **响应时间**：重点页面加载是否变慢。\n- **错误情况**：错误率是否超过告警阈值。\n- **业务结果**：关键记录是否正确保存。',
  },
  { id: 'launch-q4', role: 'user', content: '请整理一份发布结束后的检查清单。' },
  {
    id: 'launch-a4',
    role: 'assistant',
    content:
      '发布结束后，逐项确认：\n\n- 核心业务流程已验证。\n- 监控指标恢复到正常范围。\n- 发布记录和使用说明已更新。\n- 遗留问题已明确负责人和复查时间。',
  },
]

export interface DemoExtension {
  id: string
  kind: 'mcp' | 'skill' | 'business'
  name: string
  description: string
  installed: boolean
  enabled: boolean
  tags: string[]
  progress?: number
  skill?: SkillDefinition
  tools?: McpExtensionTool[]
}

export function createExtensions(): DemoExtension[] {
  return [
    {
      id: 'ticket-lookup',
      kind: 'business',
      name: '工单查询',
      description: '按工单编号查询处理状态和最近进展。',
      installed: true,
      enabled: true,
      tags: ['客户服务'],
    },
    {
      id: 'customer-records',
      kind: 'business',
      name: '客户资料检索',
      description: '查找客户档案和服务记录。',
      installed: false,
      enabled: false,
      tags: ['客户服务'],
    },
    {
      id: 'documents',
      kind: 'mcp',
      name: '知识库检索',
      description: '查找团队资料，为对话补充相关文档与参考信息。',
      installed: true,
      enabled: true,
      tags: ['知识检索'],
      tools: [
        { id: 'search', name: '检索文档', description: '按关键词查找团队资料', enabled: true },
        { id: 'read', name: '读取文档', description: '读取指定文档内容', enabled: true },
      ],
    },
    {
      id: 'tasks',
      kind: 'mcp',
      name: '任务看板',
      description: '查看项目任务和进展，让讨论与工作安排保持衔接。',
      installed: true,
      enabled: false,
      tags: ['效率工具'],
      tools: [{ id: 'list', name: '查看任务', enabled: true }],
    },
    {
      id: 'calendar',
      kind: 'mcp',
      name: '日程助手',
      description: '查询会议与日程，为计划安排提供参考。',
      installed: false,
      enabled: false,
      tags: ['效率工具'],
      tools: [{ id: 'meetings', name: '查询日程', enabled: true }],
    },
    {
      id: 'minutes',
      kind: 'mcp',
      name: '会议纪要',
      description: '查阅会议记录、决议和待办事项。',
      installed: false,
      enabled: false,
      tags: ['效率工具'],
    },
    {
      id: 'summary',
      kind: 'skill',
      name: '文档摘要',
      description: '提取长文中的关键信息，整理为便于分享的摘要。',
      installed: false,
      enabled: false,
      tags: ['内容整理'],
      skill: {
        name: '文档摘要',
        description: '提取文档要点。',
        instructions: '# 文档摘要\n\n按背景、核心要点和下一步行动整理内容。',
        resources: [
          {
            path: 'references/summary.md',
            kind: 'text',
            resourceId: 'references/summary.md',
            text: '# 摘要格式\n先列结论，再补充依据。',
          },
        ],
      },
    },
    {
      id: 'review',
      kind: 'skill',
      name: '代码评审',
      description: '围绕正确性与可维护性整理代码改动中的关注点。',
      installed: false,
      enabled: false,
      tags: ['开发协作'],
      skill: {
        name: '代码评审',
        description: '整理代码评审关注点。',
        instructions: '# 代码评审\n\n核对需求、接口与主要回归风险。',
      },
    },
  ]
}
