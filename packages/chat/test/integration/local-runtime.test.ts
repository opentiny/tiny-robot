import { shallowRef } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import { useLocalChatRuntime } from '../../src/runtime/useLocalChatRuntime'
import { createMemoryStorage } from '../fixtures/storage'
import type { ChatMcpServers } from '../../src/runtime/mcp/types'

type LocalRuntimeOptions = Parameters<typeof useLocalChatRuntime>[0]

function createLocalRuntime(
  options: Omit<LocalRuntimeOptions, 'conversation'> & Partial<Pick<LocalRuntimeOptions, 'conversation'>>,
) {
  const { conversation: providedConversation, ...runtimeOptions } = options
  const conversation = providedConversation ?? {
    storage: createMemoryStorage(),
    useMessageOptions: {
      responseProvider: async () => ({
        id: 'response',
        object: 'chat.completion',
        created: 0,
        model: 'fixture',
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'ok' },
            delta: undefined,
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
      }),
    },
  }

  return useLocalChatRuntime({
    conversation,
    ...runtimeOptions,
  })
}

describe('useLocalChatRuntime integration', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates a model runtime and maps the selected model into the provider request', async () => {
    const fetchMock = vi.fn(async () => {
      const response = new Response(
        `data: ${JSON.stringify({
          id: 'response',
          object: 'chat.completion',
          created: 0,
          model: 'model-a',
          system_fingerprint: null,
          choices: [{ index: 0, delta: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
        })}\n\ndata: [DONE]\n\n`,
        { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
      )
      return response
    })
    vi.stubGlobal('fetch', fetchMock)

    const runtime = useLocalChatRuntime({
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {},
      },
      modelProviders: [
        {
          type: 'openai',
          apiKey: 'test-key',
          models: [{ id: 'model-a', label: 'Model A', capabilities: { thinking: true, search: true } }],
        },
      ],
    })

    expect(runtime.composer.model?.selectedId.value).toBe('model-a')
    runtime.composer.model?.setFeature('thinking', true)
    await expect(runtime.actions.send({ text: 'hello' })).resolves.toBe(true)

    const requestCall = fetchMock.mock.calls[0] as unknown as [RequestInfo | URL, RequestInit | undefined]
    const requestBody = JSON.parse(String(requestCall[1]?.body)) as Record<string, unknown>
    expect(requestBody).toMatchObject({
      model: 'model-a',
      stream: true,
    })
    expect(requestBody).not.toHaveProperty('__chat_provider_model_id')
  })

  it('keeps message runConfig metadata independent from later model changes', async () => {
    const storage = createMemoryStorage()
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> =>
        new Response(
          `data: ${JSON.stringify({ id: 'response', object: 'chat.completion', created: 0, model: 'model-a', system_fingerprint: null, choices: [{ index: 0, delta: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }] })}\n\ndata: [DONE]\n\n`,
          { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
        ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const runtime = useLocalChatRuntime({
      conversation: {
        storage,
        useMessageOptions: {},
      },
      modelProviders: [
        {
          type: 'openai',
          apiKey: 'test-key',
          models: [{ id: 'model-a', label: 'A', capabilities: { thinking: true } }],
        },
      ],
    })

    runtime.composer.model?.setFeature('thinking', true)
    await runtime.actions.send({ text: 'hello' })
    const firstMetadata = runtime.activeConversation.value?.messages[0].metadata?.run_config_metadata
    runtime.composer.model?.setFeature('thinking', false)

    expect(firstMetadata).toMatchObject({ modelId: 'model-a', features: { thinking: true } })
    expect(runtime.activeConversation.value?.messages[0].metadata?.run_config_metadata).toEqual(firstMetadata)
  })

  it('blocks sends while enabled MCP server tools are not loaded', async () => {
    const servers = shallowRef([{ id: 'server-a', name: 'Server A', installed: true, enabled: true, loading: true }])
    const tools = shallowRef<Record<string, readonly { id: string; name: string; enabled: boolean }[]>>({})
    const runtime = createLocalRuntime({
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () => {
            throw new Error('unused')
          },
        },
      },
      mcp: {
        runtime: {
          servers,
          tools,
          addServer: vi.fn(),
          removeServer: vi.fn(),
          setServerEnabled: vi.fn(),
          setToolEnabled: vi.fn(),
        },
        listTools: vi.fn(),
        callTool: vi.fn(),
      },
    })

    expect(runtime.composer.submitDisabled?.value).toBe(true)
    await expect(runtime.actions.send({ text: 'hello' })).resolves.toBe(false)
    expect(runtime.conversations.value).toHaveLength(0)
  })

  it('creates the default MCP runtime from mcpServers and rejects mixed MCP inputs', () => {
    const mcpServers: ChatMcpServers = [{ id: 'maps', name: 'Maps', baseUrl: 'https://mcp.example/maps' }]
    const runtime = createLocalRuntime({
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () => {
            throw new Error('unused')
          },
        },
      },
      mcpServers,
    })

    expect(runtime.composer.mcp?.servers.value).toEqual([
      { id: 'maps', name: 'Maps', installed: false, enabled: false },
    ])
    expect(() =>
      createLocalRuntime({
        conversation: {
          storage: createMemoryStorage(),
          useMessageOptions: {
            responseProvider: async () => {
              throw new Error('unused')
            },
          },
        },
        mcp: { runtime: runtime.composer.mcp!, listTools: vi.fn(), callTool: vi.fn() },
        mcpServers,
      }),
    ).toThrow('mcp and mcpServers')
  })

  it('preserves an initially installed MCP server as disabled', () => {
    const mcpServers: ChatMcpServers = [
      { id: 'maps', name: 'Maps', baseUrl: 'https://mcp.example/maps', installed: true },
    ]
    const runtime = createLocalRuntime({ mcpServers })

    expect(runtime.composer.mcp?.servers.value[0]).toMatchObject({ installed: true, enabled: false })
  })

  it('rejects a responseProvider combined with modelProviders', () => {
    expect(() =>
      useLocalChatRuntime({
        conversation: {
          useMessageOptions: {
            responseProvider: async () => {
              throw new Error('unused')
            },
          },
        },
        modelProviders: [{ type: 'openai', apiKey: 'key', models: [{ id: 'model-a', label: 'A' }] }],
      }),
    ).toThrow('modelProviders and responseProvider')
  })

  it('preserves built-in and user plugins', () => {
    const userPlugin: UseMessagePlugin = { name: 'user-plugin' }
    const runtime = useLocalChatRuntime({
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () => {
            throw new Error('unused')
          },
          plugins: [userPlugin],
        },
      },
    })

    expect(runtime).toBeTruthy()
    expect(runtime.activeConversation.value).toBeNull()
  })
})
