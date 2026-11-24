import { computed, ref } from 'vue'
import { Client } from '@modelcontextprotocol/sdk/client'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import type { McpServerRegistrationConfig } from '@opentiny/tiny-robot'
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
  dynamic?: boolean
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
    name: createToolName(serverId, originalName),
    originalName,
    description: tool.description,
    inputSchema:
      typeof tool.inputSchema === 'object' && tool.inputSchema !== null
        ? (tool.inputSchema as Record<string, unknown>)
        : { type: 'object', properties: {} },
  }
}

function createToolName(serverId: string, originalName: string) {
  const directName = `${serverId}__${originalName}`
  if (directName.length <= 64 && /^[A-Za-z0-9_-]+$/.test(directName)) return directName

  let hash = 2166136261
  for (const character of `${serverId}\0${originalName}`) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }

  const digest = (hash >>> 0).toString(36)
  const prefix = `mcp_${digest}_`
  const readableName = originalName.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 64 - prefix.length)
  return `${prefix}${readableName}`
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

function normalizeHeaders(headers?: Record<string, string>) {
  return Object.entries(headers ?? {})
    .map(([name, value]) => [name.trim().toLowerCase(), value] as const)
    .sort(([left], [right]) => left.localeCompare(right))
}

function normalizeConfigUrl(baseUrl: string) {
  const value = baseUrl.trim()
  try {
    const origin = globalThis.location?.origin
    return (origin ? new URL(value, origin) : new URL(value)).href
  } catch {
    return value.replace(/\/+$/, '') || '/'
  }
}

function getConfigKey(config: ChatMcpServerConfig) {
  return JSON.stringify([
    config.type ?? 'streamableHttp',
    normalizeConfigUrl(config.baseUrl),
    normalizeHeaders(config.headers),
  ])
}

function normalizeServerConfig(config: ChatMcpServerConfig): ChatMcpServerConfig {
  return {
    ...config,
    type: config.type ?? 'streamableHttp',
  }
}

function createServerId(configById: Map<string, ChatMcpServerConfig>) {
  const randomId = globalThis.crypto?.randomUUID?.()
  const base = randomId ? `mcp-${randomId}` : `mcp-${Date.now().toString(36)}`
  let id = base
  let suffix = 1

  while (configById.has(id)) {
    id = `${base}-${suffix++}`
  }

  return id
}

function toServerConfig(id: string, value: McpServerRegistrationConfig): ChatMcpServerConfig {
  const name = value.name.trim()
  const baseUrl = value.url.trim()

  if (!name) throw new Error('MCP server name is required.')
  if (!baseUrl) throw new Error('MCP server URL is required.')
  if (value.type !== 'sse' && value.type !== 'streamableHttp')
    throw new Error(`Unsupported MCP transport: ${value.type}`)
  if (value.headers && Object.keys(value.headers).some((name) => !name.trim())) {
    throw new Error('MCP request header names cannot be empty.')
  }

  resolveServerUrl(id, baseUrl)

  return normalizeServerConfig({
    id,
    name,
    baseUrl,
    type: value.type,
    installed: true,
    description: value.description?.trim() || undefined,
    icon: value.thumbnail ?? undefined,
    headers: value.headers ? { ...value.headers } : undefined,
  })
}

export function createDefaultMcpAdapter(serverConfigs: ChatMcpServers) {
  const configById = new Map<string, ChatMcpServerConfig>()
  const normalizedConfigs = serverConfigs.map(normalizeServerConfig)
  for (const config of normalizedConfigs) {
    if (configById.has(config.id)) throw new Error(`Duplicate MCP server id: ${config.id}`)
    configById.set(config.id, config)
  }
  const serverStates = ref<ServerState[]>(
    normalizedConfigs.map((config) => ({
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

  function setServerToolsEnabled(serverId: string, enabled: boolean) {
    const serverTools = tools.value[serverId]
    if (!serverTools) return

    tools.value = {
      ...tools.value,
      [serverId]: serverTools.map((tool) => ({ ...tool, enabled })),
    }
  }

  function createTransport(serverId: string, config: ChatMcpServerConfig) {
    const url = resolveServerUrl(serverId, config.baseUrl)
    const options = { requestInit: { headers: config.headers } }

    return (config.type ?? 'streamableHttp') === 'sse'
      ? new SSEClientTransport(url, options)
      : new StreamableHTTPClientTransport(url, options)
  }

  async function withClient<T>(serverId: string, task: (client: Client) => Promise<T>) {
    const config = configById.get(serverId)
    if (!config) throw new Error(`Unknown MCP server: ${serverId}`)
    config.validate?.(serverId)
    const client = new Client({ name: `tiny-robot-chat-${serverId}`, version: '1.0.0' })
    const transport = createTransport(serverId, config)
    const timeout = config.timeout ?? DEFAULT_TIMEOUT

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

  async function loadTools(serverId: string, defaultToolEnabled = true) {
    const currentTask = loadTasks.get(serverId)
    if (currentTask) {
      await currentTask
      return
    }

    const task = loadToolsInternal(serverId, defaultToolEnabled)
    loadTasks.set(serverId, task)
    try {
      await task
    } finally {
      if (loadTasks.get(serverId) === task) loadTasks.delete(serverId)
    }
  }

  async function loadToolsInternal(serverId: string, defaultToolEnabled: boolean) {
    const server = getServer(serverId)
    if (!server.installed) throw new Error(`MCP server is not installed: ${serverId}`)
    const generation = generations.get(serverId) ?? 0
    const currentServer = server
    let clearCurrentLoading = false
    server.loading = true
    server.error = undefined
    try {
      const nextDefinitions = await discover(serverId, true)
      if (!currentServer.installed || (generations.get(serverId) ?? 0) !== generation) return
      tools.value = {
        ...tools.value,
        [serverId]: nextDefinitions.map((tool) => ({
          id: tool.id,
          name: tool.originalName,
          description: tool.description,
          enabled: currentServer.enabled && defaultToolEnabled,
        })),
      }
    } catch (error) {
      if ((generations.get(serverId) ?? 0) === generation) {
        currentServer.enabled = false
        currentServer.error = error
        clearCurrentLoading = true
        clearServer(serverId)
      }
      throw error
    } finally {
      if ((generations.get(serverId) ?? 0) === generation || clearCurrentLoading) currentServer.loading = undefined
    }
  }

  async function registerMcpServer(value: McpServerRegistrationConfig) {
    const id = createServerId(configById)
    const config = toServerConfig(id, value)

    if ([...configById.values()].some((item) => getConfigKey(item) === getConfigKey(config))) {
      throw new Error('An MCP server with the same transport, URL, and headers is already registered.')
    }

    const server: ServerState = {
      id,
      name: config.name,
      description: config.description,
      installed: true,
      enabled: true,
      loading: true,
      metadata: config.icon ? { icon: config.icon } : undefined,
      config,
      dynamic: true,
    }

    configById.set(id, config)
    serverStates.value = [...serverStates.value, server]

    try {
      await loadTools(id, true)
    } catch {
      // Keep the registered server in the runtime so the user can retry it.
    }

    return id
  }

  const runtime: ChatMcpRuntime = {
    servers: computed(() =>
      serverStates.value.map(({ config: _config, dynamic: _dynamic, ...server }) => ({ ...server })),
    ),
    tools: computed<ChatMcpToolState>(() =>
      Object.fromEntries(Object.entries(tools.value).map(([id, items]) => [id, items.map((item) => ({ ...item }))])),
    ),
    registerMcpServer,
    async addServer(serverId) {
      const server = getServer(serverId)
      server.installed = true
      server.enabled = true
      if (tools.value[serverId]) {
        setServerToolsEnabled(serverId, true)
        return
      }
      await loadTools(serverId)
      setServerToolsEnabled(serverId, true)
    },
    removeServer(serverId) {
      const server = getServer(serverId)
      server.installed = false
      server.enabled = false
      server.loading = undefined
      server.error = undefined
      clearServer(serverId)
      if (server.dynamic) {
        configById.delete(serverId)
        serverStates.value = serverStates.value.filter((item) => item !== server)
      }
    },
    async setServerEnabled(serverId, enabled) {
      const server = getServer(serverId)
      if (enabled && !server.installed) throw new Error(`MCP server is not installed: ${serverId}`)
      server.enabled = enabled
      server.error = undefined
      if (enabled) {
        if (tools.value[serverId]) {
          setServerToolsEnabled(serverId, true)
          return
        }
        await loadTools(serverId)
        setServerToolsEnabled(serverId, true)
      } else {
        setServerToolsEnabled(serverId, false)
      }
    },
    setToolEnabled(serverId, toolId, enabled) {
      const server = getServer(serverId)
      const serverTools = tools.value[serverId]
      if (!server.installed) throw new Error(`MCP server is not installed: ${serverId}`)
      if (!serverTools) throw new Error(`MCP tools are not loaded: ${serverId}`)
      if (!serverTools.some((tool) => tool.id === toolId)) throw new Error(`Unknown MCP tool: ${serverId}/${toolId}`)
      const nextTools = serverTools.map((tool) => (tool.id === toolId ? { ...tool, enabled } : tool))
      tools.value = {
        ...tools.value,
        [serverId]: nextTools,
      }
      if (enabled) {
        server.enabled = true
      } else if (!nextTools.some((tool) => tool.enabled)) {
        server.enabled = false
      }
    },
  }

  for (const server of serverStates.value) {
    if (server.installed) {
      void loadTools(server.id, false).catch(() => undefined)
    }
  }

  const listTools: ChatToolListTools = async (serverIds, selectedToolIds) => {
    const result: ToolSnapshot[] = []
    for (const serverId of serverIds) {
      const server = getServer(serverId)
      if (!Object.prototype.hasOwnProperty.call(selectedToolIds, serverId)) {
        throw new Error(`MCP tool selection is missing for this turn: ${serverId}`)
      }
      if (!server.installed || !server.enabled) continue
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

  const callTool: ChatToolCallTool = async (serverId, originalName, args) => {
    const server = getServer(serverId)
    if (!server.installed || !server.enabled) throw new Error(`MCP server is not enabled: ${serverId}`)
    return withClient(serverId, (client) => client.callTool({ name: originalName, arguments: args }))
  }

  return {
    runtime,
    listTools,
    callTool,
    registerMcpServer,
    async refreshServer(serverId: string) {
      await loadTools(serverId, true)
    },
  }
}
