import { useConversation, type UseConversationOptions } from '@opentiny/tiny-robot-kit'
import { useKitChatRuntime, type UseKitChatRuntimeOptions } from './useKitChatRuntime'

export interface UseLocalChatRuntimeOptions {
  conversation: UseConversationOptions
  titleFallback?: (text: string) => string
  sender?: UseKitChatRuntimeOptions['sender']
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
    titleFallback: resolveTitle,
    sender: options.sender,
  })
}
