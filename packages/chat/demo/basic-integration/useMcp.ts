import { computed, ref } from 'vue'
import type { ChatMcpRuntime, ChatMcpServerInfo } from '../../src/types'
import { Client } from '@modelcontextprotocol/sdk/client'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp'

export interface McpToolItem {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
}

const mcpDefinitions = [
  {
    id: 'model-context-protocol-mcp',
    name: 'Model Context Protocol MCP',
    description: 'MCP Server',
    type: 'streamableHttp' as const,
    baseUrl: `${window.location.origin}/modelcontextprotocol-mcp`,
  },
] as const

async function withMcpClient<T>(serverId: string, handler: (client: Client) => Promise<T>) {
  const server = mcpDefinitions.find((item) => item.id === serverId)

  if (!server) {
    throw new Error(`Unknown MCP server: ${serverId}`)
  }

  const client = new Client({ name: serverId, version: '0.1.0' })
  const transport =
    server.type === 'streamableHttp'
      ? new StreamableHTTPClientTransport(new URL(server.baseUrl))
      : new SSEClientTransport(new URL(server.baseUrl))

  try {
    await client.connect(transport)
    return await handler(client)
  } finally {
    await client.close().catch(() => undefined)
  }
}

export function useMcp() {
  const servers = ref<ChatMcpServerInfo[]>(
    mcpDefinitions.map((item) => ({
      ...item,
      installed: false,
      enabled: false,
    })),
  )

  const mcp: ChatMcpRuntime = {
    servers: computed(() => servers.value.map((server) => ({ ...server }))),

    addServer(id) {
      const server = servers.value.find((item) => item.id === id)

      if (!server) {
        throw new Error(`Unknown MCP server: ${id}`)
      }

      server.installed = true
      server.enabled = true
    },

    removeServer(id) {
      const server = servers.value.find((item) => item.id === id)

      if (!server) {
        throw new Error(`Unknown MCP server: ${id}`)
      }

      server.installed = false
      server.enabled = false
    },

    setServerEnabled(id, enabled) {
      const server = servers.value.find((item) => item.id === id)

      if (!server) {
        throw new Error(`Unknown MCP server: ${id}`)
      }

      if (enabled && !server.installed) {
        throw new Error(`MCP server is not installed: ${id}`)
      }

      server.enabled = enabled
    },
  }

  async function listTools(serverIds: readonly string[]): Promise<McpToolItem[]> {
    const results = await Promise.all(
      serverIds.map(async (serverId) => {
        const tools = await withMcpClient(serverId, async (client) => (await client.listTools()).tools)

        return tools.map((tool, index) => ({
          name: `${serverId}__${typeof tool.name === 'string' && tool.name ? tool.name : `tool_${index + 1}`}`,
          description: tool.description ?? '',
          inputSchema: (tool.inputSchema as Record<string, unknown> | undefined) ?? {
            type: 'object',
            properties: {},
          },
        }))
      }),
    )

    return results.flat()
  }

  async function callTool(serverId: string, toolName: string, args: Record<string, unknown>) {
    return withMcpClient(serverId, async (client) =>
      client.callTool({
        name: toolName,
        arguments: args,
      }),
    )
  }

  return {
    mcp,
    listTools,
    callTool,
  }
}
