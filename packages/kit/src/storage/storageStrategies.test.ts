import 'fake-indexeddb/auto'
import { reactive } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatMessage } from '../types'
import type { ConversationInfo } from '../vue/conversation/types'
import { indexedDBStorageStrategyFactory, localStorageStrategyFactory } from './factories'

const createLocalStorage = () => {
  const values = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  }
  return { storage, values }
}

const conversation = (id: string, updatedAt: number): ConversationInfo => ({
  id,
  title: `Conversation ${id}`,
  createdAt: updatedAt - 1,
  updatedAt,
  metadata: { source: 'test' },
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('localStorageStrategyFactory', () => {
  it('persists conversation metadata and restores legacy messages through the configured key', async () => {
    const { storage, values } = createLocalStorage()
    vi.stubGlobal('localStorage', storage)
    const strategy = localStorageStrategyFactory({ key: 'conversation-test' })
    const legacyMessage = {
      role: 'assistant',
      content: 'stale',
      renderContent: [
        { type: 'collapsible-text', content: 'thinking ' },
        { type: 'collapsible-text', content: 'done' },
        { type: 'markdown', content: 'Hello ' },
        { type: 'text', content: 'world' },
      ],
    } as ChatMessage

    await strategy.saveConversation(conversation('one', 10))
    await strategy.saveConversation({ ...conversation('one', 20), title: 'Updated title' })
    await strategy.saveMessages('one', [legacyMessage])

    expect(await strategy.loadConversations()).toEqual([
      {
        id: 'one',
        title: 'Updated title',
        createdAt: 19,
        updatedAt: 20,
        metadata: { source: 'test' },
      },
    ])
    expect(await strategy.loadMessages('one')).toEqual([
      {
        role: 'assistant',
        content: 'Hello world',
        reasoning_content: 'thinking done',
      },
    ])
    expect(JSON.parse(values.get('conversation-test') ?? '[]')).toHaveLength(1)

    await strategy.deleteConversation?.('one')

    expect(await strategy.loadConversations()).toEqual([])
    expect(await strategy.loadMessages('one')).toEqual([])
  })

  it('returns empty data and reports delete failure when persisted JSON is corrupted', async () => {
    const { storage, values } = createLocalStorage()
    values.set('corrupted', '{not-json')
    vi.stubGlobal('localStorage', storage)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const strategy = localStorageStrategyFactory({ key: 'corrupted' })

    expect(await strategy.loadConversations()).toEqual([])
    expect(await strategy.loadMessages('missing')).toEqual([])
    expect(() => strategy.deleteConversation?.('missing')).toThrow(SyntaxError)
  })

  it('propagates deletion writes that localStorage rejects', () => {
    const { storage, values } = createLocalStorage()
    values.set('conversation-test', JSON.stringify([conversation('one', 10)]))
    storage.setItem = () => {
      throw new Error('storage quota exceeded')
    }
    vi.stubGlobal('localStorage', storage)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const strategy = localStorageStrategyFactory({ key: 'conversation-test' })

    expect(() => strategy.deleteConversation?.('one')).toThrow('storage quota exceeded')
  })
})

describe('indexedDBStorageStrategyFactory', () => {
  it('creates, updates, sorts, restores, and deletes conversations', async () => {
    const strategy = indexedDBStorageStrategyFactory({
      dbName: `tiny-robot-conversations-${crypto.randomUUID()}`,
      dbVersion: 1,
    })
    const first = reactive(conversation('first', 10)) as ConversationInfo
    const second = reactive(conversation('second', 20)) as ConversationInfo
    const messages = reactive([
      {
        role: 'assistant',
        content: '',
        renderContent: [
          { type: 'collapsible-text', content: 'reason' },
          { type: 'markdown', content: 'answer' },
        ],
      },
    ]) as ChatMessage[]

    await strategy.saveConversation(first)
    await strategy.saveConversation(second)
    await strategy.saveConversation({ ...first, title: 'First updated', updatedAt: 30 })
    await strategy.saveMessages('first', messages)

    expect(await strategy.loadConversations()).toEqual([
      { ...conversation('first', 10), title: 'First updated', updatedAt: 30 },
      conversation('second', 20),
    ])
    expect(await strategy.loadMessages('first')).toEqual([
      { role: 'assistant', content: 'answer', reasoning_content: 'reason' },
    ])
    expect(await strategy.loadMessages('missing')).toEqual([])

    await strategy.deleteConversation?.('first')

    expect(await strategy.loadConversations()).toEqual([conversation('second', 20)])
    expect(await strategy.loadMessages('first')).toEqual([])
  })
})
