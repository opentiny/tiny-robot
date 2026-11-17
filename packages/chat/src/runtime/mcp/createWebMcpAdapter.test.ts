import { describe, expect, it, vi } from 'vitest'
import { createWebMcpAdapter } from './createWebMcpAdapter'
import type { WebMcpToolDescriptor, WebMcpToolSource } from './webmcpTypes'

function createSource() {
  let tools: WebMcpToolDescriptor[] = [
    { name: 'echo', description: 'Echo', inputSchema: { type: 'object', properties: {} } },
  ]
  const listeners = new Set<() => void>()
  const source: WebMcpToolSource = {
    listTools: vi.fn(async () => tools),
    callTool: vi.fn(async (name, args) => `${name}:${JSON.stringify(args)}`),
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }

  return {
    source,
    addTool(tool: { name: string; description?: string; inputSchema?: unknown }) {
      tools = [...tools, tool]
      listeners.forEach((listener) => listener())
    },
  }
}

describe('createWebMcpAdapter', () => {
  it('projects a WebMCP source into the TinyRobot MCP runtime', async () => {
    const { source } = createSource()
    const adapter = createWebMcpAdapter({
      source,
      id: 'page-webmcp',
      name: 'Page tools',
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
    const adapter = createWebMcpAdapter({ source, id: 'page-webmcp' })

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1))
    addTool({ name: 'navigate' })

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(2))
    await expect(adapter.listTools(['page-webmcp'], { 'page-webmcp': ['navigate'] })).resolves.toMatchObject([
      { name: 'page-webmcp__navigate', originalName: 'navigate' },
    ])
  })

  it('supports removing and re-adding the WebMCP server without unregistering the source', async () => {
    const { source } = createSource()
    const adapter = createWebMcpAdapter({ source, id: 'page-webmcp' })

    await vi.waitFor(() => expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1))
    adapter.runtime.removeServer('page-webmcp')
    expect(adapter.runtime.servers.value[0]).toMatchObject({ installed: false, enabled: false })
    expect(adapter.runtime.tools.value['page-webmcp']).toEqual([])

    await adapter.runtime.addServer('page-webmcp')
    expect(adapter.runtime.servers.value[0]).toMatchObject({ installed: true, enabled: true })
    expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1)
  })

  it('keeps source errors in server state and retries through enable', async () => {
    const listTools = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue([{ name: 'echo' }])
    const adapter = createWebMcpAdapter({
      source: { listTools, callTool: async () => 'ok' },
      id: 'page-webmcp',
    })

    await vi.waitFor(() => expect(adapter.runtime.servers.value[0]?.error).toEqual(new Error('offline')))
    expect(adapter.runtime.servers.value[0]).toMatchObject({ installed: true, enabled: false, loading: undefined })

    await adapter.runtime.setServerEnabled('page-webmcp', true)
    expect(adapter.runtime.tools.value['page-webmcp']).toHaveLength(1)
    expect(adapter.runtime.servers.value[0]).toMatchObject({ enabled: true, error: undefined })
  })
})
