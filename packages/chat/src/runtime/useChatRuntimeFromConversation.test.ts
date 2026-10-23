import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type { ChatRequestState } from '../types'
import { useChatRuntimeFromConversation } from './useChatRuntimeFromConversation'

function createConversation(id: string, canStart = true) {
  return {
    id,
    title: id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    engine: {
      messages: ref([]),
      requestState: ref<ChatRequestState>('idle'),
      processingState: ref<string | undefined>(),
      canStartTurn: ref(canStart),
      send: vi.fn(async () => undefined),
    },
  }
}

function createHarness(initialId = 'a', canStart = true) {
  const items = new Map([[initialId, createConversation(initialId, canStart)]])
  const activeConversationId = ref<string | null>(initialId)
  const conversations = ref([...items.values()].map(({ engine: _engine, ...item }) => item))
  const activeConversation = computed(() => {
    const item = activeConversationId.value ? items.get(activeConversationId.value) : undefined
    return item ?? null
  })
  const api = {
    conversations,
    activeConversationId,
    activeConversation,
    createConversation: vi.fn((payload?: { id?: string; title?: string }) => {
      const id = payload?.id ?? `created-${items.size}`
      const item = createConversation(id)
      item.title = payload?.title ?? id
      items.set(id, item)
      conversations.value = [...items.values()].map(({ engine: _engine, ...conversation }) => conversation)
      activeConversationId.value = id
      return item
    }),
    switchConversation: vi.fn(async (id: string) => {
      activeConversationId.value = id
      return activeConversation.value
    }),
    deleteConversation: vi.fn(async () => undefined),
    clear: vi.fn(),
    updateConversationTitle: vi.fn(),
    saveMessages: vi.fn(async () => undefined),
    sendMessage: vi.fn(async () => undefined),
    abortActiveRequest: vi.fn(async () => undefined),
  } as unknown as UseConversationReturn
  return { api, items, activeConversationId }
}

describe('useChatRuntimeFromConversation', () => {
  it('uses false as the only custom-send rejection and propagates errors', async () => {
    for (const result of [true, undefined, false] as const) {
      const harness = createHarness()
      const send = vi.fn(async () => result)
      const runtime = useChatRuntimeFromConversation({ conversation: harness.api, send })
      await expect(runtime.actions.send({ text: 'hello' })).resolves.toBe(result !== false)
      expect(send).toHaveBeenCalledOnce()
    }
    const failure = new Error('failed')
    const runtime = useChatRuntimeFromConversation({
      conversation: createHarness().api,
      send: async () => {
        throw failure
      },
    })
    await expect(runtime.actions.send({ text: 'hello' })).rejects.toBe(failure)
  })

  it('applies engine availability gates only to default sends', async () => {
    for (const custom of [true, false]) {
      const harness = createHarness('a', false)
      const send = vi.fn(async () => true)
      const runtime = useChatRuntimeFromConversation({ conversation: harness.api, ...(custom ? { send } : {}) })
      expect(runtime.composer.submitDisabled?.value).toBe(!custom)
      await expect(runtime.actions.send({ text: 'blocked' })).resolves.toBe(custom)
      expect(send).toHaveBeenCalledTimes(custom ? 1 : 0)
    }
  })

  it('allows custom sends without a selected model', async () => {
    const harness = createHarness()
    const model = {
      options: ref([]),
      selectedId: ref(null),
      features: ref({}),
      select: vi.fn(),
      setFeature: vi.fn(),
      setReasoningEffort: vi.fn(),
    }
    const send = vi.fn(async () => true)
    const runtime = useChatRuntimeFromConversation({ conversation: harness.api, send, composer: { model } })

    await expect(runtime.actions.send({ text: 'route elsewhere' })).resolves.toBe(true)
    expect(send).toHaveBeenCalledOnce()
  })

  it('does not count a custom send-created first conversation as navigation', async () => {
    const harness = createHarness('')
    harness.activeConversationId.value = null
    let finish!: (accepted: boolean) => void
    const pending = new Promise<boolean>((resolve) => {
      finish = resolve
    })
    const send = vi.fn(async () => {
      harness.api.createConversation({ id: 'created' })
      return pending
    })
    const runtime = useChatRuntimeFromConversation({ conversation: harness.api, send })
    const sending = runtime.actions.send({ text: 'first' })
    await Promise.resolve()
    expect(runtime.conversationNavigationRevision?.value).toBe(0)
    finish(false)
    await expect(sending).resolves.toBe(false)
    expect(runtime.conversationNavigationRevision?.value).toBe(0)
  })

  it('honors beforeSend branches and releases an occupied target on every exit', async () => {
    const harness = createHarness()
    const handled = useChatRuntimeFromConversation({
      conversation: harness.api,
      beforeSend: async () => 'handled' as const,
      send: vi.fn(async () => true),
    })
    await expect(handled.actions.send({ text: 'handled' })).resolves.toBe(true)

    const rejected = useChatRuntimeFromConversation({
      conversation: createHarness().api,
      beforeSend: async () => 'reject' as const,
      send: vi.fn(async () => true),
    })
    await expect(rejected.actions.send({ text: 'rejected' })).resolves.toBe(false)

    let finish!: (value: undefined) => void
    const pending = new Promise<undefined>((resolve) => {
      finish = resolve
    })
    const send = vi.fn(() => pending)
    const runtime = useChatRuntimeFromConversation({ conversation: createHarness().api, send })
    const first = runtime.actions.send({ text: 'first' })
    await Promise.resolve()
    await expect(runtime.actions.send({ text: 'second' })).resolves.toBe(false)
    finish(undefined)
    await expect(first).resolves.toBe(true)
    await expect(runtime.actions.send({ text: 'third' })).resolves.toBe(true)
  })

  it('rejects a default send when navigation occurs during beforeSend', async () => {
    const harness = createHarness()
    let continueSend!: () => void
    const beforeSend = new Promise<void>((resolve) => {
      continueSend = resolve
    })
    const runtime = useChatRuntimeFromConversation({
      conversation: harness.api,
      beforeSend: async () => {
        await beforeSend
        return 'continue' as const
      },
    })
    const sending = runtime.actions.send({ text: 'hello' })
    await Promise.resolve()
    harness.activeConversationId.value = null
    continueSend()
    await expect(sending).resolves.toBe(false)
    expect(harness.items.get('a')?.engine.send).not.toHaveBeenCalled()
  })

  it('binds default sends to the created target and waits for its engine', async () => {
    const harness = createHarness()
    harness.activeConversationId.value = null
    let finish!: (value: undefined) => void
    const pending = new Promise<undefined>((resolve) => {
      finish = resolve
    })
    const created = vi.spyOn(harness.api, 'createConversation')
    created.mockImplementation((payload) => {
      const item = createConversation('created')
      item.title = payload?.title ?? 'created'
      item.engine.send.mockImplementation(() => pending)
      harness.items.set(item.id, item)
      harness.activeConversationId.value = item.id
      return item as unknown as ReturnType<UseConversationReturn['createConversation']>
    })
    const runtime = useChatRuntimeFromConversation({ conversation: harness.api })
    const send = runtime.actions.send({ text: 'first' })
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
    expect(created).toHaveBeenCalledOnce()
    expect(runtime.composer.submitDisabled?.value).toBe(true)
    finish(undefined)
    await expect(send).resolves.toBe(true)
    expect(harness.items.get('created')?.engine.send).toHaveBeenCalledOnce()
  })
})
