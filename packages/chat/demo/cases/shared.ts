import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import type {
  ChatCompletion,
  ChatMessage,
  ConversationInfo,
  ConversationStorageStrategy,
  ResponseProvider,
} from '@opentiny/tiny-robot-kit'
import type { ChatUi } from '../../src'

type StoredConversation = ConversationInfo & {
  messages: ChatMessage[]
}

const defaultPrompts = [
  { label: '介绍一下 TinyRobot Chat' },
  { label: '生成一个 Vue 组件示例' },
  { label: '解释 runtime 和 ui 的职责' },
]

export function createDemoResponseProvider(label: string): ResponseProvider<ChatCompletion> {
  return async (requestBody) => {
    const lastMessage = requestBody.messages.at(-1)
    const content = typeof lastMessage?.content === 'string' ? lastMessage.content : ''

    return {
      id: 'chat-demo-completion',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'mock',
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: `${label} 回复：${content || '收到'}`,
          },
          delta: undefined,
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
    }
  }
}

export function createDemoStorage(): ConversationStorageStrategy {
  let conversations: StoredConversation[] = []

  return {
    loadConversations: () =>
      conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        metadata: conversation.metadata,
      })),
    loadMessages: (conversationId) => [
      ...(conversations.find((conversation) => conversation.id === conversationId)?.messages ?? []),
    ],
    saveConversation: (conversation) => {
      const index = conversations.findIndex((item) => item.id === conversation.id)

      if (index === -1) {
        conversations = [{ ...conversation, messages: [] }, ...conversations]
        return
      }

      conversations[index] = {
        ...conversations[index],
        ...conversation,
      }
    },
    saveMessages: (conversationId, messages) => {
      conversations = conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, messages: [...messages] } : conversation,
      )
    },
    deleteConversation: (conversationId) => {
      conversations = conversations.filter((conversation) => conversation.id !== conversationId)
    },
  }
}

export function useDemoChatUi(options: { title: string; description?: string; placeholder: string }) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const ui = computed<ChatUi>(() => ({
    layout: {
      leftAside: {
        mode: isMobile.value ? 'drawer' : 'dock',
        defaultOpen: !isMobile.value,
        expandedWidth: isMobile.value ? 280 : 260,
      },
    },
    welcome: {
      title: options.title,
      description: options.description ?? '',
    },
    prompts: {
      wrap: true,
      items: defaultPrompts,
    },
    bubbleList: {
      autoScroll: true,
      roleConfigs: {
        user: { placement: 'end' },
        assistant: { placement: 'start' },
      },
    },
    sender: {
      mode: 'multiple',
      placeholder: options.placeholder,
    },
  }))

  return {
    isMobile,
    ui,
  }
}
