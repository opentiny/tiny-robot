import { useConversation, type UseConversationOptions } from '@opentiny/tiny-robot-kit'
import { useKitChatRuntime, type UseKitChatRuntimeOptions } from './useKitChatRuntime'

export function useManagedChatRuntime(options: UseConversationOptions, runtimeOptions?: UseKitChatRuntimeOptions) {
  return useKitChatRuntime(useConversation(options), runtimeOptions)
}
