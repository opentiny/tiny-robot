import { computed, shallowRef, type Ref } from 'vue'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type { ChatConversation, ChatConversationInfo, ChatRuntime, ChatSubmitPayload } from '../types'

export interface UseKitChatRuntimeOptions {
  conversation: UseConversationReturn
  lastError?: Ref<unknown | null>
  send?: (payload: ChatSubmitPayload) => Promise<void> | void
}

export function useKitChatRuntime({ conversation, lastError: errorRef, send }: UseKitChatRuntimeOptions): ChatRuntime {
  const lastError = errorRef ?? shallowRef<unknown | null>(null)
  const conversationErrors = shallowRef<Record<string, unknown | null>>({})

  const activeKitConversation = computed(() => conversation.activeConversation.value)
  const historyItems = computed<ChatConversationInfo[]>(() =>
    conversation.conversations.value.map((item) => ({
      id: item.id,
      title: item.title || '新对话',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      metadata: item.metadata,
    })),
  )
  const activeConversation = computed<ChatConversation | null>(() => {
    const active = activeKitConversation.value

    if (!active) {
      return null
    }

    return {
      id: active.id,
      title: active.title || '新对话',
      createdAt: active.createdAt,
      updatedAt: active.updatedAt,
      metadata: active.metadata,
      messages: active.engine.messages.value,
      requestState: active.engine.requestState.value,
      processingState: active.engine.processingState.value,
      lastError: conversationErrors.value[active.id] ?? null,
    }
  })
  const disabled = computed(() => !send && !activeKitConversation.value)

  const sendMessage =
    send ??
    (async ({ text }: ChatSubmitPayload) => {
      if (!text.trim()) {
        return
      }

      await activeKitConversation.value?.engine.sendMessage(text)
    })

  async function handleSend(payload: ChatSubmitPayload) {
    let conversationId = conversation.activeConversation.value?.id ?? null
    let task: Promise<void> | void

    try {
      task = sendMessage(payload)
      conversationId = conversation.activeConversation.value?.id ?? conversationId

      if (conversationId) {
        conversationErrors.value = {
          ...conversationErrors.value,
          [conversationId]: null,
        }
      }

      lastError.value = null
      await task
    } catch (error) {
      if (conversationId) {
        conversationErrors.value = {
          ...conversationErrors.value,
          [conversationId]: error,
        }
      }

      if (conversation.activeConversation.value?.id === conversationId) {
        lastError.value = error
      }

      throw error
    }
  }

  return {
    conversations: historyItems,
    activeConversation,
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
        const wasActiveConversation = conversation.activeConversation.value?.id === id

        await conversation.deleteConversation(id)

        const { [id]: _removedConversationError, ...restConversationErrors } = conversationErrors.value
        conversationErrors.value = restConversationErrors

        if (wasActiveConversation) {
          lastError.value = null
        }
      },
    },
  }
}
