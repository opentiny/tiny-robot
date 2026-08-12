import { computed, ref } from 'vue'
import { Client } from '@modelcontextprotocol/sdk/client'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp'
import type { ChatMcpRuntime, ChatMcpServerInfo, ChatMcpToolInfo, ChatMcpToolState } from '../../types'
import type { ChatMcpServerConfig, ChatMcpServers } from './types'
import type { ChatMcpToolDefinition, ChatToolCallTool, ChatToolListTools } from '../plugins/mcpToolPlugin'

const DEFAULT_TIMEOUT = 30_000

interface ToolSnapshot extends ChatMcpToolDefinition {
  description?: string
  inputSchema?: Record<string, unknown>
}

interface ServerState extends ChatMcpServerInfo {
  config: ChatMcpServerConfig
}

interface DiscoveryTask {
  generation: number
  task: Promise<readonly ToolSnapshot[]>
}

function withTimeout<T>(task: Promise<T>, timeout: number, operation: string) {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeoutTask = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`MCP ${operation} timed out after ${timeout}ms.`)), timeout)
  })

  return Promise.race([task, timeoutTask]).finally(() => {
    if (timer !== undefined) clearTimeout(timer)
  })
}

function normalizeTool(
  serverId: string,
  tool: { name?: string; description?: string; inputSchema?: unknown },
  index: number,
): ToolSnapshot {
  const originalName = typeof tool.name === 'string' && tool.name ? tool.name : `tool_${index + 1}`
  return {
    serverId,
    id: originalName,
    name: `${serverId}__${originalName}`,
    originalName,
    description: tool.description,
    inputSchema:
      typeof tool.inputSchema === 'object' && tool.inputSchema !== null
        ? (tool.inputSchema as Record<string, unknown>)
        : { type: 'object', properties: {} },
  }
}

function resolveServerUrl(serverId: string, baseUrl: string): URL {
  try {
    return new URL(baseUrl)
  } catch {
    const origin = globalThis.location?.origin
    if (!origin) {
      throw new Error(`MCP server "${serverId}" requires an absolute baseUrl outside a browser environment.`)
    }
    return new URL(baseUrl, origin)
  }
}

export function createDefaultMcpAdapter(serverConfigs: ChatMcpServers) {
  const configById = new Map<string, ChatMcpServerConfig>()
  for (const config of serverConfigs) {
    if (configById.has(config.id)) throw new Error(`Duplicate MCP server id: ${config.id}`)
    configById.set(config.id, config)
  }
  const serverStates = ref<ServerState[]>(
    serverConfigs.map((config) => ({
      id: config.id,
      name: config.name,
      description: config.description,
      installed: config.installed === true,
      enabled: false,
      metadata: config.icon ? { icon: config.icon } : undefined,
      config,
    })),
  )
  const tools = ref<Record<string, ChatMcpToolInfo[]>>({})
  const definitions = new Map<string, readonly ToolSnapshot[]>()
  const discoveryTasks = new Map<string, DiscoveryTask>()
  const loadTasks = new Map<string, Promise<void>>()
  const generations = new Map<string, number>()

  function getServer(serverId: string) {
    const server = serverStates.value.find((item) => item.id === serverId)
    if (!server) throw new Error(`Unknown MCP server: ${serverId}`)
    return server
  }

  function clearServer(serverId: string) {
    const next = { ...tools.value }
    delete next[serverId]
    tools.value = next
    definitions.delete(serverId)
    loadTasks.delete(serverId)
    discoveryTasks.delete(serverId)
    generations.set(serverId, (generations.get(serverId) ?? 0) + 1)
  }

  async function withClient<T>(serverId: string, task: (client: Client) => Promise<T>) {
    const server = getServer(serverId)
    server.config.validate?.(serverId)
    const client = new Client({ name: `tiny-robot-chat-${serverId}`, version: '1.0.0' })
    const transport = new StreamableHTTPClientTransport(resolveServerUrl(serverId, server.config.baseUrl), {
      requestInit: { headers: server.config.headers },
    })
    const timeout = server.config.timeout ?? DEFAULT_TIMEOUT

    try {
      await withTimeout(client.connect(transport), timeout, 'connect')
      return await withTimeout(task(client), timeout, 'request')
    } finally {
      await client.close().catch(() => undefined)
    }
  }

  async function discover(serverId: string, refresh = false) {
    const cached = definitions.get(serverId)
    if (!refresh && cached) return cached
    const generation = generations.get(serverId) ?? 0
    const currentTask = discoveryTasks.get(serverId)
    if (currentTask?.generation === generation) return currentTask.task

    const task = withClient(serverId, async (client) => {
      const result = await client.listTools()
      return result.tools.map((tool, index) => normalizeTool(serverId, tool, index))
    })
    const discoveryTask = { generation, task }
    discoveryTasks.set(serverId, discoveryTask)
    try {
      const result = await task
      if ((generations.get(serverId) ?? 0) === generation) {
        definitions.set(serverId, result)
      }
      return result
    } finally {
      if (discoveryTasks.get(serverId) === discoveryTask) discoveryTasks.delete(serverId)
    }
  }

  async function loadTools(serverId: string) {
    const currentTask = loadTasks.get(serverId)
    if (currentTask) return currentTask

    const task = loadToolsInternal(serverId)
    loadTasks.set(serverId, task)
    try {
      await task
    } finally {
      if (loadTasks.get(serverId) === task) loadTasks.delete(serverId)
    }
  }

  async function loadToolsInternal(serverId: string) {
    const server = getServer(serverId)
    if (!server.installed) throw new Error(`MCP server is not installed: ${serverId}`)
    const generation = generations.get(serverId) ?? 0
    server.loading = true
    server.error = undefined
    try {
      const nextDefinitions = await discover(serverId, true)
      const currentServer = getServer(serverId)
      if (!currentServer.installed || (generations.get(serverId) ?? 0) !== generation) return
      tools.value = {
        ...tools.value,
        [serverId]: nextDefinitions.map((tool) => ({
          id: tool.id,
          name: tool.originalName,
          description: tool.description,
          enabled: true,
        })),
      }
    } catch (error) {
      if ((generations.get(serverId) ?? 0) === generation) {
        const currentServer = getServer(serverId)
        currentServer.enabled = false
        currentServer.error = error
        clearServer(serverId)
        currentServer.loading = undefined
      }
      throw error
    } finally {
      if ((generations.get(serverId) ?? 0) === generation) getServer(serverId).loading = undefined
    }
  }

  const runtime: ChatMcpRuntime = {
    servers: computed(() => serverStates.value.map(({ config: _config, ...server }) => ({ ...server }))),
    tools: computed<ChatMcpToolState>(() =>
      Object.fromEntries(Object.entries(tools.value).map(([id, items]) => [id, items.map((item) => ({ ...item }))])),
    ),
    async addServer(serverId) {
      const server = getServer(serverId)
      server.installed = true
      server.enabled = true
      try {
        await loadTools(serverId)
      } catch (error) {
        server.enabled = false
        throw error
      }
    },
    removeServer(serverId) {
      const server = getServer(serverId)
      server.installed = false
      server.enabled = false
      server.loading = undefined
      server.error = undefined
      clearServer(serverId)
    },
    async setServerEnabled(serverId, enabled) {
      const server = getServer(serverId)
      if (enabled && !server.installed) throw new Error(`MCP server is not installed: ${serverId}`)
      server.enabled = enabled
      server.error = undefined
      if (enabled) {
        try {
          await loadTools(serverId)
        } catch (error) {
          server.enabled = false
          throw error
        }
      } else {
        clearServer(serverId)
      }
    },
    setToolEnabled(serverId, toolId, enabled) {
      const server = getServer(serverId)
      const serverTools = tools.value[serverId]
      if (!server.installed || !server.enabled) throw new Error(`MCP server is not enabled: ${serverId}`)
      if (!serverTools) throw new Error(`MCP tools are not loaded: ${serverId}`)
      if (!serverTools.some((tool) => tool.id === toolId)) throw new Error(`Unknown MCP tool: ${serverId}/${toolId}`)
      tools.value = {
        ...tools.value,
        [serverId]: serverTools.map((tool) => (tool.id === toolId ? { ...tool, enabled } : tool)),
      }
    },
  }

  const listTools: ChatToolListTools = async (serverIds, selectedToolIds) => {
    const result: ToolSnapshot[] = []
    for (const serverId of serverIds) {
      if (!Object.prototype.hasOwnProperty.call(selectedToolIds, serverId)) {
        throw new Error(`MCP tool selection is missing for this turn: ${serverId}`)
      }
      const serverDefinitions = definitions.get(serverId) ?? (await discover(serverId))
      const selectedIds = selectedToolIds[serverId]
      if (selectedIds.length === 0) continue
      const selected = serverDefinitions.filter((tool) => selectedIds.includes(tool.id))
      if (selected.length !== selectedIds.length)
        throw new Error(`MCP tools selected for this turn no longer exist on "${serverId}".`)
      result.push(...selected)
    }
    return result
  }

  const callTool: ChatToolCallTool = (serverId, originalName, args) =>
    withClient(serverId, (client) => client.callTool({ name: originalName, arguments: args }))

  return { runtime, listTools, callTool }
}
