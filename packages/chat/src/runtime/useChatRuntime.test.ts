import { describe, expect, it } from 'vitest'
import type { ChatMessage, ConversationInfo, ConversationStorageStrategy } from '@opentiny/tiny-robot-kit'
import { errorStatePlugin } from './plugins/errorStatePlugin'
import { useChatRuntime } from './useChatRuntime'

const createMemoryStorage = (): ConversationStorageStrategy => {
  const conversations = new Map<string, ConversationInfo>()
  const messages = new Map<string, ChatMessage[]>()
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

  return {
    loadConversations: () => clone([...conversations.values()]),
    loadMessages: (id) => clone(messages.get(id) ?? []),
    saveConversation: (conversation) => {
      conversations.set(conversation.id, clone(conversation))
    },
    saveMessages: (id, nextMessages) => {
      messages.set(id, clone(nextMessages))
    },
    deleteConversation: (id) => {
      conversations.delete(id)
      messages.delete(id)
    },
  }
}

describe('useChatRuntime error state', () => {
  it('stores provider failures on the generated assistant message by default', async () => {
    const providerError = new Error('provider failed')
    const runtime = useChatRuntime({
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () => {
            throw providerError
          },
        },
      },
    })

    await expect(runtime.actions.send({ text: 'fail' })).rejects.toBe(providerError)

    const activeConversation = runtime.activeConversation.value
    expect(activeConversation?.requestState).toBe('error')
    expect(activeConversation?.messages.at(-1)).toMatchObject({
      role: 'assistant',
      state: {
        error: {
          name: 'Error',
          message: 'provider failed',
        },
      },
    })
  })

  it('lets a same-name user plugin disable default error state writes', async () => {
    const providerError = new Error('provider failed')
    const runtime = useChatRuntime({
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () => {
            throw providerError
          },
          plugins: [errorStatePlugin({ disabled: true })],
        },
      },
    })

    await expect(runtime.actions.send({ text: 'fail' })).rejects.toBe(providerError)

    const activeConversation = runtime.activeConversation.value
    expect(activeConversation?.requestState).toBe('error')
    expect(activeConversation?.messages.at(-1)?.state?.error).toBeUndefined()
  })
})
