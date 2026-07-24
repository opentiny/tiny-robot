import { computed, shallowRef, type Ref } from 'vue'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type {
  ChatConversationItem,
  ChatProcessingState,
  ChatRequestState,
  ChatRuntime,
  ChatSubmitPayload,
} from '../types'

export interface UseKitChatRuntimeOptions {
  conversation: UseConversationReturn
  lastError?: Ref<unknown | null>
  send?: (payload: ChatSubmitPayload) => Promise<void> | void
}

export function useKitChatRuntime({ conversation, lastError: errorRef, send }: UseKitChatRuntimeOptions): ChatRuntime {
  const lastError = errorRef ?? shallowRef<unknown | null>(null)

  const activeConversation = computed(() => conversation.activeConversation.value)
  const activeEngine = computed(() => activeConversation.value?.engine)
  const historyItems = computed<ChatConversationItem[]>(() =>
    conversation.conversations.value.map((item) => ({
      id: item.id,
      title: item.title || '新对话',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      metadata: item.metadata,
    })),
  )
  const disabled = computed(() => !send && !activeConversation.value)

  const sendMessage =
    send ??
    (async ({ text }: ChatSubmitPayload) => {
      if (!text.trim()) {
        return
      }

      await activeConversation.value?.engine.sendMessage(text)
    })

  async function handleSend(payload: ChatSubmitPayload) {
    lastError.value = null

    try {
      await sendMessage(payload)
    } catch (error) {
      lastError.value = error
      throw error
    }
  }

  return {
    conversations: {
      items: historyItems,
      currentId: computed(() => conversation.activeConversationId.value),
    },
    messages: {
      items: computed(() => activeConversation.value?.engine.messages.value ?? []),
      requestState: computed<ChatRequestState>(() => activeEngine.value?.requestState.value ?? 'idle'),
      processingState: computed<ChatProcessingState | undefined>(() => activeEngine.value?.processingState.value),
      lastError,
    },
    sender: {
      disabled,
    },
    actions: {
      send: handleSend,
      abort: async () => {
        await conversation.abortActiveRequest()
      },
      createConversation: (payload) => {
        conversation.createConversation(payload)
      },
      switchConversation: async (id) => {
        await conversation.switchConversation(id)
      },
      renameConversation: (id, title) => {
        conversation.updateConversationTitle(id, title)
      },
      deleteConversation: async (id) => {
        await conversation.deleteConversation(id)
      },
    },
  }
}
