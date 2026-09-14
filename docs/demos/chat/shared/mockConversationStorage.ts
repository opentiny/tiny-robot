import {
  localStorageStrategyFactory,
  type ChatMessage,
  type ConversationInfo,
  type ConversationStorageStrategy,
} from '@opentiny/tiny-robot-kit'

export interface MockConversationSeed {
  title: string
  metadata?: Record<string, unknown>
  messages: readonly ChatMessage[]
}

export function createMockConversationStorage(
  storageKey: string,
  seeds: readonly MockConversationSeed[],
): ConversationStorageStrategy {
  const storage = localStorageStrategyFactory({ key: storageKey })

  return {
    async loadConversations() {
      const conversations = await storage.loadConversations()

      if (conversations.length || !seeds.length) {
        return conversations
      }

      const now = Date.now()
      const seededConversations: ConversationInfo[] = seeds.map((seed, index) => ({
        id: `tiny-robot-mock-conversation-${index + 1}`,
        title: seed.title,
        createdAt: now - (seeds.length - index) * 1000,
        updatedAt: now - (seeds.length - index) * 1000,
        metadata: seed.metadata,
      }))

      for (const [index, conversation] of seededConversations.entries()) {
        await storage.saveConversation(conversation)
        await storage.saveMessages(conversation.id, [...seeds[index].messages])
      }

      return seededConversations
    },
    loadMessages: (conversationId) => storage.loadMessages(conversationId),
    saveConversation: (conversation) => storage.saveConversation(conversation),
    saveMessages: (conversationId, messages) => storage.saveMessages(conversationId, messages),
    deleteConversation: (conversationId) => storage.deleteConversation?.(conversationId),
  }
}
