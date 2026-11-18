import { computed } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { ChatMcpRuntime } from '../../types'
import { createCompositeMcpAdapter, type ChatMcpAdapter } from './compositeMcpAdapter'

function createAdapter(serverId: string, toolId: string, result: string, options: { close?: () => void } = {}) {
  const server = {
    id: serverId,
    name: serverId,
    installed: true,
    enabled: true,
  }
  const tool = { id: toolId, name: toolId, enabled: true }
  const runtime: ChatMcpRuntime = {
    servers: computed(() => [server]),
    tools: computed(() => ({ [serverId]: [tool] })),
    addServer: vi.fn(),
    removeServer: vi.fn(),
    setServerEnabled: vi.fn(),
    setToolEnabled: vi.fn(),
  }

  const adapter: ChatMcpAdapter = {
    runtime,
    listTools: async (_serverIds, selectedToolIds) =>
      (selectedToolIds[serverId] ?? []).map((id) => ({
        serverId,
        id,
        name: `${serverId}__${id}`,
        originalName: id,
      })),
    callTool: async (_serverId, toolName) => `${result}:${toolName}`,
    close: options.close,
  }

  return adapter
}

describe('createCompositeMcpAdapter', () => {
  it('合并多个 MCP Adapter 并按 Server 路由工具调用', async () => {
    const adapter = createCompositeMcpAdapter({
      adapters: [createAdapter('local-tools', 'navigate', 'local'), createAdapter('github', 'issue', 'github')],
    })

    expect(adapter.runtime.servers.value.map((server) => server.id)).toEqual(['local-tools', 'github'])
    expect(Object.keys(adapter.runtime.tools.value)).toEqual(['local-tools', 'github'])

    const definitions = await adapter.listTools(['github', 'local-tools'], {
      github: ['issue'],
      'local-tools': ['navigate'],
    })

    expect(definitions.map((tool) => tool.name)).toEqual(['github__issue', 'local-tools__navigate'])
    await expect(adapter.callTool('local-tools', 'navigate', {})).resolves.toBe('local:navigate')
  })

  it('拒绝重复的 Server ID', () => {
    const adapter = createCompositeMcpAdapter({
      adapters: [createAdapter('same', 'one', 'one'), createAdapter('same', 'two', 'two')],
    })

    expect(() => adapter.runtime.servers.value).toThrow('Duplicate MCP server id: same')
  })

  it('支持通过已有 Adapter 动态添加和移除外部 MCP', async () => {
    const close = vi.fn()
    const externalAdapter = createAdapter('remote-tools', 'search', 'external', { close })
    const adapter = createCompositeMcpAdapter()

    await adapter.addAdapter(externalAdapter)

    expect(adapter.runtime.servers.value.map((server) => server.id)).toEqual(['remote-tools'])

    await adapter.removeAdapter('remote-tools')

    expect(close).toHaveBeenCalledOnce()
    expect(adapter.runtime.servers.value).toEqual([])
  })

  it('refreshes before attaching an adapter and keeps the composite unchanged on duplicate ids', async () => {
    let servers: ChatMcpRuntime['servers']['value'] = []
    const candidate: ChatMcpAdapter = {
      runtime: {
        servers: computed(() => servers),
        tools: computed(() => ({})),
        addServer: vi.fn(),
        removeServer: vi.fn(),
        setServerEnabled: vi.fn(),
        setToolEnabled: vi.fn(),
      },
      listTools: async () => [],
      callTool: async () => 'ok',
      refresh: async () => {
        servers = [{ id: 'existing', name: 'Existing', installed: true, enabled: true }]
      },
    }
    const adapter = createCompositeMcpAdapter({
      adapters: [createAdapter('existing', 'one', 'one')],
    })

    await expect(adapter.addAdapter(candidate)).rejects.toThrow('Duplicate MCP server id: existing')
    expect(adapter.runtime.servers.value.map((server) => server.id)).toEqual(['existing'])
  })

  it('keeps the composite unchanged when an adapter refresh fails', async () => {
    const candidate = createAdapter('remote-tools', 'search', 'remote')
    candidate.refresh = vi.fn().mockRejectedValue(new Error('offline'))
    const adapter = createCompositeMcpAdapter()

    await expect(adapter.addAdapter(candidate)).rejects.toThrow('offline')
    expect(adapter.runtime.servers.value).toEqual([])
  })

  it('拒绝添加重复 Server ID 的 Adapter', async () => {
    const adapter = createCompositeMcpAdapter({ adapters: [createAdapter('remote-tools', 'one', 'one')] })

    await expect(adapter.addAdapter(createAdapter('remote-tools', 'two', 'two'))).rejects.toThrow(
      'Duplicate MCP server id: remote-tools',
    )
  })

  it('delegates dynamic registration to the explicitly selected adapter', async () => {
    const registry = createAdapter('registry', 'one', 'one')
    const registerMcpServer = vi.fn().mockResolvedValue('dynamic-server')
    registry.registerMcpServer = registerMcpServer
    const adapter = createCompositeMcpAdapter({ adapters: [registry], registrationAdapter: registry })

    await expect(
      adapter.runtime.registerMcpServer?.({ name: 'Dynamic', type: 'streamableHttp', url: 'https://mcp.example.com' }),
    ).resolves.toBe('dynamic-server')
    expect(registerMcpServer).toHaveBeenCalledOnce()

    await adapter.removeAdapter('registry')
    await expect(
      adapter.runtime.registerMcpServer?.({ name: 'Detached', type: 'streamableHttp', url: 'https://mcp.example.com' }),
    ).rejects.toThrow('MCP registration adapter is no longer attached')
  })
})
