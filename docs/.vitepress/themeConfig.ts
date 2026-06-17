// 定义共享的侧边栏配置
const sharedSidebarItems = [
  {
    text: '指南',
    base: '/guide/',
    items: [
      { text: '快速开始', link: 'quick-start' },
      { text: '主题配置', link: 'theme-config' },
      { text: '更新日志', link: 'update-log' },
      { text: 'CLI 接入', link: 'cli-integration' },
    ],
  },
  {
    text: '组件',
    base: '/components/',
    items: [
      { text: 'Container 容器', link: 'container' },
      { text: 'Bubble 气泡', link: 'bubble' },
      { text: 'Sender 消息输入框', link: 'sender' },
      { text: 'Prompts 提示集', link: 'prompts' },
      { text: 'Welcome 欢迎', link: 'welcome' },
      { text: 'Feedback 气泡反馈', link: 'feedback' },
      { text: 'History 历史', link: 'history' },
      { text: 'Anchor 锚点', link: 'anchor' },
      { text: 'DropdownMenu 下拉菜单', link: 'dropdown-menu' },
      { text: 'SuggestionPopover 建议弹出框', link: 'suggestion-popover' },
      { text: 'SuggestionPills 建议按钮组', link: 'suggestion-pills' },
      { text: 'DragOverlay 拖拽浮层', link: 'drag-overlay' },
      { text: 'Attachments 附件卡片', link: 'attachments' },
      { text: 'McpServerPicker 插件选择器', link: 'mcp-server-picker' },
      { text: 'Theme 主题', link: 'theme' },
    ],
  },
  {
    text: '工具',
    base: '/tools/',
    items: [
      { text: 'useMessage 消息数据管理', link: 'message' },
      { text: 'useConversation 会话数据管理', link: 'conversation' },
      { text: 'Skill 技能工具链', link: 'skill' },
      { text: 'AIClient 模型交互工具类', link: 'ai-client' },
      { text: '工具函数', link: 'utils' },
    ],
  },
  {
    text: '图标',
    items: [{ text: 'SVG 图标', link: '/icons/' }],
  },
]

const nav = [
  { text: '指南', link: '/guide/quick-start', activeMatch: '/guide/' },
  { text: '演示', link: '/examples/assistant', activeMatch: '/examples/' },
  { text: '迁移指南', link: '/migration/bubble-migration', activeMatch: '/migration/' },
]

const sidebar = {
  '/guide/': sharedSidebarItems,
  '/components/': sharedSidebarItems,
  '/tools/': sharedSidebarItems,
  '/icons/': sharedSidebarItems,
  '/examples/': [
    {
      text: '演示',
      base: '/examples/',
      items: [{ text: '综合示例', link: 'assistant' }],
    },
  ],
  '/migration/': [
    {
      text: '迁移指南',
      base: '/migration/',
      items: [
        { text: 'Bubble 气泡', link: 'bubble-migration' },
        { text: 'useMessage 迁移', link: 'use-message-migration' },
        { text: 'useConversation 迁移', link: 'use-conversation-migration' },
      ],
    },
  ],
}

export const themeConfig = { nav, sidebar }
