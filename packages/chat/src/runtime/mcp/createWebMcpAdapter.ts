import { computed, ref } from 'vue'
import type { ChatMcpServerInfo, ChatMcpRuntime, ChatMcpToolInfo, ChatMcpToolState } from '../../types'
import type { ChatMcpAdapter } from './compositeMcpAdapter'
import type { ChatMcpToolDefinition, ChatToolCallTool, ChatToolListTools } from '../plugins/mcpToolPlugin'
import { createWebMcpToolSource, normalizeWebMcpInputSchema } from './webmcpToolSource'
import type { CreateWebMcpAdapterOptions, WebMcpServerOptions } from './webmcpTypes'

const DEFAULT_SERVER_ID = 'webmcp'
const DEFAULT_SERVER_NAME = '页面 WebMCP'

interface WebMcpServerState extends ChatMcpServerInfo {
  options: WebMcpServerOptions
}

function hasOwn(value: object, key: PropertyKey) {
  return Object.prototype.hasOwnProperty.call(value, key)
}

export function createWebMcpAdapter(options: CreateWebMcpAdapterOptions = {}): ChatMcpAdapter {
  const source = options.source ?? createWebMcpToolSource({ getContext: options.getContext })
  const configuredServer = options.server ?? options
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
  const toolStates = ref<ChatMcpToolInfo[]>([])
  const definitions = new Map<string, ChatMcpToolDefinition>()
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
    if (closed) return
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
          const nextDefinitions = new Map<string, ChatMcpToolDefinition>()
          const nextTools: ChatMcpToolInfo[] = []

          for (const tool of listed) {
            if (!tool?.name || nextDefinitions.has(tool.name)) continue
            const definition: ChatMcpToolDefinition = {
              serverId,
              id: tool.name,
              name: `${serverId}__${tool.name}`,
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

  const runtime: ChatMcpRuntime = {
    servers: computed(() => {
      const { options: _options, ...view } = server.value
      return [{ ...view }]
    }),
    tools: computed<ChatMcpToolState>(() => ({
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
        if (definitions.size === 0 || server.value.error) await refresh()
        server.value = { ...server.value, enabled: true, error: undefined }
        toolStates.value = toolStates.value.map((tool) => ({ ...tool, enabled: true }))
      } else {
        server.value = { ...server.value, enabled: false, error: undefined }
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
      server.value = {
        ...server.value,
        enabled: nextTools.some((tool) => tool.enabled),
      }
    },
  }

  const listTools: ChatToolListTools = async (serverIds, selectedToolIds) => {
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

    return selected as ChatMcpToolDefinition[]
  }

  const callTool: ChatToolCallTool = async (id, toolName, args) => {
    if (id !== serverId) throw new Error(`Unknown MCP server: ${id}`)
    if (!server.value.installed || !server.value.enabled) throw new Error(`MCP server is not enabled: ${id}`)
    if (!definitions.has(toolName)) await refresh()
    if (!definitions.has(toolName)) throw new Error(`Unknown MCP tool: ${id}/${toolName}`)
    return source.callTool(toolName, args)
  }

  startSubscription()
  if (server.value.installed) void refresh().catch(() => undefined)

  return {
    runtime,
    listTools,
    callTool,
    refresh,
    close() {
      closed = true
      generation += 1
      stopSubscription()
      clearTools()
    },
  }
}
