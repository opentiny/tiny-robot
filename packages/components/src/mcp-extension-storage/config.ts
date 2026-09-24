import type { McpExtensionInput, McpExtensionTransportType } from './index.type'
import { normalizeMcpExtensionInput } from './normalize'

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseTransportType = (value: unknown): McpExtensionTransportType => {
  if (value === undefined || value === 'http' || value === 'streamableHttp') return 'streamableHttp'
  if (value === 'sse') return 'sse'
  if (value === 'stdio') throw new Error('Stdio MCP servers are not supported')
  throw new Error('MCP server type must be sse, http, or streamableHttp')
}

export const parseMcpExtensionConfig = (config: string) => {
  let parsed: unknown
  try {
    parsed = JSON.parse(config)
  } catch (error) {
    const wrapped = new Error('Invalid MCP server config JSON') as Error & { cause?: unknown }
    wrapped.cause = error
    throw wrapped
  }

  if (!isObject(parsed)) throw new Error('MCP server config must be an object')
  if (!isObject(parsed.mcpServers)) throw new Error('MCP server config must contain an mcpServers object')

  const servers = Object.entries(parsed.mcpServers)
  if (servers.length !== 1) throw new Error('MCP server config must contain exactly one server')

  const [serverKey, server] = servers[0]
  if (!isObject(server)) throw new Error('MCP server config entry must be an object')
  if (Object.prototype.hasOwnProperty.call(server, 'command') || Object.prototype.hasOwnProperty.call(server, 'args')) {
    throw new Error('Stdio MCP servers are not supported')
  }
  if (server.name !== undefined && typeof server.name !== 'string') {
    throw new Error('MCP server name must be a string')
  }
  if (server.description !== undefined && typeof server.description !== 'string') {
    throw new Error('MCP server description must be a string')
  }
  if (typeof server.url !== 'string') throw new Error('MCP server URL must be a string')
  if (server.headers !== undefined && !isObject(server.headers)) {
    throw new Error('MCP server headers must be an object')
  }
  if (server.thumbnail !== undefined && server.thumbnail !== null && typeof server.thumbnail !== 'string') {
    throw new Error('MCP server thumbnail must be a string or null')
  }

  const input: McpExtensionInput = {
    name: server.name?.trim() || serverKey,
    description: server.description,
    type: parseTransportType(server.type),
    url: server.url,
    headers: server.headers,
    thumbnail: server.thumbnail,
  }

  return normalizeMcpExtensionInput(input)
}
