import { computed, reactive, ref } from 'vue'
import type { ChatCompletionStreamResponse, MessageRequestBody } from '@opentiny/tiny-robot-kit'
import type {
  ChatConversation,
  ChatConversationInfo,
  ChatMessageItem,
  ChatProcessingState,
  ChatRequestState,
  ChatRuntime,
  ChatSubmitPayload,
} from '../../src'
import { createDeepSeekResponseProvider } from '../deepseek-provider'

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

function createMessageId() {
  return `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toRequestMessage(message: ChatMessageItem): MessageRequestBody['messages'][number] {
  return {
    role: message.role,
    content: typeof message.content === 'string' ? message.content : undefined,
    reasoning_content: message.reasoning_content,
    tool_calls: message.tool_calls?.map((toolCall, index) => ({
      ...toolCall,
      index,
      type: 'function' as const,
    })),
    tool_call_id: message.tool_call_id,
    name: message.name,
  }
}

function toRequestBody(messages: ChatMessageItem[]): MessageRequestBody {
  return {
    messages: messages.filter((message) => Boolean(message.role)).map(toRequestMessage),
  }
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

function isAsyncGenerator<T>(value: unknown): value is AsyncGenerator<T> {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'next' in value &&
    typeof (value as { next?: unknown }).next === 'function' &&
    Symbol.asyncIterator in value,
  )
}

function createConversationState(): ConversationState {
  return reactive({
    messages: [] as ChatMessageItem[],
    requestState: 'idle' as ChatRequestState,
    processingState: undefined as ChatProcessingState | undefined,
    lastError: null as unknown | null,
  }) as ConversationState
}

function createReactiveMessage(message: ChatMessageItem): ChatMessageItem {
  return reactive(message) as ChatMessageItem
}

function finishMessageLoading(message: ChatMessageItem) {
  if (message.loading) {
    message.loading = undefined
  }
}

export function useCustomRuntime() {
  const responseProvider = createDeepSeekResponseProvider()
  const firstConversation = createConversation('Custom Runtime')
  const conversations = ref<ChatConversationInfo[]>([firstConversation])
  const activeConversationId = ref<string | null>(firstConversation.id)
  const statesByConversation = reactive<Record<string, ConversationState>>({
    [firstConversation.id]: createConversationState(),
  })
  const runIds = ref<Record<string, number>>({})
  const abortControllers = ref<Record<string, AbortController>>({})

  const activeConversation = computed<ChatConversation | null>(() => {
    if (!activeConversationId.value) {
      return null
    }

    const info = conversations.value.find((item) => item.id === activeConversationId.value)
    const state = statesByConversation[activeConversationId.value]

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
    if (!statesByConversation[conversationId]) {
      statesByConversation[conversationId] = createConversationState()
    }

    return statesByConversation[conversationId]
  }

  function ensureConversation(title = '新对话') {
    let current = conversations.value.find((item) => item.id === activeConversationId.value)

    if (!current) {
      current = createConversation(title)
      conversations.value = [current, ...conversations.value]
      activeConversationId.value = current.id
      ensureConversationState(current.id)
    }

    return current
  }

  function setAbortController(conversationId: string, controller?: AbortController) {
    if (!controller) {
      const { [conversationId]: _removedController, ...restControllers } = abortControllers.value
      abortControllers.value = restControllers
      return
    }

    abortControllers.value = {
      ...abortControllers.value,
      [conversationId]: controller,
    }
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
    const state = ensureConversationState(conversationId)
    const currentRunId = setRunId(conversationId)
    const abortController = new AbortController()
    const now = Date.now()
    const userMessage = createReactiveMessage({ id: createMessageId(), role: 'user', content: text })
    const assistantMessage = createReactiveMessage({
      id: createMessageId(),
      role: 'assistant',
      content: '',
      loading: true,
    })

    conversations.value = conversations.value.map((item) =>
      item.id === current.id ? { ...item, title: item.title || text.slice(0, 20), updatedAt: now } : item,
    )
    setAbortController(conversationId, abortController)
    state.lastError = null
    state.requestState = 'processing'
    state.processingState = 'requesting'
    state.messages.push(userMessage)
    const requestMessages = state.messages.slice()
    state.messages.push(assistantMessage)

    try {
      const result = await responseProvider(toRequestBody(requestMessages), abortController.signal)
      const stream = isAsyncGenerator<ChatCompletionStreamResponse>(result) ? result : null

      if (!stream) {
        throw new Error('DeepSeek demo provider did not return an async stream.')
      }

      for await (const chunk of stream) {
        if (runIds.value[conversationId] !== currentRunId) {
          return
        }

        const delta = chunk.choices?.[0]?.delta
        const content = typeof delta?.content === 'string' ? delta.content : ''
        const reasoningContent = typeof delta?.reasoning_content === 'string' ? delta.reasoning_content : ''

        if (!content && !reasoningContent) {
          continue
        }

        state.requestState = 'processing'
        state.processingState = 'completing'
        finishMessageLoading(assistantMessage)

        if (content) {
          assistantMessage.content = `${typeof assistantMessage.content === 'string' ? assistantMessage.content : ''}${content}`
        }

        if (reasoningContent) {
          assistantMessage.reasoning_content = `${assistantMessage.reasoning_content || ''}${reasoningContent}`
        }
      }

      if (runIds.value[conversationId] !== currentRunId) {
        return
      }

      setAbortController(conversationId)
      state.requestState = 'completed'
      state.processingState = undefined
      finishMessageLoading(assistantMessage)
    } catch (error) {
      if (runIds.value[conversationId] !== currentRunId) {
        return
      }

      setAbortController(conversationId)
      state.requestState = isAbortError(error) ? 'aborted' : 'error'
      state.processingState = undefined
      state.lastError = isAbortError(error) ? null : error
      finishMessageLoading(assistantMessage)
    }
  }

  const runtime: ChatRuntime = {
    conversations: computed(() => conversations.value),
    activeConversation,
    composer: {
      disabled,
      runConfig: computed(() => ({})),
    },
    actions: {
      send,
      abort: () => {
        if (!activeConversationId.value) {
          return
        }

        const conversationId = activeConversationId.value

        setRunId(conversationId)
        abortControllers.value[conversationId]?.abort()
        setAbortController(conversationId)
        const state = ensureConversationState(conversationId)
        state.requestState = 'aborted'
        state.processingState = undefined
        state.messages.forEach(finishMessageLoading)
      },
      createConversation: (payload) => {
        const next = createConversation(payload?.title || '新对话')
        conversations.value = [next, ...conversations.value]
        activeConversationId.value = next.id
        ensureConversationState(next.id)
      },
      switchConversation: (id) => {
        activeConversationId.value = id
      },
      renameConversation: (id, title) => {
        conversations.value = conversations.value.map((item) => (item.id === id ? { ...item, title } : item))
      },
      deleteConversation: (id) => {
        abortControllers.value[id]?.abort()
        conversations.value = conversations.value.filter((item) => item.id !== id)
        const { [id]: _removedRunId, ...restRunIds } = runIds.value
        const { [id]: _removedController, ...restControllers } = abortControllers.value

        delete statesByConversation[id]
        runIds.value = restRunIds
        abortControllers.value = restControllers

        if (activeConversationId.value === id) {
          activeConversationId.value = null
        }
      },
    },
  }

  return runtime
}
