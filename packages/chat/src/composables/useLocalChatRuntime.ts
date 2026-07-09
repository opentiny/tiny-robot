import { shallowRef } from 'vue'
import { useConversation, type UseConversationOptions } from '@opentiny/tiny-robot-kit'
import { useKitChatRuntime } from './useKitChatRuntime'

export interface UseLocalChatRuntimeOptions {
  titleFallback?: (text: string) => string
}

const defaultTitleFallback = (text: string) => text.trim().slice(0, 20) || '新对话'

export function useLocalChatRuntime(options: UseConversationOptions, runtimeOptions: UseLocalChatRuntimeOptions = {}) {
  const lastError = shallowRef<unknown | null>(null)
  const titleFallback = runtimeOptions.titleFallback ?? defaultTitleFallback

  const conversation = useConversation({
    autoSaveMessages: true,
    ...options,
  })

  return useKitChatRuntime(conversation, {
    lastError,
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
      } catch (error) {
        lastError.value = error
        throw error
      }
    },
  })
}
