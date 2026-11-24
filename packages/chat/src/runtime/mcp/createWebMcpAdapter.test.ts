import { describe, expect, it, vi } from 'vitest'
import { createWebMcpAdapter } from './createWebMcpAdapter'
import type { WebMcpToolDescriptor, WebMcpToolSource } from './webmcpTypes'

function createSource() {
  let tools: WebMcpToolDescriptor[] = [
    { name: 'echo', description: 'Echo', inputSchema: { type: 'object', properties: {} } },
  ]
  const listeners = new Set<() => void>()
  const listTools = vi.fn(async () => tools)
  const source: WebMcpToolSource = {
    listTools,
    callTool: vi.fn(async (name, args) => `${name}:${JSON.stringify(args)}`),
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }

  return {
    source,
    listTools,
    addTool(tool: { name: string; description?: string; inputSchema?: unknown }) {
      tools = [...tools, tool]
      listeners.forEach((listener) => listener())
    },
  }
}

describe('createWebMcpAdapter', () => {
  it('rejects ambiguous source and context configuration', () => {
    expect(() =>
      createWebMcpAdapter({
        source: { listTools: async () => [], callTool: async () => 'ok' },
        getContext: () => undefined,
      }),
    ).toThrow('either source or getContext, not both')
  })

  it('projects a WebMCP source into the TinyRobot MCP runtime', async () => {
    const { source } = createSource()
    const adapter = createWebMcpAdapter({
      source,
      server: { id: 'page-webmcp', name: 'Page tools' },
    })

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1))
    expect(adapter.runtime.servers.value).toEqual([
      expect.objectContaining({ id: 'page-webmcp', name: 'Page tools', installed: true, enabled: true }),
    ])

    const definitions = await adapter.listTools(['page-webmcp'], { 'page-webmcp': ['echo'] })
    expect(definitions).toMatchObject([
      { serverId: 'page-webmcp', id: 'echo', name: 'page-webmcp__echo', originalName: 'echo' },
    ])
    await expect(adapter.callTool('page-webmcp', 'echo', { value: 'ok' })).resolves.toBe('echo:{"value":"ok"}')
  })

  it('updates tools after a WebMCP toolchange and preserves server routing', async () => {
    const { source, addTool } = createSource()
    const adapter = createWebMcpAdapter({ source, server: { id: 'page-webmcp' } })

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1))
    addTool({ name: 'navigate' })

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(2))
    await expect(adapter.listTools(['page-webmcp'], { 'page-webmcp': ['navigate'] })).resolves.toMatchObject([
      { name: 'page-webmcp__navigate', originalName: 'navigate' },
    ])
  })

  it('refreshes again when a toolchange arrives during discovery', async () => {
    let releaseFirstDiscovery!: () => void
    const firstDiscovery = new Promise<void>((resolve) => {
      releaseFirstDiscovery = resolve
    })
    let tools = [{ name: 'echo' }]
    const listeners = new Set<() => void>()
    const listTools = vi.fn(async () => {
      const snapshot = [...tools]
      if (listTools.mock.calls.length === 1) await firstDiscovery
      return snapshot
    })
    const source: WebMcpToolSource = {
      listTools,
      callTool: async () => 'ok',
      subscribe(listener) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    }

    const adapter = createWebMcpAdapter({ source, server: { id: 'page-webmcp' } })
    await vi.waitFor(() => expect(listTools).toHaveBeenCalledOnce())
    tools = [...tools, { name: 'navigate' }]
    listeners.forEach((listener) => listener())
    releaseFirstDiscovery()

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(2))
    expect(listTools).toHaveBeenCalledTimes(2)
  })

  it('supports removing and re-adding the WebMCP server without unregistering the source', async () => {
    const { source } = createSource()
    const adapter = createWebMcpAdapter({ source, server: { id: 'page-webmcp' } })

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1))
    adapter.runtime.removeServer('page-webmcp')
    expect(adapter.runtime.servers.value[0]).toMatchObject({ installed: false, enabled: false })
    expect(adapter.runtime.tools.value['page-webmcp']).toEqual([])

    await adapter.runtime.addServer('page-webmcp')
    expect(adapter.runtime.servers.value[0]).toMatchObject({ installed: true, enabled: true })
    expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1)
  })

  it('starts a fresh discovery when re-adding during an invalidated refresh', async () => {
    let releaseFirst!: () => void
    let releaseSecond!: () => void
    const first = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    const second = new Promise<void>((resolve) => {
      releaseSecond = resolve
    })
    let calls = 0
    const source: WebMcpToolSource = {
      listTools: vi.fn(async () => {
        const call = calls++
        await (call === 0 ? first : second)
        return [{ name: call === 0 ? 'stale' : 'fresh' }]
      }),
      callTool: async () => 'ok',
    }
    const adapter = createWebMcpAdapter({ source, server: { id: 'page-webmcp' } })

    await vi.waitFor(() => expect(source.listTools).toHaveBeenCalledOnce())
    adapter.runtime.removeServer('page-webmcp')
    const addServer = adapter.runtime.addServer('page-webmcp')
    await vi.waitFor(() => expect(source.listTools).toHaveBeenCalledTimes(2))

    releaseFirst()
    releaseSecond()
    await addServer

    expect(adapter.runtime.tools.value['page-webmcp']).toEqual([
      expect.objectContaining({ id: 'fresh', name: 'fresh' }),
    ])
  })

  it('keeps source errors in server state and retries through enable', async () => {
    const listTools = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue([{ name: 'echo' }])
    const adapter = createWebMcpAdapter({
      source: { listTools, callTool: async () => 'ok' },
      server: { id: 'page-webmcp' },
    })

    await vi.waitFor(() => expect(adapter.runtime.servers.value[0]?.error).toEqual(new Error('offline')))
    expect(adapter.runtime.servers.value[0]).toMatchObject({ installed: true, enabled: false, loading: undefined })

    await adapter.runtime.setServerEnabled('page-webmcp', true)
    expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1)
    expect(adapter.runtime.servers.value[0]).toMatchObject({ enabled: true, error: undefined })
  })

  it('retries discovery after a refresh error even when tools are cached', async () => {
    const { source, listTools, addTool } = createSource()
    const adapter = createWebMcpAdapter({ source, server: { id: 'page-webmcp' } })

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1))
    listTools.mockRejectedValueOnce(new Error('offline'))
    await expect(adapter.refresh?.()).rejects.toThrow('offline')
    addTool({ name: 'navigate' })

    await adapter.runtime.setServerEnabled('page-webmcp', true)

    expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(2)
  })

  it('does not refresh a disabled WebMCP server after a toolchange', async () => {
    const { source, listTools, addTool } = createSource()
    const adapter = createWebMcpAdapter({ source, server: { id: 'page-webmcp' } })

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1))
    await adapter.runtime.setServerEnabled('page-webmcp', false)
    listTools.mockRejectedValueOnce(new Error('disabled source unavailable'))
    addTool({ name: 'navigate' })

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(listTools).toHaveBeenCalledOnce()
    expect(adapter.runtime.servers.value[0]?.error).toBeUndefined()
  })

  it('does not discover tools for an initially disabled server', async () => {
    const { source, listTools } = createSource()
    const adapter = createWebMcpAdapter({ source, server: { id: 'page-webmcp', enabled: false } })

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(listTools).not.toHaveBeenCalled()
    expect(adapter.runtime.tools.value['page-webmcp']).toEqual([])

    await adapter.runtime.setServerEnabled('page-webmcp', true)
    expect(listTools).toHaveBeenCalledOnce()
  })

  it('keeps toolchange listening aligned with tool-level enablement', async () => {
    const { source, listTools, addTool } = createSource()
    const adapter = createWebMcpAdapter({ source, server: { id: 'page-webmcp' } })

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1))
    await adapter.runtime.setServerEnabled('page-webmcp', false)
    listTools.mockClear()
    await adapter.runtime.setToolEnabled('page-webmcp', 'echo', true)
    addTool({ name: 'discovered-after-tool-enable' })
    await vi.waitFor(() =>
      expect(adapter.runtime.tools.value['page-webmcp']).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 'discovered-after-tool-enable', enabled: true })]),
      ),
    )

    for (const tool of adapter.runtime.tools.value['page-webmcp'] ?? []) {
      await adapter.runtime.setToolEnabled('page-webmcp', tool.id, false)
    }

    listTools.mockClear()
    addTool({ name: 'ignored-after-last-tool-disabled' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(listTools).not.toHaveBeenCalled()
  })

  it('clears loading when disabling during an in-flight discovery', async () => {
    let releaseDiscovery!: () => void
    const discovery = new Promise<void>((resolve) => {
      releaseDiscovery = resolve
    })
    const source: WebMcpToolSource = {
      listTools: async () => {
        await discovery
        return [{ name: 'echo' }]
      },
      callTool: async () => 'ok',
    }
    const adapter = createWebMcpAdapter({ source, server: { id: 'page-webmcp' } })

    await vi.waitFor(() => expect(adapter.runtime.servers.value[0]?.loading).toBe(true))
    await adapter.runtime.setServerEnabled('page-webmcp', false)
    expect(adapter.runtime.servers.value[0]?.loading).toBeUndefined()

    releaseDiscovery()
  })

  it('reopens after close so a removed Adapter can be attached again', async () => {
    const { source, listTools } = createSource()
    const adapter = createWebMcpAdapter({ source, server: { id: 'page-webmcp' } })

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1))
    await adapter.close?.()
    expect(adapter.runtime.tools.value['page-webmcp']).toEqual([])
    expect(adapter.runtime.servers.value[0]?.loading).toBeUndefined()

    await adapter.refresh?.()
    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1))
    expect(listTools).toHaveBeenCalledTimes(2)
  })

  it('starts a new discovery when reopened while the previous discovery is still pending', async () => {
    let releaseFirst!: () => void
    let releaseSecond!: () => void
    const firstDiscovery = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    const secondDiscovery = new Promise<void>((resolve) => {
      releaseSecond = resolve
    })
    let calls = 0
    const source: WebMcpToolSource = {
      listTools: vi.fn(async () => {
        const call = ++calls
        await (call === 1 ? firstDiscovery : secondDiscovery)
        return [{ name: call === 1 ? 'stale' : 'fresh' }]
      }),
      callTool: async () => 'ok',
    }
    const adapter = createWebMcpAdapter({ source, server: { id: 'page-webmcp' } })

    await vi.waitFor(() => expect(source.listTools).toHaveBeenCalledOnce())
    await adapter.close?.()
    const reopened = adapter.refresh?.()
    await vi.waitFor(() => expect(source.listTools).toHaveBeenCalledTimes(2))

    releaseFirst()
    releaseSecond()
    await reopened

    expect(adapter.runtime.tools.value['page-webmcp']).toEqual([
      expect.objectContaining({ id: 'fresh', name: 'fresh' }),
    ])
  })

  it('aliases long WebMCP tool names without changing the source call name', async () => {
    const originalName = 'get_current_page_state_for_the_selected_workspace_with_detailed_context'
    const callTool = vi.fn(async (name: string) => name)
    const adapter = createWebMcpAdapter({
      source: {
        listTools: async () => [{ name: originalName }],
        callTool,
      },
      server: { id: 'page-webmcp-with-a-long-server-identifier' },
    })

    await vi.waitFor(() =>
      expect(adapter.runtime.tools.value['page-webmcp-with-a-long-server-identifier']).toHaveLength(1),
    )
    const definitions = await adapter.listTools(['page-webmcp-with-a-long-server-identifier'], {
      'page-webmcp-with-a-long-server-identifier': [originalName],
    })

    expect(definitions[0]?.name.length).toBeLessThanOrEqual(64)
    await expect(adapter.callTool('page-webmcp-with-a-long-server-identifier', originalName, {})).resolves.toBe(
      originalName,
    )
    expect(callTool).toHaveBeenCalledWith(originalName, {})
  })

  it('aliases WebMCP tool names with characters unsupported by model APIs', async () => {
    const originalName = 'get.page.info'
    const adapter = createWebMcpAdapter({
      source: { listTools: async () => [{ name: originalName }], callTool: async (name) => name },
      server: { id: 'page-webmcp' },
    })

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1))
    const definitions = await adapter.listTools(['page-webmcp'], { 'page-webmcp': [originalName] })

    expect(definitions[0]?.name).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(definitions[0]?.originalName).toBe(originalName)
  })
})
