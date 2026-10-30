import type { ChatMessage, ConversationInfo, ConversationStorageStrategy } from '@opentiny/tiny-robot-kit'

export interface MockConversationSeed {
  title: string
  metadata?: ConversationInfo['metadata']
  messages: readonly ChatMessage[]
}

export function createMockConversationStorage(
  seeds: readonly MockConversationSeed[] = [],
): ConversationStorageStrategy {
  const conversations = new Map<string, ConversationInfo>()
  const messages = new Map<string, ChatMessage[]>()
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

  seeds.forEach((seed, index) => {
    const timestamp = Date.now() - (seeds.length - index) * 1000
    const conversation: ConversationInfo = {
      id: `web-component-conversation-${index + 1}`,
      title: seed.title,
      metadata: seed.metadata,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    conversations.set(conversation.id, clone(conversation))
    messages.set(conversation.id, clone([...seed.messages]))
  })

  return {
    loadConversations: () => clone([...conversations.values()]),
    loadMessages: (id) => clone(messages.get(id) ?? []),
    saveConversation: (conversation) => conversations.set(conversation.id, clone(conversation)),
    saveMessages: (id, value) => messages.set(id, clone(value)),
    deleteConversation: (id) => {
      conversations.delete(id)
      messages.delete(id)
    },
  }
}
