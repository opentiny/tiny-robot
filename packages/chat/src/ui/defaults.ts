import { h } from 'vue'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import type {
  ChatAsideOptions,
  ChatBrandOptions,
  ChatComposerOptions,
  ChatHeaderOptions,
  ChatHistoryOptions,
  ChatLabels,
  ChatMessagesOptions,
  ChatPromptsOptions,
  ChatWelcomeOptions,
} from '../types'

export interface DefaultChatUIOptions {
  layout: {
    contentMaxWidth: number
    panelPadding: number
    panelGap: number
  }
  brand: ChatBrandOptions & {
    name: string
    logo: unknown
  }
  labels: ChatLabels
  header: ChatHeaderOptions
  leftAside: Required<ChatAsideOptions>
  rightAside: false
  history: ChatHistoryOptions
  messages: ChatMessagesOptions & {
    autoScroll: boolean
    bubbleList: NonNullable<ChatMessagesOptions['bubbleList']>
  }
  welcome: ChatWelcomeOptions & {
    title: string
    description: string
  }
  prompts: ChatPromptsOptions & {
    items: NonNullable<ChatPromptsOptions['items']>
  }
  composer: ChatComposerOptions & {
    clearOnSubmit: boolean
    sender: NonNullable<ChatComposerOptions['sender']>
  }
}

export function createDefaultChatLabels(): ChatLabels {
  return {
    newConversationTitle: '新对话',
    createConversation: '新建会话',
    renameConversation: '重命名',
    deleteConversation: '删除',
    expandConversationList: '展开会话列表',
    collapseConversationList: '收起会话列表',
    composerPlaceholder: '请输入你的问题...',
    composerLoadingPlaceholder: '思考中...',
    selectModel: '选择模型',
    mcp: 'MCP',
    thinkingFeature: '深度思考',
    searchFeature: '联网搜索',
    toggleTheme: '切换主题',
    welcomeTitle: 'TinyRobot AI 助手',
    welcomeDescription: '您好，我是TinyRobot，您专属的 AI 智能专家',
  }
}

export function createDefaultChatUIOptions(): DefaultChatUIOptions {
  const labels = createDefaultChatLabels()

  return {
    layout: {
      contentMaxWidth: 980,
      panelPadding: 12,
      panelGap: 12,
    },
    brand: {
      name: 'TinyRobot',
      logo: IconAi,
    },
    labels,
    header: {
      showThemeToggle: true,
    },
    leftAside: {
      mode: 'dock',
      width: 300,
      collapsedWidth: 56,
      defaultOpen: false,
    },
    rightAside: false,
    history: {
      menuItems: [
        { id: 'rename', text: labels.renameConversation },
        { id: 'delete', text: labels.deleteConversation },
      ],
    },
    messages: {
      autoScroll: true,
      bubbleList: {
        roleConfigs: {
          system: {
            hidden: true,
          },
        },
      },
    },
    welcome: {
      title: labels.welcomeTitle,
      description: labels.welcomeDescription,
      icon: h(IconAi, { style: { fontSize: '40px' } }),
    },
    prompts: {
      items: [],
    },
    composer: {
      clearOnSubmit: true,
      sender: {
        mode: 'multiple',
        clearable: true,
        maxLength: 1000,
        showWordLimit: true,
      },
    },
  }
}
