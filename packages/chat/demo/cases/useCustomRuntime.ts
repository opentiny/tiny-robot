import { computed, shallowRef } from 'vue'
import type { RequestProcessingState, RequestState } from '@opentiny/tiny-robot-kit'
import type { ChatConversationItem, ChatMessageItem, ChatRuntime, ChatSubmitPayload } from '../../src'
import { createDemoReply } from '../scenario'
import { useDemoChatUi } from './shared'

function createConversation(title: string): ChatConversationItem {
  const now = Date.now()

  return {
    id: `conversation-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    createdAt: now,
    updatedAt: now,
  }
}

export function useCustomRuntime() {
  const firstConversation = createConversation('Custom Runtime')
  const conversations = shallowRef<ChatConversationItem[]>([firstConversation])
  const currentId = shallowRef<string | null>(firstConversation.id)
  const messagesByConversation = shallowRef<Record<string, ChatMessageItem[]>>({
    [firstConversation.id]: [],
  })
  const loading = shallowRef(false)
  const requestState = shallowRef<RequestState>('idle')
  const processingState = shallowRef<RequestProcessingState | undefined>()
  const lastError = shallowRef<unknown | null>(null)
  let activeRunId = 0

  const messages = computed(() => (currentId.value ? (messagesByConversation.value[currentId.value] ?? []) : []))
  const disabled = computed(() => false)

  function updateMessages(conversationId: string, next: ChatMessageItem[]) {
    messagesByConversation.value = {
      ...messagesByConversation.value,
      [conversationId]: next,
    }
  }

  function ensureConversation(title = '新对话') {
    let current = conversations.value.find((item) => item.id === currentId.value)

    if (!current) {
      current = createConversation(title)
      conversations.value = [current, ...conversations.value]
      currentId.value = current.id
      messagesByConversation.value = {
        ...messagesByConversation.value,
        [current.id]: [],
      }
    }

    return current
  }

  async function send(payload: ChatSubmitPayload) {
    const text = payload.text.trim()

    if (!text) {
      return
    }

    const currentRunId = activeRunId + 1
    activeRunId = currentRunId
    const current = ensureConversation(text.slice(0, 20))
    const conversationId = current.id
    const now = Date.now()
    const initialMessages = messagesByConversation.value[conversationId] ?? []
    const userMessages = [...initialMessages, { role: 'user', content: text }]
    let assistantContent = ''

    conversations.value = conversations.value.map((item) =>
      item.id === current.id ? { ...item, title: item.title || text.slice(0, 20), updatedAt: now } : item,
    )
    lastError.value = null
    loading.value = true
    requestState.value = 'processing'
    processingState.value = 'requesting'
    updateMessages(conversationId, userMessages)

    await new Promise<void>((resolve) => window.setTimeout(resolve, 240))

    if (currentRunId !== activeRunId) {
      return
    }

    assistantContent = createDemoReply('Custom Runtime', text)
    processingState.value = 'completing'
    updateMessages(conversationId, [
      ...userMessages,
      {
        role: 'assistant',
        content: assistantContent,
        loading: true,
      },
    ])

    await new Promise<void>((resolve) => window.setTimeout(resolve, 80))

    if (currentRunId !== activeRunId) {
      return
    }

    updateMessages(conversationId, [
      ...userMessages,
      {
        role: 'assistant',
        content: assistantContent,
        loading: false,
      },
    ])
    loading.value = false
    requestState.value = 'completed'
    processingState.value = undefined
  }

  const runtime: ChatRuntime = {
    conversations: {
      items: computed(() => conversations.value),
      currentId,
    },
    messages: {
      items: computed(() => messages.value),
      requestState,
      processingState,
      lastError,
    },
    sender: {
      disabled,
      loading,
    },
    actions: {
      send,
      abort: () => {
        activeRunId += 1
        loading.value = false
        requestState.value = 'aborted'
        processingState.value = undefined
      },
      createConversation: (payload) => {
        const next = createConversation(payload?.title || '新对话')
        conversations.value = [next, ...conversations.value]
        currentId.value = next.id
        messagesByConversation.value = {
          ...messagesByConversation.value,
          [next.id]: [],
        }
      },
      switchConversation: (id) => {
        currentId.value = id
      },
      renameConversation: (id, title) => {
        conversations.value = conversations.value.map((item) => (item.id === id ? { ...item, title } : item))
      },
      deleteConversation: (id) => {
        conversations.value = conversations.value.filter((item) => item.id !== id)
        const [next] = conversations.value
        currentId.value = next?.id ?? null
      },
    },
  }

  const { isMobile, ui } = useDemoChatUi({
    title: 'Custom Runtime',
    description: '用户自有数据层适配为 ChatRuntime。',
    placeholder: '输入消息验证自定义 Runtime 路径',
  })

  return {
    isMobile,
    runtime,
    ui,
  }
}
