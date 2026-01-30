import type { ChatMessage, ConversationInfo, ConversationStorageStrategy } from '@opentiny/tiny-robot-kit'

/**
 * Mock storage: pre-loaded conversations and messages, no real persistence
 */
export class MockStorageStrategy implements ConversationStorageStrategy {
  private conversations: ConversationInfo[] = [
    {
      id: 'm9zfbomexdm9pza',
      title: '安排日程',
      createdAt: 1745744706662,
      updatedAt: 1745744717297,
      metadata: {},
    },
    {
      id: 'm9zefqta1rihhpj',
      title: '写段文案',
      createdAt: 1745743216510,
      updatedAt: 1745744704671,
      metadata: {},
    },
  ]

  private messagesMap: Map<string, ChatMessage[]> = new Map([
    [
      'm9zfbomexdm9pza',
      [
        {
          role: 'user',
          content: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
        },
        {
          role: 'assistant',
          content: '这是对 "今天需要我帮你安排日程，规划旅行，还是起草一封邮件？" 的模拟回复。',
        },
      ],
    ],
    [
      'm9zefqta1rihhpj',
      [
        {
          role: 'user',
          content: '想写段文案、起个名字，还是来点灵感？',
        },
        {
          role: 'assistant',
          content: '这是对 "想写段文案、起个名字，还是来点灵感？" 的模拟回复。',
        },
        {
          role: 'user',
          content: 'hello',
        },
        {
          role: 'assistant',
          content: '你好！我是TinyRobot搭建的AI助手。你可以问我任何问题，我会尽力回答。',
        },
      ],
    ],
  ])

  async loadConversations(): Promise<ConversationInfo[]> {
    return this.conversations || []
  }

  async loadMessages(conversationId: string): Promise<ChatMessage[]> {
    return this.messagesMap.get(conversationId) || []
  }

  async saveConversation(conversation: ConversationInfo): Promise<void> {
    const index = this.conversations.findIndex((c) => c.id === conversation.id)
    if (index >= 0) {
      this.conversations[index] = conversation
    } else {
      this.conversations.push(conversation)
    }
  }

  async saveMessages(conversationId: string, messages: ChatMessage[]): Promise<void> {
    this.messagesMap.set(conversationId, messages)
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const index = this.conversations.findIndex((c) => c.id === conversationId)
    if (index >= 0) {
      this.conversations.splice(index, 1)
    }
    this.messagesMap.delete(conversationId)
  }
}
