import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import { useChatRuntime, type ChatMcpServers } from '@opentiny/tiny-robot-chat'
import { createMockConversationStorage, type MockConversationSeed } from './mockConversationStorage'
import { modelProviders } from './modelProviders'

export interface ChatCaseRuntimeOptions {
  storageKey?: string
  initialConversations?: readonly MockConversationSeed[]
  mcpServers?: ChatMcpServers
}

export function useChatCaseRuntime(options: ChatCaseRuntimeOptions) {
  const initialConversations = options.initialConversations ?? []
  const mcpServers = options.mcpServers ?? []
  const storage = options.storageKey
    ? initialConversations.length
      ? createMockConversationStorage(options.storageKey, initialConversations)
      : localStorageStrategyFactory({ key: options.storageKey })
    : undefined

  const runtime: ReturnType<typeof useChatRuntime> = useChatRuntime({
    mcpServers,
    modelProviders,
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

              if (options.storageKey || !initialConversations.length) return

              let firstConversationId: string | undefined

              for (const item of initialConversations) {
                const seedConversation = {
                  title: item.title,
                  metadata: item.metadata,
                  useMessageOptions: { initialMessages: [...item.messages] },
                }

                runtime.actions.createConversation(seedConversation)
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
