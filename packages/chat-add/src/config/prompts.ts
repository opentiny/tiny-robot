export interface PromptItemData {
  label: string
  description: string
  emoji: string
  badge?: string
}

export const PROMPT_ITEMS_DATA: PromptItemData[] = [
  {
    label: '日常助理场景',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    emoji: '🧠',
    badge: 'NEW',
  },
  {
    label: '学习/知识型场景',
    description: '有什么想了解的吗？可以是"Vue3 和 React 的区别"！',
    emoji: '🤔',
  },
  {
    label: '创意生成场景',
    description: '想写段文案、起个名字，还是来点灵感？',
    emoji: '✨',
  },
  {
    label: 'MCP 工具调用',
    description: '搜索：北京天气（输入「搜索」「MCP」「工具」等关键词可触发模拟 MCP 工具调用）',
    emoji: '🔧',
  },
]

export const prompts = PROMPT_ITEMS_DATA
