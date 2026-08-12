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

const servers: ChatMcpServers = [{ id: 'maps', name: 'Maps', baseUrl: 'https://mcp.example/maps' }]

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
  vi.unstubAllGlobals()
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

  it('keeps initially installed servers disabled without connecting', () => {
    const client = mockClient()
    const adapter = createDefaultMcpAdapter([
      { id: 'maps', name: 'Maps', baseUrl: 'https://mcp.example/maps', installed: true },
    ])

    expect(adapter.runtime.servers.value[0]).toMatchObject({ installed: true, enabled: false })
    expect(client.connect).not.toHaveBeenCalled()
    expect(client.listTools).not.toHaveBeenCalled()
  })

  it('rejects duplicate server ids synchronously', () => {
    expect(() =>
      createDefaultMcpAdapter([
        { id: 'maps', name: 'Maps', baseUrl: 'https://mcp.example/maps' },
        { id: 'maps', name: 'Other Maps', baseUrl: 'https://mcp.example/other' },
      ]),
    ).toThrow('Duplicate MCP server id: maps')
  })

  it('resolves relative URLs from the browser origin', async () => {
    const client = mockClient()
    vi.stubGlobal('location', { origin: 'https://app.example' })
    const adapter = createDefaultMcpAdapter([{ id: 'maps', name: 'Maps', baseUrl: '/mcp/maps', installed: true }])

    await adapter.runtime.setServerEnabled('maps', true)

    expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
      new URL('https://app.example/mcp/maps'),
      expect.anything(),
    )
    expect(client.listTools).toHaveBeenCalledOnce()
  })

  it('rejects relative URLs outside a browser environment', async () => {
    const client = mockClient()
    vi.stubGlobal('location', undefined)
    const adapter = createDefaultMcpAdapter([{ id: 'maps', name: 'Maps', baseUrl: '/mcp/maps', installed: true }])

    await expect(adapter.runtime.setServerEnabled('maps', true)).rejects.toThrow(
      'requires an absolute baseUrl outside a browser environment',
    )
    expect(client.connect).not.toHaveBeenCalled()
  })

  it('does not reuse discovery from a disabled generation', async () => {
    const client = mockClient()
    const firstDiscovery = createDeferred<{ tools: [{ name: string }] }>()
    const secondDiscovery = createDeferred<{ tools: [{ name: string }] }>()
    client.listTools.mockReturnValueOnce(firstDiscovery.promise).mockReturnValueOnce(secondDiscovery.promise)
    const adapter = createDefaultMcpAdapter([
      { id: 'maps', name: 'Maps', baseUrl: 'https://mcp.example/maps', installed: true },
    ])

    const firstEnable = adapter.runtime.setServerEnabled('maps', true)
    await Promise.resolve()
    await adapter.runtime.setServerEnabled('maps', false)
    const secondEnable = adapter.runtime.setServerEnabled('maps', true)
    await vi.waitFor(() => expect(client.listTools).toHaveBeenCalledTimes(2))

    secondDiscovery.resolve({ tools: [{ name: 'new-search' }] })
    await secondEnable
    firstDiscovery.resolve({ tools: [{ name: 'old-search' }] })
    await firstEnable

    expect(adapter.runtime.tools.value.maps).toEqual([
      { id: 'new-search', name: 'new-search', description: undefined, enabled: true },
    ])
  })

  it('clears definitions when disabled before discovering again', async () => {
    const client = mockClient()
    client.listTools
      .mockResolvedValueOnce({ tools: [{ name: 'first-search' }] })
      .mockResolvedValueOnce({ tools: [{ name: 'second-search' }] })
    const adapter = createDefaultMcpAdapter([
      { id: 'maps', name: 'Maps', baseUrl: 'https://mcp.example/maps', installed: true },
    ])

    await adapter.runtime.setServerEnabled('maps', true)
    await adapter.runtime.setServerEnabled('maps', false)
    await adapter.runtime.setServerEnabled('maps', true)

    expect(client.listTools).toHaveBeenCalledTimes(2)
    expect(adapter.runtime.tools.value.maps?.[0].id).toBe('second-search')
  })

  it('closes the client after a request timeout', async () => {
    const client = mockClient()
    client.listTools.mockReturnValue(new Promise(() => undefined))
    const adapter = createDefaultMcpAdapter([
      { id: 'maps', name: 'Maps', baseUrl: 'https://mcp.example/maps', timeout: 1 },
    ])

    await expect(adapter.runtime.addServer('maps')).rejects.toThrow('timed out')
    expect(client.close).toHaveBeenCalledOnce()
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
