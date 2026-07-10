import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import type {
  ConversationInfo,
  RequestProcessingState,
  RequestState,
  UseConversationReturn,
} from '@opentiny/tiny-robot-kit'
import type { ChatConversationItem, ChatRuntime, ChatSubmitPayload } from '../types'

export interface UseKitChatRuntimeOptions {
  lastError?: Ref<unknown | null>
  send?: (payload: ChatSubmitPayload) => Promise<void> | void
}

function createStableConversationItems(conversation: UseConversationReturn) {
  type StableConversationItem = {
    id: string
    title: string
    createdAt?: number
    updatedAt?: number
    metadata?: Record<string, unknown>
  }

  const items = ref<StableConversationItem[]>([])

  watch(
    () => conversation.conversations.value,
    (nextItems) => {
      const cache = new Map<string, StableConversationItem>()

      for (const item of items.value) {
        cache.set(item.id, item)
      }

      items.value = nextItems.map((item: ConversationInfo) => {
        const current = cache.get(item.id)

        if (current) {
          current.title = item.title || '新对话'
          current.createdAt = item.createdAt
          current.updatedAt = item.updatedAt
          current.metadata = item.metadata
          return current
        }

        return {
          id: item.id,
          title: item.title || '新对话',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          metadata: item.metadata,
        }
      })
    },
    { immediate: true, deep: true },
  )

  return items as typeof items & { value: ChatConversationItem[] }
}

export function useKitChatRuntime(
  conversation: UseConversationReturn,
  options: UseKitChatRuntimeOptions = {},
): ChatRuntime {
  const lastError = options.lastError ?? shallowRef<unknown | null>(null)
  const { send } = options

  const activeConversation = computed(() => conversation.activeConversation.value)
  const activeEngine = computed(() => activeConversation.value?.engine)
  const historyItems = createStableConversationItems(conversation)
  const loading = computed(() => Boolean(activeEngine.value?.isProcessing.value))
  const disabled = computed(() => false)

  return {
    conversations: {
      items: historyItems,
      currentId: computed(() => conversation.activeConversationId.value),
    },
    messages: {
      items: computed(() => activeConversation.value?.engine.messages.value ?? []),
      requestState: computed<RequestState>(() => activeEngine.value?.requestState.value ?? 'idle'),
      processingState: computed<RequestProcessingState | undefined>(() => activeEngine.value?.processingState.value),
      lastError,
    },
    sender: {
      disabled,
      loading,
    },
    actions: {
      send:
        send ??
        (async ({ text }) => {
          if (!text.trim()) {
            return
          }

          await activeConversation.value?.engine.sendMessage(text)
        }),
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
