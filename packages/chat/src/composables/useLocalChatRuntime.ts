import { useConversation, type UseConversationOptions } from '@opentiny/tiny-robot-kit'
import { useKitChatRuntime, type UseKitChatRuntimeOptions } from './useKitChatRuntime'
import {
  createProviderModelRuntime,
  createProviderRequestPlugin,
  createProviderResponseProvider,
  createProviderRunConfigPlugin,
  resolveProviderModels,
  type ChatProviderConfig,
} from '../provider'

export interface UseLocalChatRuntimeOptions {
  conversation: Omit<UseConversationOptions, 'useMessageOptions'> & {
    useMessageOptions?: Partial<UseConversationOptions['useMessageOptions']>
  }
  titleFallback?: (text: string) => string
  composer?: UseKitChatRuntimeOptions['composer']
  providers?: readonly ChatProviderConfig[]
}

const defaultTitleFallback = (text: string) => text.trim().slice(0, 20) || '新对话'

export function useLocalChatRuntime(options: UseLocalChatRuntimeOptions) {
  const resolveTitle = options.titleFallback ?? defaultTitleFallback
  const providerModels = options.providers ? resolveProviderModels(options.providers) : []
  const providerRuntime = providerModels.length > 0 ? createProviderModelRuntime(providerModels) : null
  const userUseMessageOptions = options.conversation.useMessageOptions
  const useMessageOptions = providerRuntime
    ? {
        ...userUseMessageOptions,
        plugins: [
          createProviderRunConfigPlugin(),
          createProviderRequestPlugin(providerRuntime.resolveModel),
          ...(userUseMessageOptions?.plugins ?? []),
        ],
        responseProvider:
          userUseMessageOptions?.responseProvider ?? createProviderResponseProvider(providerRuntime.resolveModel),
      }
    : userUseMessageOptions

  if (!useMessageOptions?.responseProvider) {
    throw new Error('useLocalChatRuntime requires conversation.useMessageOptions.responseProvider or providers.')
  }

  const conversation = useConversation({
    autoSaveMessages: true,
    ...options.conversation,
    useMessageOptions: useMessageOptions as UseConversationOptions['useMessageOptions'],
  })

  return useKitChatRuntime({
    conversation,
    titleFallback: resolveTitle,
    composer: {
      ...options.composer,
      model: options.composer?.model ?? providerRuntime?.model,
    },
  })
}
