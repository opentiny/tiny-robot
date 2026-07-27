import { computed, shallowRef } from 'vue'
import type {
  ChatConversation,
  ChatConversationInfo,
  ChatMessageItem,
  ChatProcessingState,
  ChatRequestState,
  ChatRuntime,
  ChatSubmitPayload,
} from '../../src'
import { createDemoReply } from '../scenario'

type ConversationState = {
  messages: ChatMessageItem[]
  requestState: ChatRequestState
  processingState?: ChatProcessingState
  lastError: unknown | null
}

function createConversation(title: string): ChatConversationInfo {
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
  const conversations = shallowRef<ChatConversationInfo[]>([firstConversation])
  const activeConversationId = shallowRef<string | null>(firstConversation.id)
  const statesByConversation = shallowRef<Record<string, ConversationState>>({
    [firstConversation.id]: {
      messages: [],
      requestState: 'idle',
      processingState: undefined,
      lastError: null,
    },
  })
  const runIds = shallowRef<Record<string, number>>({})

  const activeConversation = computed<ChatConversation | null>(() => {
    if (!activeConversationId.value) {
      return null
    }

    const info = conversations.value.find((item) => item.id === activeConversationId.value)
    const state = statesByConversation.value[activeConversationId.value]

    if (!info || !state) {
      return null
    }

    return {
      ...info,
      messages: state.messages,
      requestState: state.requestState,
      processingState: state.processingState,
      lastError: state.lastError,
    }
  })
  const disabled = computed(() => false)

  function ensureConversationState(conversationId: string): ConversationState {
    return (
      statesByConversation.value[conversationId] ?? {
        messages: [],
        requestState: 'idle',
        processingState: undefined,
        lastError: null,
      }
    )
  }

  function updateConversationState(conversationId: string, recipe: (state: ConversationState) => ConversationState) {
    statesByConversation.value = {
      ...statesByConversation.value,
      [conversationId]: recipe(ensureConversationState(conversationId)),
    }
  }

  function ensureConversation(title = '新对话') {
    let current = conversations.value.find((item) => item.id === activeConversationId.value)

    if (!current) {
      current = createConversation(title)
      conversations.value = [current, ...conversations.value]
      activeConversationId.value = current.id
      updateConversationState(current.id, (state) => state)
    }

    return current
  }

  function setRunId(conversationId: string) {
    const nextRunId = (runIds.value[conversationId] ?? 0) + 1
    runIds.value = {
      ...runIds.value,
      [conversationId]: nextRunId,
    }

    return nextRunId
  }

  async function send(payload: ChatSubmitPayload) {
    const text = payload.text.trim()

    if (!text) {
      return
    }

    const current = ensureConversation(text.slice(0, 20))
    const conversationId = current.id
    const currentRunId = setRunId(conversationId)
    const now = Date.now()
    const initialMessages = ensureConversationState(conversationId).messages
    const userMessages = [...initialMessages, { role: 'user', content: text }]
    let assistantContent = ''

    conversations.value = conversations.value.map((item) =>
      item.id === current.id ? { ...item, title: item.title || text.slice(0, 20), updatedAt: now } : item,
    )
    updateConversationState(conversationId, (state) => ({
      ...state,
      messages: userMessages,
      requestState: 'processing',
      processingState: 'requesting',
      lastError: null,
    }))

    await new Promise<void>((resolve) => window.setTimeout(resolve, 240))

    if (runIds.value[conversationId] !== currentRunId) {
      return
    }

    assistantContent = createDemoReply('Custom Runtime', text)
    updateConversationState(conversationId, (state) => ({
      ...state,
      requestState: 'processing',
      processingState: 'completing',
      messages: [
        ...userMessages,
        {
          role: 'assistant',
          content: assistantContent,
          loading: true,
        },
      ],
    }))

    await new Promise<void>((resolve) => window.setTimeout(resolve, 80))

    if (runIds.value[conversationId] !== currentRunId) {
      return
    }

    updateConversationState(conversationId, (state) => ({
      ...state,
      messages: [
        ...userMessages,
        {
          role: 'assistant',
          content: assistantContent,
          loading: false,
        },
      ],
      requestState: 'completed',
      processingState: undefined,
    }))
  }

  const runtime: ChatRuntime = {
    conversations: computed(() => conversations.value),
    activeConversation,
    sender: {
      disabled,
    },
    actions: {
      send,
      abort: () => {
        if (!activeConversationId.value) {
          return
        }

        setRunId(activeConversationId.value)
        updateConversationState(activeConversationId.value, (state) => ({
          ...state,
          requestState: 'aborted',
          processingState: undefined,
        }))
      },
      createConversation: (payload) => {
        const next = createConversation(payload?.title || '新对话')
        conversations.value = [next, ...conversations.value]
        activeConversationId.value = next.id
        updateConversationState(next.id, (state) => state)
      },
      switchConversation: (id) => {
        activeConversationId.value = id
      },
      renameConversation: (id, title) => {
        conversations.value = conversations.value.map((item) => (item.id === id ? { ...item, title } : item))
      },
      deleteConversation: (id) => {
        conversations.value = conversations.value.filter((item) => item.id !== id)
        const { [id]: _removedState, ...restStates } = statesByConversation.value
        const { [id]: _removedRunId, ...restRunIds } = runIds.value

        statesByConversation.value = restStates
        runIds.value = restRunIds

        if (activeConversationId.value === id) {
          activeConversationId.value = null
        }
      },
    },
  }

  return runtime
}
