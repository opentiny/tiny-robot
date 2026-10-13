import type { ChatMessage, ConversationInfo, ConversationStorageStrategy } from '@opentiny/tiny-robot-kit'

export function createMockConversationStorage(): ConversationStorageStrategy {
  const conversations = new Map<string, ConversationInfo>()
  const messages = new Map<string, ChatMessage[]>()
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

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
