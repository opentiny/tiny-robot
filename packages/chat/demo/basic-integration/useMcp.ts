import { computed, ref } from 'vue'
import type { ChatMcpRuntime, ChatMcpServerInfo, ChatMcpToolInfo } from '../../src/types'
import { Client } from '@modelcontextprotocol/sdk/client'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp'

export interface McpToolItem {
  /** MCP Server 内部的原始 Tool ID。 */
  id: string
  /** 发送给模型的 namespaced Tool 名称。 */
  name: string
  originalName: string
  serverId: string
  description?: string
  inputSchema?: Record<string, unknown>
}

class McpToolSelectionChangedError extends Error {}

interface McpListedTool {
  name?: unknown
  description?: string
  inputSchema?: unknown
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

function normalizeTool(serverId: string, tool: McpListedTool, index: number): McpToolItem {
  const originalName = typeof tool.name === 'string' && tool.name ? tool.name : `tool_${index + 1}`

  return {
    id: originalName,
    name: `${serverId}__${originalName}`,
    originalName,
    serverId,
    description: tool.description ?? '',
    inputSchema: (tool.inputSchema as Record<string, unknown> | undefined) ?? {
      type: 'object',
      properties: {},
    },
  }
}

export function useMcp() {
  const servers = ref<ChatMcpServerInfo[]>(
    mcpDefinitions.map((item) => ({
      ...item,
      installed: false,
      enabled: false,
      loading: false,
    })),
  )
  const toolState = ref<Record<string, ChatMcpToolInfo[]>>({})
  const toolDefinitions = ref<Record<string, McpToolItem[]>>({})
  const toolLoadPromises = new Map<string, Promise<void>>()
  const toolDefinitionLoadPromises = new Map<string, Promise<readonly McpToolItem[]>>()
  const toolLoadVersions = new Map<string, number>()

  function findServer(id: string) {
    return servers.value.find((item) => item.id === id)
  }

  function requireServer(id: string) {
    const server = findServer(id)

    if (!server) {
      throw new Error(`Unknown MCP server: ${id}`)
    }

    return server
  }

  function deleteServerTools(serverId: string) {
    const nextToolState = { ...toolState.value }

    delete nextToolState[serverId]

    toolState.value = nextToolState
    toolLoadVersions.set(serverId, (toolLoadVersions.get(serverId) ?? 0) + 1)
    toolLoadPromises.delete(serverId)
  }

  async function loadToolDefinitions(serverId: string, refresh = false): Promise<readonly McpToolItem[]> {
    const cachedDefinitions = toolDefinitions.value[serverId]

    if (!refresh && cachedDefinitions) {
      return cachedDefinitions
    }

    const pending = toolDefinitionLoadPromises.get(serverId)

    if (pending) {
      return pending
    }

    const task = withMcpClient<McpListedTool[]>(
      serverId,
      async (client) => (await client.listTools()).tools as McpListedTool[],
    ).then((tools) => {
      const definitions = tools.map((tool, index) => normalizeTool(serverId, tool, index))

      toolDefinitions.value = {
        ...toolDefinitions.value,
        [serverId]: definitions,
      }

      return definitions
    })

    toolDefinitionLoadPromises.set(serverId, task)

    try {
      return await task
    } finally {
      if (toolDefinitionLoadPromises.get(serverId) === task) {
        toolDefinitionLoadPromises.delete(serverId)
      }
    }
  }

  async function loadServerTools(serverId: string) {
    const server = requireServer(serverId)

    if (!server.installed) {
      throw new Error(`MCP server is not installed: ${serverId}`)
    }

    const loadVersion = toolLoadVersions.get(serverId) ?? 0
    server.loading = true

    try {
      const definitions = await loadToolDefinitions(serverId, true)
      const currentServer = requireServer(serverId)

      // The Server may have been removed while the network request was in
      // flight. Do not resurrect its Tool state after removal.
      if (!currentServer.installed || (toolLoadVersions.get(serverId) ?? 0) !== loadVersion) {
        return
      }

      const previousEnabled = new Map((toolState.value[serverId] ?? []).map((tool) => [tool.id, tool.enabled] as const))

      toolState.value = {
        ...toolState.value,
        [serverId]: definitions.map((tool) => ({
          id: tool.id,
          name: tool.originalName,
          description: tool.description,
          enabled: previousEnabled.get(tool.id) ?? true,
        })),
      }
    } catch (error) {
      if ((toolLoadVersions.get(serverId) ?? 0) === loadVersion) {
        const nextToolState = { ...toolState.value }

        delete nextToolState[serverId]

        toolState.value = nextToolState
      }

      throw error
    } finally {
      const currentServer = findServer(serverId)

      if (currentServer && (toolLoadVersions.get(serverId) ?? 0) === loadVersion) {
        currentServer.loading = false
      }
    }
  }

  function loadTools(serverId: string): Promise<void> {
    const pending = toolLoadPromises.get(serverId)

    if (pending) {
      return pending
    }

    const task = loadServerTools(serverId).finally(() => {
      if (toolLoadPromises.get(serverId) === task) {
        toolLoadPromises.delete(serverId)
      }
    })

    toolLoadPromises.set(serverId, task)
    return task
  }

  function setToolEnabled(serverId: string, toolId: string, enabled: boolean) {
    const server = requireServer(serverId)

    if (!server.installed) {
      throw new Error(`MCP server is not installed: ${serverId}`)
    }

    const tools = toolState.value[serverId]

    if (!tools) {
      throw new Error(`MCP tools are not loaded: ${serverId}`)
    }

    if (!tools.some((tool) => tool.id === toolId)) {
      throw new Error(`Unknown MCP tool: ${serverId}/${toolId}`)
    }

    toolState.value = {
      ...toolState.value,
      [serverId]: tools.map((tool) => (tool.id === toolId ? { ...tool, enabled } : tool)),
    }
  }

  const mcp: ChatMcpRuntime = {
    servers: computed(() => servers.value.map((server) => ({ ...server }))),
    tools: computed(() =>
      Object.fromEntries(
        Object.entries(toolState.value).map(([serverId, tools]) => [serverId, tools.map((tool) => ({ ...tool }))]),
      ),
    ),

    addServer(id) {
      const server = requireServer(id)

      server.installed = true
      server.enabled = true
    },

    removeServer(id) {
      const server = requireServer(id)

      server.installed = false
      server.enabled = false
      server.loading = false
      deleteServerTools(id)
    },

    setServerEnabled(id, enabled) {
      const server = requireServer(id)

      if (enabled && !server.installed) {
        throw new Error(`MCP server is not installed: ${id}`)
      }

      server.enabled = enabled
    },

    loadTools,
    setToolEnabled,
  }

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
        const definitions = toolDefinitions.value[serverId] ?? (await loadToolDefinitions(serverId))
        const enabledToolIdSet = new Set(enabledToolIds)
        const selectedDefinitions = definitions.filter((tool) => enabledToolIdSet.has(tool.id))
        const resolvedToolIdSet = new Set(selectedDefinitions.map((tool) => tool.id))
        const missingToolIds = enabledToolIds.filter((toolId) => !resolvedToolIdSet.has(toolId))

        if (missingToolIds.length > 0) {
          throw new McpToolSelectionChangedError(
            `MCP tools selected for this turn no longer exist on "${serverId}": ${missingToolIds.join(', ')}`,
          )
        }

        return selectedDefinitions.map((tool) => ({ ...tool }))
      }),
    )

    const resolvedTools = results.flatMap((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      }

      console.error(`[MCP] Failed to load tools for "${serverIds[index]}":`, result.reason)
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
