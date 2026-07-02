import { shallowRef } from 'vue'
import { useConversation, type UseConversationOptions } from '@opentiny/tiny-robot-kit'
import { useKitChatRuntime, type UseKitChatRuntimeOptions } from './useKitChatRuntime'

export type UseManagedChatRuntimeOptions = Omit<UseKitChatRuntimeOptions, 'inputValue' | 'lastError'>

export function useManagedChatRuntime(
  options: UseConversationOptions,
  runtimeOptions: UseManagedChatRuntimeOptions = {},
) {
  const inputValue = shallowRef('')
  const lastError = shallowRef<unknown | null>(null)

  return useKitChatRuntime(useConversation(options), {
    ...runtimeOptions,
    inputValue,
    lastError,
  })
}
