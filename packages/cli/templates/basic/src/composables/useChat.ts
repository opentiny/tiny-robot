import { sseStreamToGenerator, useConversation } from '@opentiny/tiny-robot-kit'
import { computed, ref } from 'vue'
import { useModel } from './useModel'

function createChatStore() {
  const inputMessage = ref('')
  const modelStore = useModel()
  const { selectedModel, getSelectedModelParams } = modelStore

  const useConversationReturn = useConversation({
    useMessageOptions: {
      responseProvider: async (requestBody, abortSignal) => {
        const currentModel = selectedModel.value
        if (!currentModel) {
          throw new Error('No model selected.')
        }
        if (!currentModel.apiKey) {
          throw new Error(`Missing API key for provider "${currentModel.provider}".`)
        }

        const response = await fetch(currentModel.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentModel.apiKey}`,
          },
          body: JSON.stringify({
            ...requestBody,
            ...getSelectedModelParams(),
            stream: true,
          }),
          signal: abortSignal,
        })

        if (!response.ok) {
          const detail = await response.text().catch(() => '')
          throw new Error(`HTTP ${response.status}: ${response.statusText}${detail ? ` - ${detail}` : ''}`)
        }

        return sseStreamToGenerator(response, { signal: abortSignal })
      },
      initialMessages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
      ],
      plugins: [
        {
          onError({ currentTurn, error }) {
            console.error(error)
            currentTurn[currentTurn.length - 1].content = String(error)
          },
        },
      ],
    },
    autoSaveMessages: true,
  })

  const messages = computed(() => useConversationReturn.activeConversation.value?.engine.messages.value || [])
  const isProcessing = computed(
    () => useConversationReturn.activeConversation.value?.engine.isProcessing.value ?? false,
  )

  function sendMessage(content: string) {
    const value = content?.trim()
    if (!value || isProcessing.value) {
      return
    }
    if (!useConversationReturn.activeConversationId.value) {
      useConversationReturn.createConversation({ title: value.slice(0, 24) })
    }
    useConversationReturn.sendMessage(value)
    inputMessage.value = ''
  }

  return {
    ...useConversationReturn,
    ...modelStore,
    messages,
    inputMessage,
    isProcessing,
    sendMessage,
  }
}

type ChatStore = ReturnType<typeof createChatStore>
let chatStore: ChatStore | null = null

export function useChat() {
  if (!chatStore) {
    chatStore = createChatStore()
  }
  return chatStore
}
