import { describe, expect, it } from 'vitest'
import { ref, shallowRef } from 'vue'
import type {
  ChatConversation,
  ChatRuntime,
  ChatRuntimeActionErrorPayload,
  ChatRuntimeActions,
  ChatSendPayload,
} from '../types'
import { useChatRuntimeAdapter } from './useChatRuntimeAdapter'

function createRuntime(
  conversationId: string,
  send: ChatRuntimeActions['send'] = async () => true,
): { runtime: ChatRuntime; activeConversation: ReturnType<typeof ref<ChatConversation>> } {
  const activeConversation = ref<ChatConversation>({
    id: conversationId,
    title: conversationId,
    messages: [],
    requestState: 'idle',
  })
  const runtime: ChatRuntime = {
    conversations: ref([{ id: conversationId, title: conversationId }]),
    activeConversation,
    composer: {},
    actions: {
      send,
      clearActiveConversation: () => undefined,
      createConversation: () => undefined,
      switchConversation: () => undefined,
      renameConversation: () => undefined,
      deleteConversation: () => undefined,
    },
  }

  return { runtime, activeConversation }
}

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

describe('useChatRuntimeAdapter runtime-scoped drafts', () => {
  it('clears the draft when the runtime changes with the same active conversation id', () => {
    const first = createRuntime('conversation-1')
    const second = createRuntime('conversation-1')
    const runtime = shallowRef(first.runtime)
    const adapter = useChatRuntimeAdapter({
      runtime,
      onActionError: () => undefined,
    })
    adapter.setInputValue('draft for first runtime')

    runtime.value = second.runtime

    expect(adapter.inputValue.value).toBe('')
  })

  it('does not let an old runtime send completion clear the replacement runtime draft', async () => {
    let resolveFirstSend!: (accepted: boolean) => void
    const firstSend = new Promise<boolean>((resolve) => {
      resolveFirstSend = resolve
    })
    const first = createRuntime('conversation-1', () => firstSend)
    const second = createRuntime('conversation-2')
    const runtime = shallowRef(first.runtime)
    const adapter = useChatRuntimeAdapter({
      runtime,
      onActionError: () => undefined,
    })
    adapter.setInputValue('send from first runtime')

    const send = adapter.send({ text: 'send from first runtime' })
    await Promise.resolve()
    runtime.value = second.runtime
    adapter.setInputValue('draft for second runtime')
    resolveFirstSend(true)
    await send

    expect(adapter.inputValue.value).toBe('draft for second runtime')
  })

  it('does not let an old runtime send suppress replacement runtime navigation cleanup', async () => {
    let resolveFirstSend!: (accepted: boolean) => void
    const firstSend = new Promise<boolean>((resolve) => {
      resolveFirstSend = resolve
    })
    const first = createRuntime('conversation-1', () => firstSend)
    const second = createRuntime('conversation-2')
    const runtime = shallowRef(first.runtime)
    const adapter = useChatRuntimeAdapter({
      runtime,
      onActionError: () => undefined,
    })

    const send = adapter.send({ text: 'send from first runtime' })
    await Promise.resolve()
    runtime.value = second.runtime
    adapter.setInputValue('draft before second runtime navigation')
    second.activeConversation.value = {
      id: 'conversation-3',
      title: 'conversation-3',
      messages: [],
      requestState: 'idle',
    }

    expect(adapter.inputValue.value).toBe('')

    resolveFirstSend(true)
    await send
  })
})
