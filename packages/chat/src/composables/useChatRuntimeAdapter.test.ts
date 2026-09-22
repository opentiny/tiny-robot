import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import type { ChatConversation, ChatRuntime, ChatRuntimeActionErrorPayload, ChatSendPayload } from '../types'
import { useChatRuntimeAdapter } from './useChatRuntimeAdapter'

describe('useChatRuntimeAdapter error channels', () => {
  it('reports send failures while preserving request state and message-scoped errors', async () => {
    const providerError = new Error('provider failed')
    const payload: ChatSendPayload = { text: 'fail' }
    const messageError = { name: 'Error', message: 'provider failed', code: 'E_PROVIDER' }
    const messages = [
      { id: 'user-1', role: 'user', content: 'fail' },
      {
        id: 'assistant-1',
        role: 'assistant',
        content: 'partial answer',
        state: { error: messageError },
      },
    ]
    const activeConversation = ref<ChatConversation>({
      id: 'conversation-1',
      title: 'Failure',
      messages,
      requestState: 'error',
      processingState: 'requesting',
    })
    const observedErrors: ChatRuntimeActionErrorPayload[] = []
    const runtime: ChatRuntime = {
      conversations: ref([{ id: 'conversation-1', title: 'Failure' }]),
      activeConversation,
      composer: {},
      actions: {
        send: async () => {
          throw providerError
        },
        clearActiveConversation: () => undefined,
        createConversation: () => undefined,
        switchConversation: () => undefined,
        renameConversation: () => undefined,
        deleteConversation: () => undefined,
      },
    }
    const adapter = useChatRuntimeAdapter({
      runtime,
      onActionError: (errorPayload) => observedErrors.push(errorPayload),
    })

    await expect(adapter.send(payload)).resolves.toBe(false)

    expect(observedErrors).toEqual([{ action: 'send', payload, error: providerError }])
    expect(adapter.data.value.request).toEqual({
      state: 'error',
      processingState: 'requesting',
    })
    expect(adapter.data.value.request).not.toHaveProperty('error')
    expect(adapter.data.value.bubble?.messages).toEqual(messages)
  })
})
