import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import type {
  ChatMessage,
  ChatCompletion,
  ConversationInfo,
  ConversationStorageStrategy,
  ResponseProvider,
  UseMessagePlugin,
} from '@opentiny/tiny-robot-kit'
import type { ChatMcpRuntime } from '../../types'
import { DEFAULT_CHAT_STORAGE_KEY, createChatRuntime, type CreateChatRuntimeOptions } from './createChatRuntime'

const completion: ChatCompletion = {
  id: 'experimental-runtime-completion',
  object: 'chat.completion',
  created: 1,
  model: 'mock',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content: 'assistant reply' },
      delta: undefined,
      logprobs: null,
      finish_reason: 'stop',
    },
  ],
}

const responseProvider: ResponseProvider = async () => completion

const createMemoryStorage = () => {
  const conversations = new Map<string, ConversationInfo>()
  const messages = new Map<string, ChatMessage[]>()
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
  const storage: ConversationStorageStrategy = {
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

  return { storage, conversations, messages }
}

const createLocalStorage = () => {
  const values = new Map<string, string>()
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() {
      return values.size
    },
  } satisfies Storage
  return { storage, values }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('createChatRuntime', () => {
  it('returns a DOM-oriented runtime handle while preserving runtime defaults', async () => {
    const { storage, messages } = createMemoryStorage()
    const handle = createChatRuntime({
      storage,
      responseProvider,
      composer: { disabled: false, submitDisabled: false },
    })

    expectTypeOf<CreateChatRuntimeOptions['composer']>().toEqualTypeOf<
      { disabled?: boolean; submitDisabled?: boolean } | undefined
    >()
    expect(Object.keys(handle).sort()).toEqual(['dispose', 'runtime'])
    expect(handle.runtime.composer.disabled?.value).toBe(false)
    expect(handle.runtime.composer.submitDisabled?.value).toBe(false)

    await handle.runtime.actions.send({ text: 'hello' })
    await vi.waitFor(() => expect([...messages.values()][0]).toHaveLength(2), { timeout: 2_000 })
    expect([...messages.values()][0]).toMatchObject([
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'assistant reply' },
    ])

    const firstDispose = handle.dispose()
    expect(handle.dispose()).toBe(firstDispose)
    await firstDispose
  })

  it('forwards model-provider and MCP configuration into the runtime', async () => {
    const { storage } = createMemoryStorage()
    const mcpRuntime: ChatMcpRuntime = {
      servers: { value: [] },
      tools: { value: {} },
      addServer: vi.fn(),
      removeServer: vi.fn(),
      setServerEnabled: vi.fn(),
      setToolEnabled: vi.fn(),
    }
    const handle = createChatRuntime({
      storage,
      modelProviders: [
        {
          type: 'openai',
          apiUrl: 'https://example.com/v1',
          models: [{ id: 'model-a', label: 'Model A' }],
        },
      ],
      mcp: {
        runtime: mcpRuntime,
        listTools: async () => [],
        callTool: async () => undefined,
      },
    })

    expect(handle.runtime.composer.model?.options.value).toMatchObject([{ id: 'model-a', label: 'Model A' }])
    expect(handle.runtime.composer.mcp).toBe(mcpRuntime)
    await handle.dispose()
  })

  it('applies public plugins after the built-ins and forwards transformed structured content', async () => {
    const { storage, messages } = createMemoryStorage()
    const requests: Array<Record<string, unknown>> = []
    const plugin: UseMessagePlugin = {
      name: 'experimental-public-plugin',
      onBeforeRequest({ requestBody }) {
        requestBody.publicPluginMarker = 'applied'
      },
    }
    const handle = createChatRuntime({
      storage,
      plugins: [plugin],
      transformSendPayload: async (payload) => ({
        ...payload,
        structuredData: [
          { type: 'text', text: payload.text },
          { type: 'image_url', image_url: { url: 'data:image/png;base64,example' } },
        ],
      }),
      responseProvider: async (request) => {
        requests.push(request)
        return completion
      },
    })

    await expect(handle.runtime.actions.send({ text: 'describe this image' })).resolves.toBe(true)
    await vi.waitFor(() => expect([...messages.values()][0]).toHaveLength(2), { timeout: 2_000 })

    expect(requests).toHaveLength(1)
    expect(requests[0]).toMatchObject({ publicPluginMarker: 'applied' })
    expect([...messages.values()][0][0]).toMatchObject({
      role: 'user',
      content: [
        { type: 'text', text: 'describe this image' },
        { type: 'image_url', image_url: { url: 'data:image/png;base64,example' } },
      ],
    })

    await handle.dispose()
  })

  it('accepts structured-data-only sends and recovers after a payload transformer rejects', async () => {
    const { storage, messages } = createMemoryStorage()
    let shouldReject = true
    const handle = createChatRuntime({
      storage,
      responseProvider,
      transformSendPayload: async (payload) => {
        if (shouldReject) {
          shouldReject = false
          throw new Error('attachment transform failed')
        }

        if (payload.attachments?.length) {
          return {
            ...payload,
            structuredData: [{ type: 'image_url', image_url: { url: 'data:image/png;base64,only-image' } }],
          }
        }

        return payload
      },
    })

    await expect(handle.runtime.actions.send({ text: 'first attempt' })).rejects.toThrow('attachment transform failed')
    await expect(
      handle.runtime.actions.send({
        text: '',
        attachments: [{ name: 'only-image.png', url: 'data:image/png;base64,example', size: 12 }],
      }),
    ).resolves.toBe(true)
    await vi.waitFor(() => expect([...messages.values()][0]).toHaveLength(2), { timeout: 2_000 })
    expect([...messages.values()][0][0]).toMatchObject({
      role: 'user',
      content: [{ type: 'image_url', image_url: { url: 'data:image/png;base64,only-image' } }],
    })

    await expect(handle.runtime.actions.send({ text: 'plain text still works' })).resolves.toBe(true)
    await vi.waitFor(() => expect([...messages.values()][0]).toHaveLength(4), { timeout: 2_000 })
    expect([...messages.values()][0][2]).toMatchObject({ role: 'user', content: 'plain text still works' })

    await handle.dispose()
  })

  it('warns for concurrent default-key owners and preserves their stored data on disposal', async () => {
    const { storage, values } = createLocalStorage()
    const persisted = JSON.stringify([
      {
        id: 'persisted',
        title: 'Persisted',
        createdAt: 1,
        updatedAt: 1,
        messages: [{ role: 'user', content: 'keep' }],
      },
    ])
    values.set(DEFAULT_CHAT_STORAGE_KEY, persisted)
    vi.stubGlobal('localStorage', storage)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const first = createChatRuntime({ responseProvider })
    const second = createChatRuntime({ responseProvider })

    expect(warn).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/default storage key.*multiple owned runtimes/i))

    await Promise.all([first.dispose(), second.dispose()])
    expect(values.get(DEFAULT_CHAT_STORAGE_KEY)).toBe(persisted)
  })
})
