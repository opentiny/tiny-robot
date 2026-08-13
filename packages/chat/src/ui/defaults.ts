import { h } from 'vue'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import type {
  ChatBrandOptions,
  ChatBubbleOptions,
  ChatConversationView,
  ChatLayoutOptions,
  ChatHistoryOptions,
  ChatLabels,
  ChatMcpView,
  ChatModelView,
  ChatPromptsOptions,
  ChatSenderOptions,
  ChatSenderView,
  ChatWelcomeOptions,
} from '../types'

export interface DefaultChatUIData {
  conversation: Required<ChatConversationView>
  bubble: {
    messages: []
  }
  sender: Required<ChatSenderView>
  model: ChatModelView | undefined
  mcp: ChatMcpView | undefined
}

export interface DefaultChatUIOptions {
  layout: Required<Omit<ChatLayoutOptions, 'leftAside' | 'rightAside'>> & {
    leftAside: {
      mode: 'dock' | 'drawer'
      width: number
      collapsedWidth: number
      defaultOpen: boolean
    }
    rightAside: false
  }
  brand: ChatBrandOptions & {
    name: string
    logo: unknown
  }
  labels: ChatLabels
  history: ChatHistoryOptions
  bubble: ChatBubbleOptions & {
    autoScroll: boolean
    bubbleList: NonNullable<ChatBubbleOptions['bubbleList']>
  }
  welcome: ChatWelcomeOptions & {
    title: string
    description: string
  }
  prompts: ChatPromptsOptions & {
    items: NonNullable<ChatPromptsOptions['items']>
  }
  sender: ChatSenderOptions
  model: Record<string, never>
  mcp: Record<string, never>
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
    rightAsideTitle: '详情',
    mcp: 'MCP',
    thinkingFeature: '深度思考',
    searchFeature: '联网搜索',
    welcomeTitle: 'TinyRobot AI 助手',
    welcomeDescription: '您好，我是TinyRobot，您专属的 AI 智能专家',
    openRightAside: '打开详情',
    closeRightAside: '关闭详情',
  }
}

export function createDefaultChatUIOptions(): DefaultChatUIOptions {
  const labels = createDefaultChatLabels()

  return {
    layout: {
      contentMaxWidth: 980,
      panelPadding: 12,
      panelGap: 12,
      leftAside: {
        mode: 'dock',
        width: 300,
        collapsedWidth: 56,
        defaultOpen: false,
      },
      rightAside: false,
    },
    brand: {
      name: 'TinyRobot',
      logo: IconAi,
    },
    labels,
    history: {
      menuItems: [
        { id: 'rename', text: labels.renameConversation },
        { id: 'delete', text: labels.deleteConversation },
      ],
    },
    bubble: {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon: h(IconAi, { style: { fontSize: '40px' } }) as any,
    },
    prompts: {
      items: [],
    },
    sender: {
      mode: 'multiple',
      clearable: true,
      maxLength: 1000,
      showWordLimit: true,
    },
    model: {},
    mcp: {},
  }
}

export function createDefaultChatUIData(labels: ChatLabels): DefaultChatUIData {
  return {
    conversation: {
      items: [],
      activeId: null,
      title: labels.newConversationTitle,
    },
    bubble: {
      messages: [],
    },
    sender: {
      loading: false,
      disabled: false,
      submitDisabled: false,
    },
    model: undefined,
    mcp: undefined,
  }
}
