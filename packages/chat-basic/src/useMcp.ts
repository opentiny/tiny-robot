import { computed, ref } from 'vue'
import type { ChatMcpRuntime, ChatMcpServerInfo, ChatMcpToolInfo } from '@opentiny/tiny-robot-chat'
import { Client } from '@modelcontextprotocol/sdk/client'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp'
import { McpServers, type McpServerConfig } from './mcpServers'

export interface McpToolItem {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
}

const mcpDefinitions = Object.entries(McpServers).map(([id, server]) => ({
  id,
  ...server,
}))

function createMcpClient(serverId: string, server: McpServerConfig) {
  const client = new Client({ name: serverId, version: '0.1.0' })
  const requestInit = {
    headers: server.headers,
  }
  const transport =
    server.type === 'streamableHttp'
      ? new StreamableHTTPClientTransport(new URL(server.baseUrl), { requestInit })
      : new SSEClientTransport(new URL(server.baseUrl), { requestInit })

  return { client, transport }
}

async function withMcpClient<T>(serverId: string, handler: (client: Client) => Promise<T>) {
  const server = mcpDefinitions.find((item) => item.id === serverId)

  if (!server) {
    throw new Error(`Unknown MCP server: ${serverId}`)
  }

  const { client, transport } = createMcpClient(serverId, server)

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
      id: item.id,
      name: item.name,
      description: item.description,
      installed: false,
      enabled: false,
      metadata: {
        icon: item.logoUrl,
      },
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

    async listTools(id) {
      return listServerTools(id)
    },
  }

  async function listServerTools(serverId: string): Promise<ChatMcpToolInfo[]> {
    const tools = await withMcpClient(serverId, async (client) => (await client.listTools()).tools)

    return tools.map((tool, index) => {
      const name = typeof tool.name === 'string' && tool.name ? tool.name : `tool_${index + 1}`

      return {
        id: name,
        name,
        description: tool.description ?? '',
      }
    })
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
