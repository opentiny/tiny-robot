import { nextTick, shallowRef } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { ResponseProvider } from '@opentiny/tiny-robot-kit'
import { useConversation } from '../../../kit/src/vue/conversation/useConversation'
import { useChatRuntimeAdapter } from '../../src/composables/useChatRuntimeAdapter'
import { useKitChatRuntime } from '../../src/runtime/useKitChatRuntime'
import { createMemoryStorage } from '../fixtures/storage'
import { createRejectingResponseProvider, createResponseProvider } from '../fixtures/response'

function createAdapter(responseProvider: ResponseProvider) {
  const conversation = useConversation({
    storage: createMemoryStorage(),
    useMessageOptions: { responseProvider },
  })
  const runtime = useKitChatRuntime({ conversation })
  const onActionError = vi.fn()
  const adapter = useChatRuntimeAdapter({ runtime, onActionError })
  return { conversation, runtime, adapter, onActionError }
}

describe('useChatRuntimeAdapter integration', () => {
  it('clears the draft and projects messages and request state after a successful send', async () => {
    const { adapter } = createAdapter(createResponseProvider('reply'))
    adapter.setInputValue('hello')

    await expect(adapter.send({ text: 'hello' })).resolves.toBe(true)
    await nextTick()

    expect(adapter.inputValue.value).toBe('')
    expect(adapter.data.value.conversation?.activeId).toBeTruthy()
    expect(adapter.data.value.bubble?.messages?.map((message) => message.content)).toEqual(['hello', 'reply'])
    expect(adapter.data.value.request?.state).toBe('completed')
    expect(adapter.data.value.sender?.loading).toBe(false)
  })

  it('restores the draft and reports one error without rejecting the send', async () => {
    const error = new Error('send failed')
    const { adapter, onActionError } = createAdapter(createRejectingResponseProvider(error))
    adapter.setInputValue('original draft')

    await expect(adapter.send({ text: 'original draft' })).resolves.toBe(false)
    await nextTick()

    expect(adapter.inputValue.value).toBe('original draft')
    expect(adapter.data.value.request?.state).toBe('error')
    expect(onActionError).toHaveBeenCalledTimes(1)
    expect(onActionError).toHaveBeenCalledWith({ action: 'send', payload: { text: 'original draft' }, error })
  })

  it('keeps conversation data synchronized across create, rename, switch, and delete', async () => {
    const { adapter } = createAdapter(createResponseProvider())
    await adapter.createConversation()
    const firstId = adapter.data.value.conversation?.activeId
    expect(firstId).toBeTruthy()

    await adapter.renameConversation(firstId!, 'First')
    expect(adapter.data.value.conversation?.title).toBe('First')
    await adapter.createConversation()
    const secondId = adapter.data.value.conversation?.activeId
    expect(secondId).not.toBe(firstId)
    await adapter.switchConversation(firstId!)
    expect(adapter.data.value.conversation?.activeId).toBe(firstId)
    await adapter.deleteConversation(firstId!)
    expect(adapter.data.value.conversation?.activeId).toBeNull()
    expect(adapter.data.value.conversation?.items).toHaveLength(1)
  })

  it('projects model and MCP runtime changes', async () => {
    const servers = shallowRef([{ id: 'server-a', name: 'Server A', installed: true, enabled: false }])
    const tools = shallowRef<Record<string, { id: string; name: string; enabled: boolean }[]>>({
      'server-a': [{ id: 'tool-a', name: 'Tool A', enabled: false }],
    })
    const model = {
      options: shallowRef([{ id: 'model-a', label: 'Model A', capabilities: { thinking: true } }]),
      selectedId: shallowRef<string | null>('model-a'),
      features: shallowRef({ thinking: false, search: false }),
      select: vi.fn(),
      setFeature: vi.fn(async (id: 'thinking' | 'search', enabled: boolean) => {
        model.features.value = { ...model.features.value, [id]: enabled }
      }),
    }
    const mcp = {
      servers,
      tools,
      addServer: vi.fn(),
      removeServer: vi.fn(),
      setServerEnabled: vi.fn(async (id: string, enabled: boolean) => {
        servers.value = servers.value.map((server) => (server.id === id ? { ...server, enabled } : server))
      }),
      setToolEnabled: vi.fn(async (serverId: string, toolId: string, enabled: boolean) => {
        tools.value = {
          ...tools.value,
          [serverId]: tools.value[serverId].map((tool: { id: string; name: string; enabled: boolean }) =>
            tool.id === toolId ? { ...tool, enabled } : tool,
          ),
        }
      }),
    }
    const conversation = useConversation({
      storage: createMemoryStorage(),
      useMessageOptions: { responseProvider: createResponseProvider() },
    })
    const runtime = useKitChatRuntime({ conversation, composer: { model, mcp } })
    const adapter = useChatRuntimeAdapter({ runtime, onActionError: vi.fn() })

    await adapter.setModelFeature('thinking', true)
    await adapter.setMcpServerEnabled('server-a', true)
    await adapter.setMcpToolEnabled('server-a', 'tool-a', true)

    expect(adapter.data.value.model?.features?.thinking).toBe(true)
    expect(adapter.data.value.mcp?.servers?.[0].enabled).toBe(true)
    expect(adapter.data.value.mcp?.tools?.['server-a']?.[0].enabled).toBe(true)
  })
})
