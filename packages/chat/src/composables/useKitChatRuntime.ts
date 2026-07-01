import { computed, shallowRef, type Ref } from 'vue'
import type { RequestProcessingState, RequestState, UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type { ChatRuntime } from '../types'

export interface UseKitChatRuntimeOptions {
  inputValue?: Ref<string>
  titleFallback?: (text: string) => string
}

const defaultTitleFallback = (text: string) => text.trim().slice(0, 20) || '新对话'

export function useKitChatRuntime(
  conversation: UseConversationReturn,
  options: UseKitChatRuntimeOptions = {},
): ChatRuntime {
  const inputValue = options.inputValue ?? shallowRef('')
  const lastError = shallowRef<unknown | null>(null)
  const titleFallback = options.titleFallback ?? defaultTitleFallback

  const activeEngine = computed(() => conversation.activeConversation.value?.engine)
  const loading = computed(() => Boolean(activeEngine.value?.isProcessing.value))
  const disabled = computed(() => false)
  const submitDisabled = computed(() => disabled.value || loading.value || inputValue.value.trim().length === 0)

  return {
    conversations: {
      items: computed(() =>
        conversation.conversations.value.map((item) => ({
          ...item,
          title: item.title || '新对话',
        })),
      ),
      currentId: computed(() => conversation.activeConversationId.value),
    },
    messages: {
      items: computed(() => [...(activeEngine.value?.messages.value ?? [])]),
      requestState: computed<RequestState>(() => activeEngine.value?.requestState.value ?? 'idle'),
      processingState: computed<RequestProcessingState | undefined>(() => activeEngine.value?.processingState.value),
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
      send: async ({ text }) => {
        if (!text.trim()) {
          return
        }

        try {
          lastError.value = null

          let active = conversation.activeConversation.value

          if (!active) {
            active = conversation.createConversation({ title: titleFallback(text) })
          } else if (!active.title) {
            conversation.updateConversationTitle(active.id, titleFallback(text))
          }

          await active.engine.sendMessage(text)
          inputValue.value = ''
        } catch (error) {
          lastError.value = error
          throw error
        }
      },
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
