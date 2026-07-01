import { computed, shallowRef } from 'vue'
import type { ChatConversationItem, ChatMessageItem, ChatParts, ChatRuntime, ChatSubmitPayload } from '../../src'
import type { RequestProcessingState, RequestState } from '@opentiny/tiny-robot-kit'

function createConversation(title: string): ChatConversationItem {
  const now = Date.now()

  return {
    id: `conversation-${now}`,
    title,
    createdAt: now,
    updatedAt: now,
  }
}

export function useDemoRuntime() {
  const firstConversation = createConversation('TinyRobot Chat MVP')
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

  const messages = computed(() => (currentId.value ? (messagesByConversation.value[currentId.value] ?? []) : []))
  const disabled = computed(() => false)
  const submitDisabled = computed(() => disabled.value || loading.value || inputValue.value.trim().length === 0)

  function updateCurrentMessages(next: ChatMessageItem[]) {
    messagesByConversation.value = {
      ...messagesByConversation.value,
      [currentId.value ?? '']: next,
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

    await new Promise((resolve) => setTimeout(resolve, 120))

    updateCurrentMessages([
      ...messages.value,
      {
        role: 'assistant',
        content: `收到：${text}`,
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
    composer: {
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

  const parts: ChatParts = {
    layout: {
      leftAside: {
        defaultOpen: true,
        expandedWidth: 260,
      },
    },
    messages: {
      welcome: {
        title: 'TinyRobot Chat',
        description: 'MVP demo',
      },
      prompts: {
        wrap: true,
        items: [
          { label: '介绍一下 TinyRobot Chat' },
          { label: '生成一个 Vue 组件示例' },
          { label: '解释 runtime 和 parts 的职责' },
        ],
      },
      bubbleList: {
        autoScroll: true,
        roleConfigs: {
          user: { placement: 'end' },
          assistant: { placement: 'start' },
        },
      },
    },
    composer: {
      sender: {
        mode: 'multiple',
        placeholder: '输入消息，Enter 发送',
      },
    },
  }

  return {
    runtime,
    parts,
  }
}
