import type { ChatLang, ChatLocale } from './index.type'

interface ChatBuiltinLocale {
  title: string
  launcherAriaLabel: string
  systemPrompt: string
  modelPlaceholder: string
  welcomeTitle: string
  welcomeDescription: string
  messages: Required<ChatLocale>
}

export const CHAT_BUILTIN_LOCALES: Record<ChatLang, ChatBuiltinLocale> = {
  'zh-CN': {
    title: 'AI 助手',
    launcherAriaLabel: '打开聊天面板',
    systemPrompt: '你是一个智能助手。',
    modelPlaceholder: '选择模型',
    welcomeTitle: '智能助手',
    welcomeDescription: '先聊天，再在需要时接入 MCP 工具。',
    messages: {
      newConversation: '新建会话',
      historyTitle: '历史会话',
      closeHistory: '关闭历史会话',
      openHistory: '打开历史会话',
      openMcp: '扩展',
      mcpTitle: '扩展',
      installedTabTitle: '已安装',
      marketTabTitle: '市场',
      searchPluginsPlaceholder: '搜索插件',
      marketCategoryPlaceholder: '按分类筛选',
      missingProviderConfig: '缺少模型配置，请先补充模型密钥后再开始对话。',
      unavailableModelConfig: '当前模型未配置 API Key，请切换到可用模型。',
      unavailableModelPrompt: '当前模型不可用。',
      missingProviderPrompt: '请先填写模型密钥。',
      thinkingPrompt: '助手思考中...',
      defaultPrompt: '请输入你的问题...',
      selectModel: '选择模型',
      fallbackConversationTitle: '新会话',
      themeLightMode: '浅色模式',
      themeDarkMode: '深色模式',
    },
  },
  'en-US': {
    title: 'AI Assistant',
    launcherAriaLabel: 'Open chat panel',
    systemPrompt: 'You are a helpful assistant.',
    modelPlaceholder: 'Select model',
    welcomeTitle: 'Assistant Panel',
    welcomeDescription: 'Chat first, then bring in MCP tools only when the task needs them.',
    messages: {
      newConversation: 'New conversation',
      historyTitle: 'History',
      closeHistory: 'Close history',
      openHistory: 'Open history',
      openMcp: 'Extensions',
      mcpTitle: 'Extensions',
      installedTabTitle: 'Installed',
      marketTabTitle: 'Market',
      searchPluginsPlaceholder: 'Search plugins',
      marketCategoryPlaceholder: 'Filter by category',
      missingProviderConfig: 'Missing provider keys. Update your model config before sending messages.',
      unavailableModelConfig: 'Current model has no API key. Switch to an available model.',
      unavailableModelPrompt: 'Current model is unavailable.',
      missingProviderPrompt: 'Fill provider keys first.',
      thinkingPrompt: 'Assistant is thinking...',
      defaultPrompt: 'Ask anything...',
      selectModel: 'Select model',
      fallbackConversationTitle: 'New conversation',
      themeLightMode: 'Light mode',
      themeDarkMode: 'Dark mode',
    },
  },
}
