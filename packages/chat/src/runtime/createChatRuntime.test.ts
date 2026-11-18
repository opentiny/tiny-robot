import { describe, expect, it, vi } from 'vitest'
import type { ConversationStorageStrategy } from '@opentiny/tiny-robot-kit'
import { createChatRuntime } from './createChatRuntime'

const storage = (): ConversationStorageStrategy => ({
  loadConversations: () => [],
  loadMessages: () => [],
  saveMessages: () => {},
  saveConversation: () => {},
})

describe('createChatRuntime', () => {
  it('closes owned MCP connections when storage initialization throws', async () => {
    const signals: AbortSignal[] = []
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          const signal = init!.signal!
          signals.push(signal)
          signal.addEventListener('abort', () => reject(new DOMException('Stopped', 'AbortError')), { once: true })
        }),
    )
    try {
      const adapter = storage()
      adapter.loadConversations = () => {
        throw new Error('storage failed')
      }
      expect(() =>
        createChatRuntime({
          mcpServers: [{ id: 'tools', name: 'Tools', baseUrl: 'https://example.test/mcp', installed: true }],
          conversation: {
            storage: adapter,
            useMessageOptions: {
              responseProvider: async () => {
                throw new Error('unused')
              },
            },
          },
        }),
      ).toThrow('storage failed')
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(signals.every((signal) => signal.aborted)).toBe(true)
    } finally {
      fetch.mockRestore()
    }
  })
  it('owns all conversation requests and rejects work after idempotent disposal', async () => {
    const signals: AbortSignal[] = []
    const owned = createChatRuntime({
      conversation: {
        storage: storage(),
        useMessageOptions: {
          responseProvider: (_body, signal) =>
            new Promise<never>((_resolve, reject) => {
              signals.push(signal)
              signal.addEventListener('abort', () => reject(new DOMException('Stopped', 'AbortError')), { once: true })
            }),
        },
      },
    })
    const { runtime } = owned
    const a = runtime.actions.send({ text: 'A' }).catch(() => false)
    await vi.waitFor(() => expect(signals).toHaveLength(1))
    await runtime.actions.createConversation({ title: 'B' })
    const b = runtime.actions.send({ text: 'B' }).catch(() => false)
    await vi.waitFor(() => expect(signals).toHaveLength(2))
    const active = runtime.activeConversation.value?.id
    const dispose = owned.dispose()
    expect(owned.dispose()).toBe(dispose)
    await dispose
    await Promise.all([a, b])
    expect(signals.map((signal) => signal.aborted)).toEqual([true, true])
    expect(runtime.activeConversation.value?.id).toBe(active)
    expect(runtime.conversations.value).toHaveLength(2)
    await expect(runtime.actions.send({ text: 'late' })).rejects.toThrow(/disposed/i)
    await expect(Promise.resolve().then(() => runtime.actions.createConversation())).rejects.toThrow(/disposed/i)
  })

  it('prevents a pending beforeSend from starting a request after disposal', async () => {
    let continueSend!: () => void
    let requests = 0
    const owned = createChatRuntime({
      beforeSend: () =>
        new Promise((resolve) => {
          continueSend = () => resolve('continue')
        }),
      conversation: {
        storage: storage(),
        useMessageOptions: {
          responseProvider: async () => {
            requests++
            throw new Error('Unexpected request')
          },
        },
      },
    })
    const sending = owned.runtime.actions.send({ text: 'waiting' })
    await owned.dispose()
    continueSend()
    await expect(sending).resolves.toBe(false)
    expect(requests).toBe(0)
    expect(owned.runtime.conversations.value).toEqual([])
  })
})
