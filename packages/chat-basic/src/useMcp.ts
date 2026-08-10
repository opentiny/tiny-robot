import { computed, ref } from 'vue'
import type { ChatMcpRuntime, ChatMcpServerInfo, ChatMcpToolInfo, ChatMcpToolState } from '@opentiny/tiny-robot-chat'
import { Client } from '@modelcontextprotocol/sdk/client'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp'
import { McpServers, type McpServerConfig } from './mcpServers'

export interface McpToolItem {
  serverId: string
  id: string
  name: string
  originalName: string
  description?: string
  inputSchema?: Record<string, unknown>
}

class McpToolSelectionChangedError extends Error {}

const mcpDefinitions = Object.entries(McpServers).map(([id, server]) => ({
  id,
  ...server,
}))

function createMcpClient(serverId: string, server: McpServerConfig) {
  server.validate?.(serverId)

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

function normalizeTool(
  serverId: string,
  tool: Awaited<ReturnType<Client['listTools']>>['tools'][number],
  index: number,
) {
  const id = typeof tool.name === 'string' && tool.name ? tool.name : `tool_${index + 1}`

  return {
    serverId,
    id,
    name: `${serverId}__${id}`,
    originalName: id,
    description: tool.description ?? '',
    inputSchema: (tool.inputSchema as Record<string, unknown> | undefined) ?? {
      type: 'object',
      properties: {},
    },
  } satisfies McpToolItem
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
  const tools = ref<Record<string, ChatMcpToolInfo[]>>({})
  const toolDefinitions = new Map<string, readonly McpToolItem[]>()
  const toolLoadTasks = new Map<string, Promise<void>>()
  const toolDefinitionLoadTasks = new Map<string, Promise<readonly McpToolItem[]>>()
  const toolLoadVersions = new Map<string, number>()

  function findServer(id: string) {
    const server = servers.value.find((item) => item.id === id)

    if (!server) {
      throw new Error(`Unknown MCP server: ${id}`)
    }

    return server
  }

  function setServerLoading(id: string, loading: boolean) {
    findServer(id).loading = loading || undefined
  }

  function clearServerTools(id: string) {
    const nextTools = { ...tools.value }
    delete nextTools[id]
    tools.value = nextTools
    toolLoadVersions.set(id, (toolLoadVersions.get(id) ?? 0) + 1)
    toolLoadTasks.delete(id)
  }

  async function loadToolDefinitions(serverId: string, refresh = false): Promise<readonly McpToolItem[]> {
    const cachedDefinitions = toolDefinitions.get(serverId)

    if (!refresh && cachedDefinitions) {
      return cachedDefinitions
    }

    const currentTask = toolDefinitionLoadTasks.get(serverId)

    if (currentTask) {
      return currentTask
    }

    const task = withMcpClient(serverId, async (client) => {
      const remoteTools = (await client.listTools()).tools
      const definitions = remoteTools.map((tool, index) => normalizeTool(serverId, tool, index))

      toolDefinitions.set(serverId, definitions)

      return definitions
    })

    toolDefinitionLoadTasks.set(serverId, task)

    try {
      return await task
    } finally {
      if (toolDefinitionLoadTasks.get(serverId) === task) {
        toolDefinitionLoadTasks.delete(serverId)
      }
    }
  }

  async function loadTools(serverId: string) {
    const currentTask = toolLoadTasks.get(serverId)

    if (currentTask) {
      return currentTask
    }

    const server = findServer(serverId)

    if (!server.installed) {
      throw new Error(`MCP server is not installed: ${serverId}`)
    }

    const loadVersion = toolLoadVersions.get(serverId) ?? 0
    const task = (async () => {
      setServerLoading(serverId, true)

      try {
        const nextDefinitions = await loadToolDefinitions(serverId, true)
        const currentServer = findServer(serverId)

        if (!currentServer.installed || (toolLoadVersions.get(serverId) ?? 0) !== loadVersion) {
          return
        }

        const previousEnabledState = new Map(
          (tools.value[serverId] ?? []).map((tool) => [tool.id, tool.enabled] as const),
        )
        tools.value = {
          ...tools.value,
          [serverId]: nextDefinitions.map(({ id, description }) => ({
            id,
            name: id,
            description,
            enabled: previousEnabledState.get(id) ?? true,
          })),
        }
      } catch (error) {
        if ((toolLoadVersions.get(serverId) ?? 0) === loadVersion) {
          const nextTools = { ...tools.value }
          delete nextTools[serverId]
          tools.value = nextTools

          const currentServer = findServer(serverId)

          if (currentServer.installed) {
            currentServer.enabled = false
          }
        }

        throw error
      } finally {
        if ((toolLoadVersions.get(serverId) ?? 0) === loadVersion) {
          setServerLoading(serverId, false)
        }
      }
    })()

    toolLoadTasks.set(serverId, task)

    try {
      await task
    } finally {
      if (toolLoadTasks.get(serverId) === task) {
        toolLoadTasks.delete(serverId)
      }
    }
  }

  const mcp: ChatMcpRuntime = {
    servers: computed(() => servers.value.map((server) => ({ ...server }))),
    tools: computed<ChatMcpToolState>(() =>
      Object.fromEntries(
        Object.entries(tools.value).map(([serverId, serverTools]) => [
          serverId,
          serverTools.map((tool) => ({ ...tool })),
        ]),
      ),
    ),

    async addServer(id) {
      const server = findServer(id)

      server.installed = true
      server.enabled = true

      try {
        await loadTools(id)
      } catch (error) {
        server.enabled = false
        throw error
      }
    },

    removeServer(id) {
      const server = findServer(id)

      server.installed = false
      server.enabled = false
      server.loading = undefined
      clearServerTools(id)
    },

    async setServerEnabled(id, enabled) {
      const server = findServer(id)

      if (enabled && !server.installed) {
        throw new Error(`MCP server is not installed: ${id}`)
      }

      server.enabled = enabled

      if (enabled) {
        try {
          await loadTools(id)
        } catch (error) {
          server.enabled = false
          throw error
        }
      }
    },

    setToolEnabled(serverId, toolId, enabled) {
      const server = findServer(serverId)

      if (!server.installed) {
        throw new Error(`MCP server is not installed: ${serverId}`)
      }

      const serverTools = tools.value[serverId]

      if (!serverTools) {
        throw new Error(`MCP tools are not loaded: ${serverId}`)
      }

      if (!serverTools.some((item) => item.id === toolId)) {
        throw new Error(`Unknown MCP tool: ${serverId}/${toolId}`)
      }

      tools.value = {
        ...tools.value,
        [serverId]: serverTools.map((tool) => (tool.id === toolId ? { ...tool, enabled } : tool)),
      }
    },
  }

  function ensureEnabledTools() {
    for (const server of servers.value) {
      if (server.installed && server.enabled) {
        void loadTools(server.id).catch(() => undefined)
      }
    }
  }

  ensureEnabledTools()

  async function listTools(
    serverIds: readonly string[],
    selectedToolIds: Readonly<Record<string, readonly string[]>>,
  ): Promise<McpToolItem[]> {
    const results = await Promise.allSettled(
      serverIds.map(async (serverId) => {
        if (!Object.prototype.hasOwnProperty.call(selectedToolIds, serverId)) {
          throw new Error(`MCP tool selection is missing for this turn: ${serverId}`)
        }

        const enabledToolIds = selectedToolIds[serverId]

        if (enabledToolIds.length === 0) {
          return []
        }

        // Historical turns resolve only the internal catalog. They must not
        // install a Server or overwrite the current Composer Tool choices.
        const definitions = toolDefinitions.get(serverId) ?? (await loadToolDefinitions(serverId))

        if (!definitions) {
          throw new Error(`MCP tools are not loaded: ${serverId}`)
        }

        const enabledToolIdSet = new Set(enabledToolIds)
        const selectedDefinitions = definitions.filter((tool) => enabledToolIdSet.has(tool.id))
        const resolvedToolIdSet = new Set(selectedDefinitions.map((tool) => tool.id))
        const missingToolIds = enabledToolIds.filter((toolId) => !resolvedToolIdSet.has(toolId))

        if (missingToolIds.length > 0) {
          throw new McpToolSelectionChangedError(
            `MCP tools selected for this turn no longer exist on "${serverId}": ${missingToolIds.join(', ')}`,
          )
        }

        return selectedDefinitions
      }),
    )

    const resolvedTools = results.flatMap((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      }

      console.error(`[MCP] Failed to resolve tools for "${serverIds[index]}":`, result.reason)
      return []
    })

    const selectionErrors = results.flatMap((result) =>
      result.status === 'rejected' && result.reason instanceof McpToolSelectionChangedError ? [result.reason] : [],
    )

    if (selectionErrors.length > 0) {
      throw new Error(selectionErrors.map((error) => error.message).join('; '))
    }

    if (results.length > 0 && results.every((result) => result.status === 'rejected')) {
      throw new Error('Failed to resolve tools for all enabled MCP servers.')
    }

    return resolvedTools
  }

  async function callTool(serverId: string, originalName: string, args: Record<string, unknown>) {
    return withMcpClient(serverId, async (client) =>
      client.callTool({
        name: originalName,
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
