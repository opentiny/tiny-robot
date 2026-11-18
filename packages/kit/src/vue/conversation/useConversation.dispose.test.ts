import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useConversation } from './useConversation'
import type { ConversationInfo } from './types'
import type { ChatMessage } from '../../types'
import type { ConversationStorageStrategy } from '../../storage'
import type { ResponseProvider } from '../message/types'

const emptyReply: ResponseProvider = async () => ({
  id: 'reply',
  object: 'chat.completion',
  created: 1,
  model: 'test',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content: '完成' },
      delta: undefined,
      logprobs: null,
      finish_reason: 'stop',
    },
  ],
})
const info = (id: string): ConversationInfo => ({ id, createdAt: 1, updatedAt: 1 })
function storage() {
  const histories = new Map<string, ChatMessage[]>()
  const adapter: ConversationStorageStrategy = {
    loadConversations: () => [],
    loadMessages: () => [],
    saveConversation: () => {},
    saveMessages: (id, messages) => {
      histories.set(id, JSON.parse(JSON.stringify(messages)))
    },
  }
  return { adapter, histories }
}

describe('conversation disposal', () => {
  it('reports final persistence failure while still releasing the conversation', async () => {
    const { adapter } = storage()
    const failure = new Error('存储不可用')
    let fail = false
    const save = adapter.saveMessages
    adapter.saveMessages = (id, messages) => {
      if (fail) throw failure
      return save(id, messages)
    }
    const conversation = useConversation({
      storage: adapter,
      autoSaveMessages: true,
      useMessageOptions: { responseProvider: emptyReply },
    })
    conversation.createConversation({ id: 'final' })
    await conversation.saveMessages('final')
    fail = true
    await expect(conversation.dispose()).rejects.toMatchObject({ errors: [failure] })
    expect(() => conversation.createConversation()).toThrow(/disposed/i)
  })
  it('aborts every owned conversation without navigating or deleting history and releases idempotently', async () => {
    const { adapter, histories } = storage()
    const signals: AbortSignal[] = []
    const responseProvider: ResponseProvider = (_body, signal) =>
      new Promise((_resolve, reject) => {
        signals.push(signal)
        signal.addEventListener('abort', () => reject(new DOMException('Stopped', 'AbortError')), { once: true })
      })
    const conversation = useConversation({
      storage: adapter,
      autoSaveMessages: true,
      useMessageOptions: { responseProvider },
    })
    const a = conversation.createConversation({ id: 'a' })
    const first = a.engine.sendMessage('问题 A').catch(() => {})
    await vi.waitFor(() => expect(signals).toHaveLength(1))
    const b = conversation.createConversation({ id: 'b' })
    const second = b.engine.sendMessage('问题 B').catch(() => {})
    await vi.waitFor(() => expect(signals).toHaveLength(2))
    const closing = conversation.dispose()
    expect(conversation.dispose()).toBe(closing)
    await closing
    await Promise.all([first, second])
    expect(signals.map((signal) => signal.aborted)).toEqual([true, true])
    expect(conversation.activeConversationId.value).toBe('b')
    expect(histories.get('a')?.[0]).toMatchObject({ role: 'user', content: '问题 A' })
    expect(histories.get('b')?.[0]).toMatchObject({ role: 'user', content: '问题 B' })
    expect(() => conversation.createConversation()).toThrow(/disposed/i)
    await expect(conversation.sendMessage('释放后')).rejects.toThrow(/disposed/i)
    await expect(conversation.saveMessages('a')).rejects.toThrow(/disposed/i)
  })

  it('flushes final messages and prevents delayed saves after disposal', async () => {
    vi.useFakeTimers()
    try {
      const { adapter, histories } = storage()
      const conversation = useConversation({
        storage: adapter,
        autoSaveMessages: true,
        autoSaveThrottle: 1000,
        useMessageOptions: { responseProvider: emptyReply },
      })
      const active = conversation.createConversation({ id: 'saved' })
      active.engine.messages.value = [{ role: 'user', content: '最新消息' }]
      await nextTick()
      await conversation.dispose()
      expect(histories.get('saved')).toEqual([{ role: 'user', content: '最新消息' }])
      active.engine.messages.value[0].content = '释放后改动'
      await nextTick()
      await vi.advanceTimersByTimeAsync(2000)
      expect(histories.get('saved')).toEqual([{ role: 'user', content: '最新消息' }])
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not activate a conversation whose stored messages arrive after disposal', async () => {
    let resolveMessages!: (messages: ChatMessage[]) => void
    const { adapter } = storage()
    adapter.loadConversations = () => [info('stored')]
    adapter.loadMessages = () =>
      new Promise((resolve) => {
        resolveMessages = resolve
      })
    const conversation = useConversation({ storage: adapter, useMessageOptions: { responseProvider: emptyReply } })
    await vi.waitFor(() => expect(conversation.conversations.value).toHaveLength(1))
    const switching = conversation.switchConversation('stored')
    const rejected = expect(switching).rejects.toThrow(/disposed/i)
    await conversation.dispose()
    resolveMessages([{ role: 'user', content: '旧消息' }])
    await rejected
    expect(conversation.activeConversation.value).toBeNull()
  })

  it('ignores initial storage results received after disposal', async () => {
    let resolveList!: (list: ConversationInfo[]) => void
    const { adapter } = storage()
    adapter.loadConversations = () =>
      new Promise((resolve) => {
        resolveList = resolve
      })
    const conversation = useConversation({ storage: adapter, useMessageOptions: { responseProvider: emptyReply } })
    await conversation.dispose()
    resolveList([info('late')])
    await nextTick()
    await nextTick()
    expect(conversation.conversations.value).toEqual([])
  })

  it('finishes asynchronous error hooks before saving and completing disposal', async () => {
    let continueError!: () => void
    let entered = false
    const { adapter, histories } = storage()
    const conversation = useConversation({
      storage: adapter,
      autoSaveMessages: true,
      useMessageOptions: {
        responseProvider: async () => {
          throw new Error('模型失败')
        },
        plugins: [
          {
            onError: async ({ appendMessage }) => {
              entered = true
              await new Promise<void>((resolve) => {
                continueError = resolve
              })
              appendMessage({ role: 'assistant', content: '错误说明' })
            },
          },
        ],
      },
    })
    const active = conversation.createConversation({ id: 'error' })
    const sending = active.engine.sendMessage('问题').catch(() => {})
    await vi.waitFor(() => expect(entered).toBe(true))
    const closing = conversation.dispose()
    continueError()
    await closing
    await sending
    expect(histories.get('error')?.at(-1)).toMatchObject({ content: '错误说明' })
  })

  it('ignores a cancelled post-request hook that completes after disposal', async () => {
    let continueAfter!: () => void
    let entered = false
    const { adapter, histories } = storage()
    const conversation = useConversation({
      storage: adapter,
      autoSaveMessages: true,
      useMessageOptions: {
        responseProvider: emptyReply,
        plugins: [
          {
            onAfterRequest: async ({ appendMessage, currentMessage }) => {
              entered = true
              await new Promise<void>((resolve) => {
                continueAfter = resolve
              })
              currentMessage.content = '迟到改写'
              appendMessage({ role: 'assistant', content: '迟到内容' })
            },
          },
        ],
      },
    })
    const active = conversation.createConversation({ id: 'post' })
    const sending = active.engine.sendMessage('问题').catch(() => {})
    await vi.waitFor(() => expect(entered).toBe(true))
    await conversation.dispose()
    const finalMessages = JSON.parse(JSON.stringify(active.engine.messages.value))
    continueAfter()
    await sending
    await nextTick()
    expect(active.engine.messages.value).toEqual(finalMessages)
    expect(histories.get('post')).toEqual(finalMessages)
  })

  it('retains engines with pending end hooks so disposal can cancel them after navigation', async () => {
    let signal: AbortSignal | undefined
    const { adapter } = storage()
    const conversation = useConversation({
      storage: adapter,
      useMessageOptions: {
        responseProvider: emptyReply,
        plugins: [
          {
            onTurnEnd: ({ abortSignal }) =>
              new Promise<void>((resolve) => {
                signal = abortSignal
                abortSignal.addEventListener('abort', () => resolve(), { once: true })
              }),
          },
        ],
      },
    })
    const a = conversation.createConversation({ id: 'a' })
    const b = conversation.createConversation({ id: 'b' })
    await conversation.switchConversation(a.id)
    const sending = conversation.sendMessage('问题').catch(() => {})
    await vi.waitFor(() => expect(signal).toBeDefined())
    await conversation.switchConversation(b.id)
    await conversation.dispose()
    await sending
    expect(signal?.aborted).toBe(true)
    expect(conversation.activeConversationId.value).toBe('b')
  })

  it('reuses the working engine when concurrent storage restores complete for one conversation', async () => {
    const loads: Array<(messages: ChatMessage[]) => void> = []
    let signal: AbortSignal | undefined
    const { adapter } = storage()
    adapter.loadConversations = () => [info('a')]
    adapter.loadMessages = () => new Promise((resolve) => loads.push(resolve))
    const conversation = useConversation({
      storage: adapter,
      useMessageOptions: {
        responseProvider: (_body, abortSignal) =>
          new Promise<never>((_resolve, reject) => {
            signal = abortSignal
            abortSignal.addEventListener('abort', () => reject(new DOMException('Stopped', 'AbortError')), {
              once: true,
            })
          }),
      },
    })
    await vi.waitFor(() => expect(conversation.conversations.value).toHaveLength(1))
    const first = conversation.switchConversation('a')
    const second = conversation.switchConversation('a')
    loads[0]([])
    const restored = (await first)!
    const sending = restored.engine.sendMessage('问题').catch(() => {})
    await vi.waitFor(() => expect(signal).toBeDefined())
    loads[1]([])
    expect((await second)?.engine).toBe(restored.engine)
    await conversation.dispose()
    await sending
    expect(signal?.aborted).toBe(true)
  })
})
