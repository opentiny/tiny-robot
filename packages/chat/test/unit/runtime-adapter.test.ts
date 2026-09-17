import { describe, expect, it, vi } from 'vitest'
import { useChatRuntimeAdapter } from '../../src/composables/useChatRuntimeAdapter'
import { createDeferred } from '../fixtures/deferred'
import { createRuntimeFixture } from '../fixtures/runtime'

describe('useChatRuntimeAdapter', () => {
  it('projects Runtime state into ChatUIData', () => {
    const fixture = createRuntimeFixture()
    fixture.runtime.conversations.value = [{ id: 'conversation-a', title: 'Conversation A' }]
    fixture.runtime.activeConversation.value = {
      id: 'conversation-a',
      title: 'Conversation A',
      messages: [{ role: 'user', content: 'hello' }],
      requestState: 'processing',
      processingState: 'requesting',
      lastError: new Error('request failed'),
    }
    const adapter = useChatRuntimeAdapter({ runtime: fixture.runtime, title: 'Explicit title', onActionError: vi.fn() })

    expect(adapter.data.value).toMatchObject({
      conversation: { items: fixture.runtime.conversations.value, activeId: 'conversation-a', title: 'Explicit title' },
      bubble: { messages: fixture.runtime.activeConversation.value.messages },
      sender: { loading: true },
      request: {
        state: 'processing',
        processingState: 'requesting',
        error: fixture.runtime.activeConversation.value.lastError,
      },
      model: { selectedId: 'model-a', selecting: false },
      mcp: { servers: [{ id: 'server-a', loading: false }], tools: { 'server-a': [{ id: 'tool-a', loading: false }] } },
    })
  })

  it('preserves paused request state without treating it as loading', () => {
    const fixture = createRuntimeFixture()
    fixture.runtime.activeConversation.value = {
      id: 'conversation-a',
      title: 'Conversation A',
      messages: [],
      requestState: 'paused',
    }
    const adapter = useChatRuntimeAdapter({ runtime: fixture.runtime, onActionError: vi.fn() })

    expect(adapter.data.value.request).toMatchObject({ state: 'paused' })
    expect(adapter.data.value.sender?.loading).toBe(false)
  })

  it('reports send errors once and returns false', async () => {
    const error = new Error('send failed')
    const onActionError = vi.fn()
    const fixture = createRuntimeFixture({
      send: async () => {
        throw error
      },
    })
    const adapter = useChatRuntimeAdapter({ runtime: fixture.runtime, onActionError })

    await expect(adapter.send({ text: 'hello' })).resolves.toBe(false)
    expect(onActionError).toHaveBeenCalledTimes(1)
    expect(onActionError).toHaveBeenCalledWith({ action: 'send', payload: { text: 'hello' }, error })
  })

  it('consumes non-send action errors and reports them once', async () => {
    const error = new Error('action failed')
    const onActionError = vi.fn()
    const fixture = createRuntimeFixture({
      abort: async () => {
        throw error
      },
      clearActiveConversation: async () => {
        throw error
      },
      createConversation: async () => {
        throw error
      },
      switchConversation: async () => {
        throw error
      },
      renameConversation: async () => {
        throw error
      },
      deleteConversation: async () => {
        throw error
      },
    })
    const adapter = useChatRuntimeAdapter({ runtime: fixture.runtime, onActionError })

    await adapter.abort()
    await adapter.clearActiveConversation()
    await adapter.createConversation()
    await adapter.switchConversation('id')
    await adapter.renameConversation('id', 'title')
    await adapter.deleteConversation('id')

    expect(onActionError.mock.calls.map(([payload]: [{ action: string }]) => payload.action)).toEqual([
      'abort',
      'clear-active-conversation',
      'create-conversation',
      'switch-conversation',
      'rename-conversation',
      'delete-conversation',
    ])
  })

  it('deduplicates pending model and MCP actions', async () => {
    const deferred = createDeferred<void>()
    const fixture = createRuntimeFixture()
    const select = vi.fn(() => deferred.promise)
    fixture.model.select = select
    const adapter = useChatRuntimeAdapter({ runtime: fixture.runtime, onActionError: vi.fn() })
    const first = adapter.selectModel('other')
    const second = adapter.selectModel('other')

    await Promise.resolve()
    expect(select).toHaveBeenCalledTimes(1)
    deferred.resolve()
    await Promise.all([first, second])
  })

  it('projects pending model and MCP states', async () => {
    const featureDeferred = createDeferred<void>()
    const fixture = createRuntimeFixture()
    fixture.model.setFeature = () => featureDeferred.promise
    const adapter = useChatRuntimeAdapter({ runtime: fixture.runtime, onActionError: vi.fn() })
    const request = adapter.setModelFeature('thinking', true)

    await Promise.resolve()
    expect(adapter.data.value.model).toMatchObject({ pendingFeatureIds: ['thinking'] })
    featureDeferred.resolve()
    await request
    expect(adapter.data.value.model?.pendingFeatureIds).toEqual([])
  })

  it('keeps pending states isolated when MCP ids contain separators', async () => {
    const firstDeferred = createDeferred<void>()
    const secondDeferred = createDeferred<void>()
    const fixture = createRuntimeFixture()
    fixture.servers.value = [
      { id: 'server:a', name: 'Server A', installed: true, enabled: true },
      { id: 'server', name: 'Server B', installed: true, enabled: true },
    ]
    fixture.tools.value = {
      'server:a': [{ id: 'tool', name: 'Tool A', enabled: false }],
      server: [{ id: 'a:tool', name: 'Tool B', enabled: false }],
    }
    fixture.mcp.setToolEnabled = vi.fn((serverId, toolId) => {
      if (serverId === 'server:a' && toolId === 'tool') return firstDeferred.promise
      return secondDeferred.promise
    })
    const adapter = useChatRuntimeAdapter({ runtime: fixture.runtime, onActionError: vi.fn() })

    const first = adapter.setMcpToolEnabled('server:a', 'tool', true)
    const second = adapter.setMcpToolEnabled('server', 'a:tool', true)

    await Promise.resolve()
    expect(fixture.mcp.setToolEnabled).toHaveBeenCalledTimes(2)
    expect(adapter.data.value.mcp?.tools).toMatchObject({
      'server:a': [{ id: 'tool', loading: true }],
      server: [{ id: 'a:tool', loading: true }],
    })

    firstDeferred.resolve()
    secondDeferred.resolve()
    await Promise.all([first, second])
    expect(adapter.data.value.mcp?.tools).toMatchObject({
      'server:a': [{ id: 'tool', loading: false }],
      server: [{ id: 'a:tool', loading: false }],
    })
  })
})
