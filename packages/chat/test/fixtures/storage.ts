import type { ConversationInfo, ConversationStorageStrategy } from '@opentiny/tiny-robot-kit'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'

export function createMemoryStorage(): ConversationStorageStrategy & {
  conversations: ConversationInfo[]
  messages: Map<string, ChatMessage[]>
} {
  const conversations: ConversationInfo[] = []
  const messages = new Map<string, ChatMessage[]>()

  return {
    conversations,
    messages,
    loadConversations: () => conversations.map((conversation) => ({ ...conversation })),
    loadMessages: (id) => (messages.get(id) ?? []).map((message) => ({ ...message })),
    saveConversation: (conversation) => {
      const index = conversations.findIndex((item) => item.id === conversation.id)
      if (index === -1) conversations.push({ ...conversation })
      else conversations[index] = { ...conversation }
    },
    saveMessages: (id, nextMessages) => {
      messages.set(
        id,
        nextMessages.map((message) => ({ ...message })),
      )
    },
    deleteConversation: (id) => {
      const index = conversations.findIndex((conversation) => conversation.id === id)
      if (index !== -1) conversations.splice(index, 1)
      messages.delete(id)
    },
  }
}
