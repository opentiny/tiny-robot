import { useConversation, type UseConversationOptions } from '@opentiny/tiny-robot-kit'
import { useKitChatRuntime } from './useKitChatRuntime'

export interface UseLocalChatRuntimeOptions {
  conversation: UseConversationOptions
  titleFallback?: (text: string) => string
}

const defaultTitleFallback = (text: string) => text.trim().slice(0, 20) || '新对话'

export function useLocalChatRuntime(options: UseLocalChatRuntimeOptions) {
  const resolveTitle = options.titleFallback ?? defaultTitleFallback

  const conversation = useConversation({
    autoSaveMessages: true,
    ...options.conversation,
  })

  return useKitChatRuntime({
    conversation,
    send: async ({ text }) => {
      if (!text.trim()) {
        return
      }

      let active = conversation.activeConversation.value

      if (!active) {
        active = conversation.createConversation({ title: resolveTitle(text) })
      } else if (!active.title) {
        conversation.updateConversationTitle(active.id, resolveTitle(text))
      }

      await active.engine.sendMessage(text)
    },
  })
}
