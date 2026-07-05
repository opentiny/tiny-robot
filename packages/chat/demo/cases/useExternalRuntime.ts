import { computed, shallowRef } from 'vue'
import type { ChatConversationItem, ChatMessageItem, ChatRuntime, ChatSubmitPayload } from '../../src'
import type { RequestProcessingState, RequestState } from '@opentiny/tiny-robot-kit'
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

export function useExternalRuntime() {
  const firstConversation = createConversation('External Custom Runtime')
  const conversations = shallowRef<ChatConversationItem[]>([firstConversation])
  const currentId = shallowRef<string | null>(firstConversation.id)
  const messagesByConversation = shallowRef<Record<string, ChatMessageItem[]>>({
    [firstConversation.id]: [],
  })
  const inputValue = shallowRef('')
  const loading = shallowRef(false)
  const requestState = shallowRef<RequestState>('idle')
  const processingState = shallowRef<RequestProcessingState | undefined>()
  const lastError = shallowRef<unknown | null>(null)
  let activeRunId = 0

  const messages = computed(() => (currentId.value ? (messagesByConversation.value[currentId.value] ?? []) : []))
  const disabled = computed(() => false)
  const submitDisabled = computed(() => disabled.value || loading.value || inputValue.value.trim().length === 0)

  function updateCurrentMessages(next: ChatMessageItem[]) {
    if (!currentId.value) {
      return
    }

    messagesByConversation.value = {
      ...messagesByConversation.value,
      [currentId.value]: next,
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
    const now = Date.now()

    conversations.value = conversations.value.map((item) =>
      item.id === current.id ? { ...item, title: item.title || text.slice(0, 20), updatedAt: now } : item,
    )
    loading.value = true
    requestState.value = 'processing'
    processingState.value = 'requesting'
    inputValue.value = ''
    updateCurrentMessages([...messages.value, { role: 'user', content: text }])

    try {
      await new Promise((resolve) => setTimeout(resolve, 120))

      if (currentRunId !== activeRunId || requestState.value === 'aborted') {
        return
      }

      updateCurrentMessages([
        ...messages.value,
        {
          role: 'assistant',
          content: `External runtime 回复：${text}`,
        },
      ])
      requestState.value = 'completed'
    } catch (error) {
      lastError.value = error
      requestState.value = 'error'
      throw error
    } finally {
      if (currentRunId === activeRunId) {
        loading.value = false
        processingState.value = undefined
      }
    }
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
      inputValue,
      disabled,
      loading,
      submitDisabled,
    },
    actions: {
      setInputValue: (value) => {
        inputValue.value = value
      },
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
    title: 'External Custom Runtime',
    placeholder: '输入消息验证外部 runtime',
  })

  return {
    isMobile,
    runtime,
    ui,
  }
}
