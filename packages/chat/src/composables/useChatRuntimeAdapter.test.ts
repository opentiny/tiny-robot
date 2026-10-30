import { describe, expect, it, vi } from 'vitest'
import { ref, shallowRef } from 'vue'
import type { Ref } from 'vue'
import type {
  ChatConversation,
  ChatRequestState,
  ChatRuntime,
  ChatRuntimeActionErrorPayload,
  ChatRuntimeActions,
  ChatSendPayload,
} from '../types'
import { useChatRuntimeAdapter } from './useChatRuntimeAdapter'

function createRuntime(
  conversationId: string,
  send: ChatRuntimeActions['send'] = async () => true,
): { runtime: ChatRuntime; activeConversation: Ref<ChatConversation> } {
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

describe('useChatRuntimeAdapter sender turn state', () => {
  it('keeps a paused turn cancellable without changing its request state or messages', async () => {
    const { runtime, activeConversation } = createRuntime('paused')
    activeConversation.value.requestState = 'paused'
    activeConversation.value.messages = [
      { role: 'assistant', content: 'Waiting for approval', streamState: 'finished' },
    ]
    runtime.composer.submitDisabled = ref(true)
    runtime.actions.abort = vi.fn(async () => {
      activeConversation.value.requestState = 'aborted'
    })
    const adapter = useChatRuntimeAdapter({ runtime, onActionError: () => undefined })

    expect(adapter.inputValue.value).toBe('')
    expect(adapter.data.value.sender).toMatchObject({ loading: true, disabled: false, submitDisabled: true })
    expect(adapter.data.value.request?.state).toBe('paused')
    expect(activeConversation.value.requestState).toBe('paused')
    expect(adapter.data.value.bubble?.messages).toBe(activeConversation.value.messages)
    expect(adapter.data.value.bubble?.messages?.[0].streamState).toBe('finished')

    await adapter.abort()

    expect(runtime.actions.abort).toHaveBeenCalledOnce()
    expect(adapter.data.value.request?.state).toBe('aborted')
    expect(adapter.data.value.sender?.loading).toBe(false)
  })

  it('keeps the stop state through pause and resume, then releases it when the turn ends', () => {
    const { runtime, activeConversation } = createRuntime('turn')
    const adapter = useChatRuntimeAdapter({ runtime, onActionError: () => undefined })
    const states: readonly [ChatRequestState, boolean][] = [
      ['idle', false],
      ['processing', true],
      ['paused', true],
      ['processing', true],
      ['completed', false],
      ['processing', true],
      ['paused', true],
      ['aborted', false],
      ['error', false],
    ]

    for (const [state, loading] of states) {
      activeConversation.value.requestState = state
      expect(adapter.data.value.sender?.loading, state).toBe(loading)
      expect(adapter.data.value.request?.state).toBe(state)
    }
  })

  it('derives the stop state from the selected conversation, including an empty selection', () => {
    const { runtime, activeConversation: pausedConversation } = createRuntime('paused')
    pausedConversation.value.requestState = 'paused'
    const { activeConversation: idleConversation } = createRuntime('idle')
    const activeConversation = shallowRef<ChatConversation | null>(pausedConversation.value)
    const adapter = useChatRuntimeAdapter({
      runtime: { ...runtime, activeConversation },
      onActionError: () => undefined,
    })

    expect(adapter.data.value.sender?.loading).toBe(true)
    activeConversation.value = idleConversation.value
    expect(adapter.data.value.sender?.loading).toBe(false)
    expect(adapter.data.value.request?.state).toBe('idle')
    activeConversation.value = null
    expect(adapter.data.value.sender?.loading).toBe(false)
    expect(adapter.data.value.request).toBeUndefined()
    activeConversation.value = pausedConversation.value
    expect(adapter.data.value.sender?.loading).toBe(true)
    expect(adapter.data.value.request?.state).toBe('paused')
  })
})

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
  it('restores a rejected draft when send creates the first conversation', async () => {
    const activeConversation = shallowRef<ChatConversation | null>(null)
    const runtime: ChatRuntime = {
      conversations: ref([]),
      activeConversation,
      composer: {},
      actions: {
        send: async () => {
          activeConversation.value = { id: 'created', title: 'created', messages: [], requestState: 'idle' }
          return false
        },
        clearActiveConversation: () => undefined,
        createConversation: () => undefined,
        switchConversation: () => undefined,
        renameConversation: () => undefined,
        deleteConversation: () => undefined,
      },
    }
    const adapter = useChatRuntimeAdapter({ runtime, onActionError: () => undefined })
    adapter.setInputValue('retry')

    await expect(adapter.send({ text: 'retry' })).resolves.toBe(false)
    expect(adapter.inputValue.value).toBe('retry')
  })

  it('restores a draft when first-conversation send throws after creation', async () => {
    const activeConversation = shallowRef<ChatConversation | null>(null)
    const sendError = new Error('send failed')
    const runtime: ChatRuntime = {
      conversations: ref([]),
      activeConversation,
      composer: {},
      actions: {
        send: async () => {
          activeConversation.value = { id: 'created', title: 'created', messages: [], requestState: 'idle' }
          throw sendError
        },
        clearActiveConversation: () => undefined,
        createConversation: () => undefined,
        switchConversation: () => undefined,
        renameConversation: () => undefined,
        deleteConversation: () => undefined,
      },
    }
    const observedErrors: ChatRuntimeActionErrorPayload[] = []
    const adapter = useChatRuntimeAdapter({
      runtime,
      onActionError: (payload) => observedErrors.push(payload),
    })
    adapter.setInputValue('retry')

    await expect(adapter.send({ text: 'retry' })).resolves.toBe(false)
    expect(adapter.inputValue.value).toBe('retry')
    expect(observedErrors).toEqual([{ action: 'send', payload: { text: 'retry' }, error: sendError }])
  })

  it('restores a draft when concurrent empty-target sends create the conversation', async () => {
    const activeConversation = shallowRef<ChatConversation | null>(null)
    let finishFirst!: (accepted: boolean) => void
    let finishSecond!: (accepted: boolean) => void
    const firstResult = new Promise<boolean>((resolve) => {
      finishFirst = resolve
    })
    const secondResult = new Promise<boolean>((resolve) => {
      finishSecond = resolve
    })
    let calls = 0
    const runtime: ChatRuntime = {
      conversations: ref([]),
      activeConversation,
      composer: {},
      actions: {
        send: async () => {
          calls++
          if (calls === 2)
            activeConversation.value = { id: 'created', title: 'created', messages: [], requestState: 'idle' }
          return calls === 1 ? firstResult : secondResult
        },
        clearActiveConversation: () => undefined,
        createConversation: () => undefined,
        switchConversation: () => undefined,
        renameConversation: () => undefined,
        deleteConversation: () => undefined,
      },
    }
    const adapter = useChatRuntimeAdapter({ runtime, onActionError: () => undefined })
    adapter.setInputValue('retry')
    const first = adapter.send({ text: 'first' })
    const second = adapter.send({ text: 'second' })
    await Promise.resolve()
    finishFirst(false)
    await first
    finishSecond(false)
    await second
    expect(adapter.inputValue.value).toBe('retry')
  })

  it('preserves text entered while a send creates the first conversation', async () => {
    const activeConversation = shallowRef<ChatConversation | null>(null)
    let finish!: () => void
    const wait = new Promise<void>((resolve) => {
      finish = resolve
    })
    const runtime: ChatRuntime = {
      conversations: ref([]),
      activeConversation,
      composer: {},
      actions: {
        send: async () => {
          await wait
          activeConversation.value = { id: 'created', title: 'created', messages: [], requestState: 'idle' }
          return false
        },
        clearActiveConversation: () => undefined,
        createConversation: () => undefined,
        switchConversation: () => undefined,
        renameConversation: () => undefined,
        deleteConversation: () => undefined,
      },
    }
    const adapter = useChatRuntimeAdapter({ runtime, onActionError: () => undefined })
    adapter.setInputValue('retry')
    const sending = adapter.send({ text: 'retry' })
    await Promise.resolve()
    adapter.setInputValue('new draft')
    finish()

    await expect(sending).resolves.toBe(false)
    expect(adapter.inputValue.value).toBe('new draft')
  })

  it('rejects a submission whose conversation changes before the draft microtask', async () => {
    const send = vi.fn(async () => true)
    const current = createRuntime('conversation-1', send)
    const adapter = useChatRuntimeAdapter({ runtime: current.runtime, onActionError: () => undefined })
    adapter.setInputValue('bound draft')
    const pending = adapter.send({ text: 'bound draft' })
    current.activeConversation.value = {
      id: 'conversation-2',
      title: 'conversation-2',
      messages: [],
      requestState: 'idle',
    }
    await expect(pending).resolves.toBe(false)
    expect(send).not.toHaveBeenCalled()
    expect(adapter.inputValue.value).toBe('')
  })

  it('rejects a submission whose runtime changes before the draft microtask', async () => {
    const firstSend = vi.fn(async () => true)
    const first = createRuntime('conversation-1', firstSend)
    const second = createRuntime('conversation-1')
    const runtime = shallowRef(first.runtime)
    const adapter = useChatRuntimeAdapter({ runtime, onActionError: () => undefined })
    const pending = adapter.send({ text: 'bound draft' })
    runtime.value = second.runtime
    await expect(pending).resolves.toBe(false)
    expect(firstSend).not.toHaveBeenCalled()
  })
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

  it('does not match replacement runtime navigation against a pending empty send snapshot', async () => {
    let finishFirstSend!: (accepted: boolean) => void
    const firstActiveConversation = shallowRef<ChatConversation | null>(null)
    const firstRuntime: ChatRuntime = {
      conversations: ref([]),
      activeConversation: firstActiveConversation,
      composer: {},
      actions: {
        send: () =>
          new Promise<boolean>((resolve) => {
            finishFirstSend = resolve
          }),
        clearActiveConversation: () => undefined,
        createConversation: () => undefined,
        switchConversation: () => undefined,
        renameConversation: () => undefined,
        deleteConversation: () => undefined,
      },
    }
    const secondActiveConversation = shallowRef<ChatConversation | null>(null)
    const secondRuntime: ChatRuntime = {
      conversations: ref([{ id: 'existing', title: 'existing' }]),
      activeConversation: secondActiveConversation,
      composer: {},
      actions: {
        send: async () => true,
        clearActiveConversation: () => undefined,
        createConversation: () => undefined,
        switchConversation: () => undefined,
        renameConversation: () => undefined,
        deleteConversation: () => undefined,
      },
    }
    const runtime = shallowRef(firstRuntime)
    const adapter = useChatRuntimeAdapter({ runtime, onActionError: () => undefined })
    const send = adapter.send({ text: 'first runtime send' })
    await Promise.resolve()

    runtime.value = secondRuntime
    adapter.setInputValue('replacement runtime draft')
    secondActiveConversation.value = {
      id: 'existing',
      title: 'existing',
      messages: [],
      requestState: 'idle',
    }

    expect(adapter.inputValue.value).toBe('')
    finishFirstSend(true)
    await send
  })
})
