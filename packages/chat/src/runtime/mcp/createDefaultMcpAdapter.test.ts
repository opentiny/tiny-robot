import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDefaultMcpAdapter } from './createDefaultMcpAdapter'

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  listTools: vi.fn(),
  callTool: vi.fn(),
  close: vi.fn(),
  transports: [] as Array<{ kind: string; url: URL; options: unknown }>,
}))

vi.mock('@modelcontextprotocol/sdk/client', () => ({
  Client: class {
    connect = mocks.connect
    listTools = mocks.listTools
    callTool = mocks.callTool
    close = mocks.close
  },
}))

vi.mock('@modelcontextprotocol/sdk/client/sse.js', () => ({
  SSEClientTransport: class {
    constructor(url: URL, options: unknown) {
      mocks.transports.push({ kind: 'sse', url, options })
    }
  },
}))

vi.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: class {
    constructor(url: URL, options: unknown) {
      mocks.transports.push({ kind: 'streamableHttp', url, options })
    }
  },
}))

describe('createDefaultMcpAdapter', () => {
  beforeEach(() => {
    mocks.connect.mockReset().mockResolvedValue(undefined)
    mocks.listTools.mockReset().mockResolvedValue({ tools: [{ name: 'search', description: 'Search' }] })
    mocks.callTool.mockReset()
    mocks.close.mockReset().mockResolvedValue(undefined)
    mocks.transports.length = 0
  })

  it('registers a server, discovers tools, and selects the configured transport', async () => {
    const adapter = createDefaultMcpAdapter([])
    const serverId = await adapter.runtime.registerMcpServer?.({
      name: 'Search',
      type: 'sse',
      url: 'https://mcp.example.com/sse',
      headers: { Authorization: 'Bearer token' },
    })

    expect(serverId).toBeTruthy()
    expect(adapter.runtime.servers.value).toEqual([
      expect.objectContaining({ id: serverId, name: 'Search', installed: true, enabled: true, loading: undefined }),
    ])
    expect(adapter.runtime.tools.value[serverId!]).toEqual([
      expect.objectContaining({ id: 'search', name: 'search', enabled: true }),
    ])
    expect(mocks.transports).toEqual([
      {
        kind: 'sse',
        url: new URL('https://mcp.example.com/sse'),
        options: { requestInit: { headers: { Authorization: 'Bearer token' } } },
      },
    ])
  })

  it('keeps a failed dynamic server and retries it with the same id', async () => {
    mocks.connect.mockRejectedValueOnce(new Error('offline'))
    const adapter = createDefaultMcpAdapter([])
    const serverId = await adapter.runtime.registerMcpServer?.({
      name: 'Broken',
      type: 'streamableHttp',
      url: 'https://mcp.example.com/mcp',
    })

    expect(adapter.runtime.servers.value).toEqual([
      expect.objectContaining({ id: serverId, enabled: false, loading: undefined, error: new Error('offline') }),
    ])
    expect(adapter.runtime.tools.value[serverId!]).toBeUndefined()

    await adapter.runtime.setServerEnabled(serverId!, true)

    expect(adapter.runtime.servers.value).toEqual([
      expect.objectContaining({ id: serverId, enabled: true, error: undefined }),
    ])
    expect(adapter.runtime.tools.value[serverId!]).toHaveLength(1)
  })

  it('rejects duplicate configurations after normalizing headers', async () => {
    const adapter = createDefaultMcpAdapter([])
    await adapter.runtime.registerMcpServer?.({
      name: 'First',
      type: 'streamableHttp',
      url: 'https://mcp.example.com/mcp',
      headers: { Authorization: 'Bearer token' },
    })

    await expect(
      adapter.runtime.registerMcpServer?.({
        name: 'Second',
        type: 'streamableHttp',
        url: 'https://mcp.example.com/mcp',
        headers: { authorization: 'Bearer token' },
      }),
    ).rejects.toThrow('same transport, URL, and headers')
  })

  it('aliases long tool names while calling the original MCP tool name', async () => {
    const originalName = 'get_current_weather_for_the_selected_workspace_with_detailed_forecast_information'
    mocks.listTools.mockResolvedValue({ tools: [{ name: originalName }] })
    mocks.callTool.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] })
    const adapter = createDefaultMcpAdapter([])
    const serverId = await adapter.runtime.registerMcpServer?.({
      name: 'Weather',
      type: 'streamableHttp',
      url: 'https://mcp.example.com/mcp',
    })

    const definitions = await adapter.listTools([serverId!], { [serverId!]: [originalName] })

    expect(definitions[0]?.name.length).toBeLessThanOrEqual(64)
    expect(definitions[0]?.originalName).toBe(originalName)
    await adapter.callTool(serverId!, originalName, { city: 'Shanghai' })
    expect(mocks.callTool).toHaveBeenCalledWith({
      name: originalName,
      arguments: { city: 'Shanghai' },
    })
  })

  it('aliases tool names with characters unsupported by model APIs', async () => {
    mocks.listTools.mockResolvedValue({ tools: [{ name: 'get.current.weather' }] })
    const adapter = createDefaultMcpAdapter([])
    const serverId = await adapter.runtime.registerMcpServer?.({
      name: 'Weather',
      type: 'streamableHttp',
      url: 'https://mcp.example.com/mcp',
    })

    const definitions = await adapter.listTools([serverId!], { [serverId!]: ['get.current.weather'] })

    expect(definitions[0]?.name).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(definitions[0]?.originalName).toBe('get.current.weather')
  })

  it('does not execute a tool after its MCP server is disabled', async () => {
    const adapter = createDefaultMcpAdapter([
      {
        id: 'search-server',
        name: 'Search',
        baseUrl: 'https://mcp.example.com/mcp',
        installed: true,
      },
    ])

    await adapter.runtime.setServerEnabled('search-server', true)
    await adapter.runtime.setServerEnabled('search-server', false)

    await expect(adapter.callTool('search-server', 'search', {})).rejects.toThrow(
      'MCP server is not enabled: search-server',
    )
    expect(mocks.callTool).not.toHaveBeenCalled()
  })

  it('does not discover tools for a disabled MCP server', async () => {
    const adapter = createDefaultMcpAdapter([
      {
        id: 'search-server',
        name: 'Search',
        baseUrl: 'https://mcp.example.com/mcp',
        installed: true,
      },
    ])

    await adapter.runtime.setServerEnabled('search-server', true)
    mocks.listTools.mockClear()
    await adapter.runtime.setServerEnabled('search-server', false)

    await expect(adapter.listTools(['search-server'], { 'search-server': ['search'] })).resolves.toEqual([])
    expect(mocks.listTools).not.toHaveBeenCalled()
  })
})
