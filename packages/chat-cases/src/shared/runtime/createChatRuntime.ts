import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import { useLocalChatRuntime, type ChatMcpServers, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import { createMockConversationStorage, type MockConversationSeed } from './mockConversationStorage'

export interface ChatCaseRuntimeOptions {
  storageKey?: string
  initialConversations?: readonly MockConversationSeed[]
  modelProviders: readonly ChatProviderConfig[]
  mcpServers: ChatMcpServers
}

export function useChatCaseRuntime(options: ChatCaseRuntimeOptions) {
  const initialConversations = options.initialConversations ?? []
  const storage = options.storageKey
    ? initialConversations.length
      ? createMockConversationStorage(options.storageKey, initialConversations)
      : localStorageStrategyFactory({ key: options.storageKey })
    : undefined

  const runtime: ReturnType<typeof useLocalChatRuntime> = useLocalChatRuntime({
    mcpServers: options.mcpServers,
    modelProviders: options.modelProviders,
    conversation:
      options.storageKey || initialConversations.length
        ? {
            ...(storage ? { storage } : {}),
            onLoad: (conversations) => {
              if (!runtime) return

              if (conversations.length) {
                runtime.actions.switchConversation(conversations[0].id)
                return
              }

              if (!initialConversations.length) return

              let firstConversationId: string | undefined

              for (const item of initialConversations) {
                runtime.actions.createConversation({ title: item.title, metadata: item.metadata })
                firstConversationId ??= runtime.conversations.value[0]?.id
              }

              if (firstConversationId) {
                runtime.actions.switchConversation(firstConversationId)
              }
            },
          }
        : undefined,
  })

  return runtime
}
