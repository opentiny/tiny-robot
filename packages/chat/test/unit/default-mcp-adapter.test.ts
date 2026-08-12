import { afterEach, describe, expect, it, vi } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp'
import { createDefaultMcpAdapter } from '../../src/runtime/mcp/createDefaultMcpAdapter'
import type { ChatMcpServers } from '../../src/runtime/mcp/types'
import { createDeferred } from '../fixtures/deferred'

vi.mock('@modelcontextprotocol/sdk/client', () => ({
  Client: vi.fn(),
}))
vi.mock('@modelcontextprotocol/sdk/client/streamableHttp', () => ({
  StreamableHTTPClientTransport: vi.fn(),
}))

const servers: ChatMcpServers = {
  maps: { name: 'Maps', baseUrl: 'https://mcp.example/maps' },
}

function mockClient() {
  const client = {
    connect: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    listTools: vi
      .fn()
      .mockResolvedValue({ tools: [{ name: 'search', description: 'Search', inputSchema: { type: 'object' } }] }),
    callTool: vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] }),
  }
  vi.mocked(Client).mockImplementation(() => client as never)
  vi.mocked(StreamableHTTPClientTransport).mockImplementation(() => ({}) as never)
  return client
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('createDefaultMcpAdapter', () => {
  it('initializes servers and loads tools through addServer', async () => {
    const client = mockClient()
    const adapter = createDefaultMcpAdapter(servers)
    expect(adapter.runtime.servers.value).toEqual([{ id: 'maps', name: 'Maps', installed: false, enabled: false }])

    await adapter.runtime.addServer('maps')
    expect(client.listTools).toHaveBeenCalledOnce()
    expect(adapter.runtime.servers.value[0]).toMatchObject({ installed: true, enabled: true })
    expect(adapter.runtime.tools.value.maps).toEqual([
      { id: 'search', name: 'search', description: 'Search', enabled: true },
    ])
  })

  it('deduplicates discovery and uses original tool names for calls', async () => {
    const client = mockClient()
    const deferred = createDeferred<{ tools: [{ name: string }] }>()
    client.listTools.mockReturnValue(deferred.promise)
    const adapter = createDefaultMcpAdapter(servers)
    const first = adapter.runtime.addServer('maps')
    const second = adapter.runtime.setServerEnabled('maps', true)
    deferred.resolve({ tools: [{ name: 'search' }] })
    await Promise.all([first, second])

    expect(client.listTools).toHaveBeenCalledOnce()
    await adapter.callTool('maps', 'search', { q: 'x' })
    expect(client.callTool).toHaveBeenCalledWith({ name: 'search', arguments: { q: 'x' } })
  })

  it('rolls back failed discovery and records the error', async () => {
    const error = new Error('discovery failed')
    const client = mockClient()
    client.listTools.mockRejectedValue(error)
    const adapter = createDefaultMcpAdapter(servers)

    await expect(adapter.runtime.addServer('maps')).rejects.toBe(error)
    expect(adapter.runtime.servers.value[0]).toMatchObject({ installed: true, enabled: false, error })
    expect(adapter.runtime.tools.value.maps).toBeUndefined()
    expect(client.close).toHaveBeenCalledOnce()
  })

  it('prevents an in-flight discovery from writing after removal', async () => {
    const client = mockClient()
    const deferred = createDeferred<{ tools: [{ name: string }] }>()
    client.listTools.mockReturnValue(deferred.promise)
    const adapter = createDefaultMcpAdapter(servers)
    const loading = adapter.runtime.addServer('maps')
    adapter.runtime.removeServer('maps')
    deferred.resolve({ tools: [{ name: 'search' }] })
    await loading

    expect(adapter.runtime.servers.value[0]).toMatchObject({ installed: false, enabled: false })
    expect(adapter.runtime.tools.value.maps).toBeUndefined()
  })

  it('resolves only the requested historical tool snapshot', async () => {
    mockClient()
    const adapter = createDefaultMcpAdapter(servers)
    await adapter.runtime.addServer('maps')
    await expect(adapter.listTools(['maps'], { maps: ['search'] })).resolves.toMatchObject([
      { name: 'maps__search', originalName: 'search' },
    ])
    await expect(adapter.listTools(['maps'], {})).rejects.toThrow('selection is missing')
    expect(() => adapter.runtime.setToolEnabled('maps', 'unknown', true)).toThrow()
  })
})
