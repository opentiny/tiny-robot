import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatMessage } from '../../types'
import type { ConversationStorageStrategy } from '../../storage'
import type { ConversationInfo } from './types'
import type { ChatCompletion, ResponseProvider } from '../message/types'
import { useConversation } from './useConversation'

const completion = (content = 'assistant reply'): ChatCompletion => ({
  id: 'conversation-completion',
  object: 'chat.completion',
  created: 1,
  model: 'mock',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content },
      delta: undefined,
      logprobs: null,
      finish_reason: 'stop',
    },
  ],
})

const responseProvider: ResponseProvider = async () => completion()

const info = (id: string, title = id, updatedAt = 2): ConversationInfo => ({
  id,
  title,
  createdAt: 1,
  updatedAt,
})

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const createMemoryStorage = (initialConversations: ConversationInfo[] = []) => {
  const conversations = new Map(initialConversations.map((conversation) => [conversation.id, clone(conversation)]))
  const messages = new Map<string, ChatMessage[]>()
  const storage: ConversationStorageStrategy = {
    loadConversations: () => [...conversations.values()].map((conversation) => clone(conversation)),
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

  return { storage, conversations, messages }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useConversation lifecycle', () => {
  it('restores conversation metadata and lazily loads messages when switched', async () => {
    const persisted = info('stored', 'Stored conversation')
    const { storage, messages } = createMemoryStorage([persisted])
    messages.set('stored', [{ role: 'user', content: 'restored message' }])
    let loaded: ConversationInfo[] | undefined
    const conversation = useConversation({
      storage,
      useMessageOptions: { responseProvider },
      onLoad: (items) => {
        loaded = items
      },
    })

    await vi.waitFor(() => expect(conversation.conversations.value).toEqual([persisted]))
    const active = await conversation.switchConversation('stored')

    expect(loaded).toEqual([persisted])
    expect(conversation.activeConversationId.value).toBe('stored')
    expect(active?.engine.messages.value).toEqual([{ role: 'user', content: 'restored message' }])
    await expect(conversation.switchConversation('missing')).resolves.toBeNull()
    await expect(conversation.switchConversation('stored')).resolves.toBe(active)
  })

  it('merges an async storage load without overwriting conversations created in memory', async () => {
    let resolveLoad!: (items: ConversationInfo[]) => void
    const delayedLoad = new Promise<ConversationInfo[]>((resolve) => {
      resolveLoad = resolve
    })
    let loaded: ConversationInfo[] | undefined
    const storage: ConversationStorageStrategy = {
      loadConversations: () => delayedLoad,
      loadMessages: () => [],
      saveConversation: () => undefined,
      saveMessages: () => undefined,
    }
    const conversation = useConversation({
      storage,
      useMessageOptions: { responseProvider },
      onLoad: (items) => {
        loaded = items
      },
    })
    conversation.createConversation({ id: 'shared', title: 'Memory title' })

    resolveLoad([info('shared', 'Stored title'), info('remote', 'Remote title')])

    await vi.waitFor(() => expect(conversation.conversations.value).toHaveLength(2))
    expect(conversation.conversations.value.map(({ id, title }) => ({ id, title }))).toEqual([
      { id: 'shared', title: 'Memory title' },
      { id: 'remote', title: 'Remote title' },
    ])
    expect(loaded?.map(({ id, title }) => ({ id, title }))).toEqual([
      { id: 'shared', title: 'Memory title' },
      { id: 'remote', title: 'Remote title' },
    ])
  })

  it('persists consumer-visible create, message, title, and delete operations', async () => {
    vi.spyOn(Date, 'now').mockReturnValueOnce(100).mockReturnValue(200)
    const { storage, conversations, messages } = createMemoryStorage()
    const api = useConversation({ storage, useMessageOptions: { responseProvider } })

    const created = api.createConversation({ id: 'one', title: 'Draft', metadata: { source: 'user' } })
    await api.sendMessage('hello')
    await api.saveMessages()
    api.updateConversationTitle('one', 'Published')

    expect(created.id).toBe('one')
    expect(api.activeConversation.value?.title).toBe('Published')
    expect(conversations.get('one')).toMatchObject({
      id: 'one',
      title: 'Published',
      updatedAt: 200,
      metadata: { source: 'user' },
    })
    expect(messages.get('one')).toMatchObject([
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'assistant reply' },
    ])

    await api.deleteConversation('one')

    expect(api.conversations.value).toEqual([])
    expect(api.activeConversation.value).toBeNull()
    expect(conversations.has('one')).toBe(false)
    expect(messages.has('one')).toBe(false)
  })

  it('does not restore a deleted conversation when an asynchronous title save finishes late', async () => {
    const conversations = new Map<string, ConversationInfo>()
    let releaseTitleSave!: () => void
    const titleSavePending = new Promise<void>((resolve) => {
      releaseTitleSave = resolve
    })
    let markTitleSaveStarted!: () => void
    const titleSaveStarted = new Promise<void>((resolve) => {
      markTitleSaveStarted = resolve
    })
    let markTitleSaveFinished!: () => void
    const titleSaveFinished = new Promise<void>((resolve) => {
      markTitleSaveFinished = resolve
    })
    const storage: ConversationStorageStrategy = {
      loadConversations: () => [],
      loadMessages: () => [],
      saveConversation: async (nextConversation) => {
        const snapshot = clone(nextConversation)
        if (snapshot.title === 'Updated') {
          markTitleSaveStarted()
          await titleSavePending
        }
        conversations.set(snapshot.id, snapshot)
        if (snapshot.title === 'Updated') {
          markTitleSaveFinished()
        }
      },
      saveMessages: () => undefined,
      deleteConversation: (id) => {
        conversations.delete(id)
      },
    }
    const api = useConversation({ storage, useMessageOptions: { responseProvider } })
    api.createConversation({ id: 'one', title: 'Draft' })
    await api.saveMessages('one')

    api.updateConversationTitle('one', 'Updated')
    await titleSaveStarted
    const deletion = api.deleteConversation('one')
    await Promise.race([deletion, new Promise<void>((resolve) => setTimeout(resolve, 0))])

    releaseTitleSave()
    await titleSaveFinished
    await deletion

    expect(conversations.has('one')).toBe(false)
  })

  it('waits for asynchronous persistence deletion before resolving', async () => {
    let releaseDelete!: () => void
    let markDeleteStarted!: () => void
    const deleteStarted = new Promise<void>((resolve) => {
      markDeleteStarted = resolve
    })
    const deletePending = new Promise<void>((resolve) => {
      releaseDelete = resolve
    })
    const storage: ConversationStorageStrategy = {
      loadConversations: () => [info('one')],
      loadMessages: () => [],
      saveConversation: () => undefined,
      saveMessages: () => undefined,
      deleteConversation: () => {
        markDeleteStarted()
        return deletePending
      },
    }
    const api = useConversation({ storage, useMessageOptions: { responseProvider } })
    await vi.waitFor(() => expect(api.conversations.value).toHaveLength(1))
    await api.switchConversation('one')

    let resolved = false
    const deletion = api.deleteConversation('one').then(() => {
      resolved = true
    })
    await deleteStarted

    await expect(
      Promise.race([
        deletion.then(() => 'resolved'),
        new Promise<string>((resolve) => queueMicrotask(() => resolve('pending'))),
      ]),
    ).resolves.toBe('pending')
    expect(resolved).toBe(false)
    expect(api.activeConversationId.value).toBeNull()
    expect(api.activeConversation.value).toBeNull()

    releaseDelete()
    await deletion
    expect(resolved).toBe(true)
  })

  it('finishes an in-flight save before deleting persisted data', async () => {
    const conversations = new Map<string, ConversationInfo>()
    const messages = new Map<string, ChatMessage[]>()
    let markSaveStarted!: () => void
    const saveStarted = new Promise<void>((resolve) => {
      markSaveStarted = resolve
    })
    let releaseSave!: () => void
    const savePending = new Promise<void>((resolve) => {
      releaseSave = resolve
    })
    const storage: ConversationStorageStrategy = {
      loadConversations: () => [],
      loadMessages: () => [],
      saveConversation: async (conversation) => {
        markSaveStarted()
        await savePending
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
    const api = useConversation({ storage, useMessageOptions: { responseProvider } })
    api.createConversation({ id: 'one' })
    await saveStarted

    let deletionResolved = false
    const deletion = api.deleteConversation('one').then(() => {
      deletionResolved = true
    })
    await Promise.resolve()
    await Promise.resolve()

    expect(deletionResolved).toBe(false)
    expect(api.activeConversationId.value).toBeNull()

    releaseSave()
    await deletion
    expect(conversations.has('one')).toBe(false)
    expect(messages.has('one')).toBe(false)
  })

  it('keeps later saves serialized when a conversation id is recreated during deletion', async () => {
    const conversations = new Map<string, ConversationInfo>()
    const messages = new Map<string, ChatMessage[]>()
    let releaseOldSave!: () => void
    const oldSavePending = new Promise<void>((resolve) => {
      releaseOldSave = resolve
    })
    let markOldSaveStarted!: () => void
    const oldSaveStarted = new Promise<void>((resolve) => {
      markOldSaveStarted = resolve
    })
    let releaseRecreatedSave!: () => void
    const recreatedSavePending = new Promise<void>((resolve) => {
      releaseRecreatedSave = resolve
    })
    let markRecreatedSaveStarted!: () => void
    const recreatedSaveStarted = new Promise<void>((resolve) => {
      markRecreatedSaveStarted = resolve
    })
    let markRecreatedSaveFinished!: () => void
    const recreatedSaveFinished = new Promise<void>((resolve) => {
      markRecreatedSaveFinished = resolve
    })
    const storage: ConversationStorageStrategy = {
      loadConversations: () => [],
      loadMessages: () => [],
      saveConversation: (nextConversation) => {
        conversations.set(nextConversation.id, clone(nextConversation))
      },
      saveMessages: async (id, nextMessages) => {
        const snapshot = clone(nextMessages)
        if (snapshot[0]?.content === 'old') {
          markOldSaveStarted()
          await oldSavePending
        } else if (snapshot.length === 1 && snapshot[0]?.content === 'recreated') {
          markRecreatedSaveStarted()
          await recreatedSavePending
        }
        messages.set(id, snapshot)
        if (snapshot.length === 1 && snapshot[0]?.content === 'recreated') {
          markRecreatedSaveFinished()
        }
      },
      deleteConversation: (id) => {
        conversations.delete(id)
        messages.delete(id)
      },
    }
    const api = useConversation({ storage, useMessageOptions: { responseProvider } })
    api.createConversation({
      id: 'one',
      useMessageOptions: { initialMessages: [{ role: 'user', content: 'old' }] },
    })
    await oldSaveStarted

    const deletion = api.deleteConversation('one')
    await vi.waitFor(() => expect(api.conversations.value).toEqual([]))
    const recreated = api.createConversation({
      id: 'one',
      useMessageOptions: { initialMessages: [{ role: 'user', content: 'recreated' }] },
    })
    releaseOldSave()
    await recreatedSaveStarted
    await deletion

    recreated.engine.messages.value.push({ role: 'user', content: 'latest' })
    const latestSave = api.saveMessages('one')
    await Promise.race([latestSave, new Promise<void>((resolve) => setTimeout(resolve, 0))])
    releaseRecreatedSave()
    await recreatedSaveFinished
    await latestSave

    expect(conversations.get('one')).toMatchObject({ id: 'one' })
    expect(messages.get('one')).toEqual([
      { role: 'user', content: 'recreated' },
      { role: 'user', content: 'latest' },
    ])
  })

  it('keeps active state cleared when persisted deletion fails', async () => {
    const storage: ConversationStorageStrategy = {
      loadConversations: () => [info('one')],
      loadMessages: () => [],
      saveConversation: () => undefined,
      saveMessages: () => undefined,
      deleteConversation: async () => {
        throw new Error('delete failed')
      },
    }
    const api = useConversation({ storage, useMessageOptions: { responseProvider } })
    await vi.waitFor(() => expect(api.conversations.value).toHaveLength(1))
    await api.switchConversation('one')

    await expect(api.deleteConversation('one')).rejects.toThrow('delete failed')

    expect(api.conversations.value).toEqual([])
    expect(api.activeConversationId.value).toBeNull()
    expect(api.activeConversation.value).toBeNull()
  })

  it('clears all runtime and persisted conversations', async () => {
    const { storage, conversations } = createMemoryStorage()
    const api = useConversation({ storage, useMessageOptions: { responseProvider } })
    api.createConversation({ id: 'one' })
    await api.saveMessages('one')
    api.createConversation({ id: 'two' })
    await api.saveMessages('two')

    api.clear()

    expect(api.conversations.value).toEqual([])
    expect(api.activeConversationId.value).toBeNull()
    expect(api.activeConversation.value).toBeNull()
    expect(conversations.size).toBe(0)
  })

  it('keeps configured initial messages when persisted message loading fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const storage: ConversationStorageStrategy = {
      loadConversations: () => [info('stored')],
      loadMessages: async () => {
        throw new Error('storage unavailable')
      },
      saveConversation: () => undefined,
      saveMessages: () => undefined,
    }
    const api = useConversation({
      storage,
      useMessageOptions: {
        initialMessages: [{ role: 'system', content: 'fallback context' }],
        responseProvider,
      },
    })
    await vi.waitFor(() => expect(api.conversations.value).toHaveLength(1))

    const active = await api.switchConversation('stored')

    expect(active?.engine.messages.value).toEqual([{ role: 'system', content: 'fallback context' }])
  })
})
