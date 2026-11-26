import { computed, ref } from 'vue'
import type { McpAdapter, McpRuntime, McpServerInfo, McpToolInfo, McpToolState, McpToolDefinition } from './types'
import { createWebMcpToolSource, normalizeWebMcpInputSchema } from './webmcpToolSource'
import type { CreateWebMcpAdapterOptions, WebMcpServerOptions } from './webmcpTypes'

const DEFAULT_SERVER_ID = 'webmcp'
const DEFAULT_SERVER_NAME = '页面 WebMCP'

interface WebMcpServerState extends McpServerInfo {
  options: WebMcpServerOptions
}

function hasOwn(value: object, key: PropertyKey) {
  return Object.prototype.hasOwnProperty.call(value, key)
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

export function createWebMcpAdapter(options: CreateWebMcpAdapterOptions = {}): McpAdapter {
  if (options.source && options.getContext) {
    throw new Error('createWebMcpAdapter accepts either source or getContext, not both')
  }

  const source = options.source ?? createWebMcpToolSource({ getContext: options.getContext })
  const configuredServer = options.server ?? {}
  const serverId = configuredServer.id ?? DEFAULT_SERVER_ID
  const serverOptions: WebMcpServerOptions = {
    id: serverId,
    name: configuredServer.name ?? DEFAULT_SERVER_NAME,
    description: configuredServer.description ?? 'document.modelContext 上的工具',
    icon: configuredServer.icon,
    installed: configuredServer.installed ?? true,
    enabled: configuredServer.enabled ?? true,
    metadata: configuredServer.metadata,
  }
  const server = ref<WebMcpServerState>({
    id: serverId,
    name: serverOptions.name!,
    description: serverOptions.description,
    icon: serverOptions.icon,
    installed: serverOptions.installed!,
    enabled: serverOptions.enabled!,
    metadata: serverOptions.metadata,
    options: serverOptions,
  })
  const toolStates = ref<McpToolInfo[]>([])
  const definitions = new Map<string, McpToolDefinition>()
  let generation = 0
  let refreshTask: Promise<void> | undefined
  let refreshRequested = false
  let closed = false
  let unsubscribe: (() => void) | undefined

  function clearTools() {
    definitions.clear()
    toolStates.value = []
  }

  function setError(error: unknown) {
    toolStates.value = toolStates.value.map((tool) => ({ ...tool, enabled: false }))
    server.value = {
      ...server.value,
      loading: undefined,
      enabled: false,
      error,
    }
  }

  async function refresh() {
    if (closed) {
      closed = false
      if (server.value.installed && server.value.enabled) startSubscription()
    }
    if (refreshTask) {
      refreshRequested = true
      return refreshTask
    }

    const task = (async () => {
      do {
        refreshRequested = false
        const currentGeneration = generation

        if (!server.value.installed) return
        server.value = { ...server.value, loading: true }

        try {
          const listed = await source.listTools()
          if (closed || generation !== currentGeneration || !server.value.installed) return

          const enabledById = new Map(toolStates.value.map((tool) => [tool.id, tool.enabled]))
          const nextDefinitions = new Map<string, McpToolDefinition>()
          const nextTools: McpToolInfo[] = []

          for (const tool of listed) {
            if (!tool?.name || nextDefinitions.has(tool.name)) continue
            const definition: McpToolDefinition = {
              serverId,
              id: tool.name,
              name: createToolName(serverId, tool.name),
              originalName: tool.name,
              description: tool.description,
              inputSchema: normalizeWebMcpInputSchema(tool.inputSchema),
            }
            nextDefinitions.set(tool.name, definition)
            nextTools.push({
              id: tool.name,
              name: tool.name,
              description: tool.description,
              enabled: enabledById.get(tool.name) ?? server.value.enabled,
            })
          }

          definitions.clear()
          for (const [id, definition] of nextDefinitions) definitions.set(id, definition)
          toolStates.value = nextTools
          server.value = { ...server.value, loading: undefined, error: undefined }
        } catch (error) {
          if (!closed && generation === currentGeneration) setError(error)
          throw error
        }
      } while (refreshRequested && !closed)
    })()

    refreshTask = task
    task.then(
      () => {
        if (refreshTask === task) refreshTask = undefined
      },
      () => {
        if (refreshTask === task) refreshTask = undefined
      },
    )
    return task
  }

  function handleToolChange() {
    void refresh().catch(() => undefined)
  }

  function startSubscription() {
    if (!unsubscribe && source.subscribe) unsubscribe = source.subscribe(handleToolChange)
  }

  function stopSubscription() {
    unsubscribe?.()
    unsubscribe = undefined
  }

  const runtime: McpRuntime = {
    servers: computed(() => {
      const { options: _options, ...view } = server.value
      return [{ ...view }]
    }),
    tools: computed<McpToolState>(() => ({
      [serverId]: toolStates.value.map((tool) => ({ ...tool })),
    })),
    async addServer(id) {
      if (id !== serverId) throw new Error(`Unknown MCP server: ${id}`)
      server.value = { ...server.value, installed: true, enabled: true, error: undefined }
      startSubscription()
      await refresh()
      toolStates.value = toolStates.value.map((tool) => ({ ...tool, enabled: true }))
    },
    removeServer(id) {
      if (id !== serverId) throw new Error(`Unknown MCP server: ${id}`)
      generation += 1
      refreshRequested = false
      refreshTask = undefined
      server.value = {
        ...server.value,
        installed: false,
        enabled: false,
        loading: undefined,
        error: undefined,
      }
      clearTools()
      stopSubscription()
    },
    async setServerEnabled(id, enabled) {
      if (id !== serverId) throw new Error(`Unknown MCP server: ${id}`)
      if (enabled && !server.value.installed) throw new Error(`MCP server is not installed: ${id}`)

      if (enabled) {
        startSubscription()
        await refresh()
        server.value = { ...server.value, enabled: true, error: undefined }
        toolStates.value = toolStates.value.map((tool) => ({ ...tool, enabled: true }))
      } else {
        generation += 1
        refreshRequested = false
        refreshTask = undefined
        stopSubscription()
        server.value = { ...server.value, enabled: false, loading: undefined, error: undefined }
        toolStates.value = toolStates.value.map((tool) => ({ ...tool, enabled: false }))
      }
    },
    setToolEnabled(id, toolId, enabled) {
      if (id !== serverId) throw new Error(`Unknown MCP server: ${id}`)
      if (!server.value.installed) throw new Error(`MCP server is not installed: ${id}`)
      if (!toolStates.value.some((tool) => tool.id === toolId)) {
        throw new Error(`Unknown MCP tool: ${id}/${toolId}`)
      }

      const nextTools = toolStates.value.map((tool) => (tool.id === toolId ? { ...tool, enabled } : tool))
      toolStates.value = nextTools
      const hasEnabledTools = nextTools.some((tool) => tool.enabled)

      if (hasEnabledTools) {
        startSubscription()
      } else {
        generation += 1
        refreshRequested = false
        refreshTask = undefined
        stopSubscription()
      }

      server.value = {
        ...server.value,
        enabled: hasEnabledTools,
        loading: hasEnabledTools ? server.value.loading : undefined,
      }
    },
  }

  const listTools = async (
    serverIds: readonly string[],
    selectedToolIds: Readonly<Record<string, readonly string[]>>,
  ) => {
    if (serverIds.some((id) => id !== serverId)) throw new Error(`Unknown MCP server: ${serverIds.join(', ')}`)
    if (!serverIds.includes(serverId)) return []
    if (!hasOwn(selectedToolIds, serverId)) throw new Error(`MCP tool selection is missing for this turn: ${serverId}`)
    if (!server.value.installed || !server.value.enabled) return []

    if (definitions.size === 0) await refresh()

    const selectedIds = selectedToolIds[serverId]
    const selected = selectedIds.map((id) => definitions.get(id))
    if (selected.some((definition) => !definition)) {
      throw new Error(`MCP tools selected for this turn no longer exist on "${serverId}".`)
    }

    return selected as McpToolDefinition[]
  }

  const callTool = async (id: string, toolName: string, args: Record<string, unknown>) => {
    if (id !== serverId) throw new Error(`Unknown MCP server: ${id}`)
    if (!server.value.installed || !server.value.enabled) throw new Error(`MCP server is not enabled: ${id}`)
    if (!definitions.has(toolName)) await refresh()
    if (!definitions.has(toolName)) throw new Error(`Unknown MCP tool: ${id}/${toolName}`)
    return source.callTool(toolName, args)
  }

  if (server.value.installed && server.value.enabled) {
    startSubscription()
    void refresh().catch(() => undefined)
  }

  return {
    runtime,
    listTools,
    callTool,
    refreshServer(id: string) {
      if (id !== serverId) throw new Error(`Unknown MCP server: ${id}`)
      return refresh()
    },
    refresh,
    close() {
      closed = true
      generation += 1
      refreshRequested = false
      refreshTask = undefined
      stopSubscription()
      server.value = { ...server.value, loading: undefined }
      clearTools()
    },
  }
}
