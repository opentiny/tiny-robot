import { computed, shallowRef, type Ref } from 'vue'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type { ChatConversation, ChatConversationInfo, ChatRuntime, ChatSubmitPayload } from '../types'

type TitleFallback = (text: string) => string
type KitConversationInfo = UseConversationReturn['conversations']['value'][number]

export interface UseKitChatRuntimeOptions {
  conversation: UseConversationReturn
  lastError?: Ref<unknown | null>
  titleFallback?: TitleFallback
  send?: ChatRuntime['actions']['send']
  sender?: Partial<ChatRuntime['sender']>
}
const defaultTitleFallback = (text: string) => text.trim().slice(0, 20) || '新对话'

const toChatConversationInfo = (item: KitConversationInfo): ChatConversationInfo => {
  return {
    id: item.id,
    title: item.title || '新对话',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    metadata: item.metadata,
  }
}

export function useKitChatRuntime(options: UseKitChatRuntimeOptions): ChatRuntime {
  const { conversation, lastError: errorRef, titleFallback, send, sender: senderOptions = {} } = options
  const lastError = errorRef ?? shallowRef<unknown | null>(null)
  const conversationErrors = shallowRef<Record<string, unknown | null>>({})
  const resolveTitle = titleFallback ?? defaultTitleFallback

  const activeKitConversation = computed(() => conversation.activeConversation.value)
  const conversations = computed(() => conversation.conversations.value.map(toChatConversationInfo))

  const activeConversation = computed<ChatConversation | null>(() => {
    const active = activeKitConversation.value

    if (!active) {
      return null
    }

    return {
      ...toChatConversationInfo(active),
      messages: active.engine.messages.value,
      requestState: active.engine.requestState.value,
      processingState: active.engine.processingState.value,
      lastError: conversationErrors.value[active.id] ?? null,
    }
  })

  const sender: ChatRuntime['sender'] = {
    ...senderOptions,
    disabled: senderOptions.disabled ?? shallowRef(false),
  }

  const sendMessage =
    send ??
    (async ({ text }: ChatSubmitPayload) => {
      const nextText = text.trim()

      if (!nextText) {
        return
      }

      let active = activeKitConversation.value

      if (!active) {
        active = conversation.createConversation({ title: resolveTitle(nextText) })
      } else if (!active.title) {
        conversation.updateConversationTitle(active.id, resolveTitle(nextText))
      }

      await active.engine.sendMessage(nextText)
    })

  async function handleSend(payload: ChatSubmitPayload) {
    let conversationId = conversation.activeConversation.value?.id ?? null

    try {
      const task = Promise.resolve(sendMessage(payload))
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
    conversations,
    activeConversation,
    sender,
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
