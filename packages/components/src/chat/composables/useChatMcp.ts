import type { PluginInfo } from '../../mcp-server-picker/index.type'
import { Client } from '@modelcontextprotocol/sdk/client'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp'
import type { CallToolRequest } from '@modelcontextprotocol/sdk/types'
import { computed, ref, watch } from 'vue'
import type { ChatMcpServerConfig } from '../index.type'

type McpTool = Awaited<ReturnType<Client['listTools']>>['tools'][number]
type McpToolCallResult = Awaited<ReturnType<Client['callTool']>>
type ToolArguments = CallToolRequest['params']['arguments']

export interface EnabledChatMcpTool {
  serverId: string
  name: string
  fullName: string
  description: string
  inputSchema: Record<string, unknown>
}

interface StoredMcpState {
  addedServerIds: string[]
  enabledServerIds: string[]
  enabledToolIds: Partial<Record<string, string[]>>
}

interface UseChatMcpOptions {
  storageKey: string
  mcpServers: Record<string, ChatMcpServerConfig>
  defaultInstalledServerIds: string[]
  marketServerIds: string[]
}

function createInitialState(defaultInstalledServerIds: string[]): StoredMcpState {
  return {
    addedServerIds: [...defaultInstalledServerIds],
    enabledServerIds: [...defaultInstalledServerIds],
    enabledToolIds: {},
  }
}

function createToolId(tool: McpTool, fallbackIndex: number) {
  return typeof tool.name === 'string' && tool.name.length > 0 ? tool.name : `tool-${fallbackIndex + 1}`
}

function createFullToolName(serverId: string, toolName: string) {
  return `${serverId}__${toolName}`
}

function normalizeToolDescription(tool: McpTool) {
  return typeof tool.description === 'string' ? tool.description : ''
}

function normalizeInputSchema(tool: McpTool): Record<string, unknown> {
  return (
    (tool.inputSchema as Record<string, unknown> | undefined) || {
      type: 'object',
      properties: {},
    }
  )
}

function formatToolResult(result: McpToolCallResult): string {
  const content = Array.isArray(result.content) ? result.content : []
  if (content.length === 0) {
    return ''
  }

  return content
    .map((item) => {
      if ('text' in item && typeof item.text === 'string') {
        return item.text
      }

      return JSON.stringify(item)
    })
    .join('\n')
}

export function useChatMcp(options: UseChatMcpOptions) {
  const { storageKey, mcpServers, defaultInstalledServerIds, marketServerIds } = options
  const knownServerIds = Object.keys(mcpServers)

  function isKnownServerId(value: string) {
    return knownServerIds.includes(value)
  }

  function loadStoredState(): StoredMcpState {
    if (typeof window === 'undefined') {
      return createInitialState(defaultInstalledServerIds)
    }

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        return createInitialState(defaultInstalledServerIds)
      }

      const parsed = JSON.parse(raw) as Partial<StoredMcpState>
      const addedServerIds = (parsed.addedServerIds || []).filter(isKnownServerId)
      const enabledServerIds = (parsed.enabledServerIds || []).filter((serverId) => addedServerIds.includes(serverId))
      const enabledToolIds = Object.fromEntries(
        Object.entries(parsed.enabledToolIds || {}).filter(([serverId]) => isKnownServerId(serverId)),
      ) as StoredMcpState['enabledToolIds']

      return {
        addedServerIds: addedServerIds.length > 0 ? addedServerIds : [...defaultInstalledServerIds],
        enabledServerIds,
        enabledToolIds,
      }
    } catch {
      return createInitialState(defaultInstalledServerIds)
    }
  }

  function createMcpClient(serverId: string, server: ChatMcpServerConfig) {
    const client = new Client({
      name: serverId,
      version: '0.1.0',
    })
    const requestInit = {
      headers: server.headers,
    }
    const url = new URL(server.url, window.location.origin)
    const transport =
      server.type === 'streamableHttp'
        ? new StreamableHTTPClientTransport(url, { requestInit })
        : new SSEClientTransport(url, { requestInit })

    return { client, transport }
  }

  async function listToolsFromServer(serverId: string): Promise<McpTool[]> {
    const server = mcpServers[serverId]
    const { client, transport } = createMcpClient(serverId, server)
    try {
      await client.connect(transport)
      const response = await client.listTools()
      return response.tools
    } finally {
      await client.close().catch(() => undefined)
    }
  }

  async function callToolFromServer(serverId: string, toolName: string, args: ToolArguments = {}): Promise<string> {
    const server = mcpServers[serverId]
    const { client, transport } = createMcpClient(serverId, server)
    try {
      await client.connect(transport)
      const result = await client.callTool({
        name: toolName,
        arguments: args,
      })

      if (result.isError) {
        throw new Error(formatToolResult(result) || `MCP tool "${toolName}" failed.`)
      }

      return formatToolResult(result)
    } finally {
      await client.close().catch(() => undefined)
    }
  }

  const initialState = loadStoredState()
  const pickerVisible = ref(false)
  const addedServerIds = ref<string[]>(initialState.addedServerIds)
  const enabledServerIds = ref<string[]>(initialState.enabledServerIds)
  const enabledToolIds = ref<StoredMcpState['enabledToolIds']>(initialState.enabledToolIds)
  const loadedTools = ref<Partial<Record<string, McpTool[]>>>({})
  const addingServerIds = ref<string[]>([])
  const toolLoaders = new Map<string, Promise<McpTool[]>>()

  const addedServerSet = computed(() => new Set(addedServerIds.value))
  const enabledServerSet = computed(() => new Set(enabledServerIds.value))

  watch(
    [addedServerIds, enabledServerIds, enabledToolIds],
    () => {
      if (typeof window === 'undefined') {
        return
      }

      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          addedServerIds: addedServerIds.value,
          enabledServerIds: enabledServerIds.value.filter((serverId) => addedServerSet.value.has(serverId)),
          enabledToolIds: enabledToolIds.value,
        } satisfies StoredMcpState),
      )
    },
    { deep: true },
  )

  function setEnabledToolIds(serverId: string, toolIds: string[]) {
    enabledToolIds.value = {
      ...enabledToolIds.value,
      [serverId]: [...new Set(toolIds)],
    }
  }

  function syncEnabledToolIds(serverId: string, tools: McpTool[]) {
    const toolIds = tools.map((tool, index) => createToolId(tool, index))
    const hasStoredSelection = Object.prototype.hasOwnProperty.call(enabledToolIds.value, serverId)
    const nextEnabledToolIds = hasStoredSelection
      ? (enabledToolIds.value[serverId] || []).filter((toolId) => toolIds.includes(toolId))
      : toolIds

    setEnabledToolIds(serverId, nextEnabledToolIds)
  }

  async function ensureServerTools(serverId: string): Promise<McpTool[]> {
    const cachedTools = loadedTools.value[serverId]
    if (cachedTools) {
      return cachedTools
    }

    const loadingTask = toolLoaders.get(serverId)
    if (loadingTask) {
      return loadingTask
    }

    const nextLoader = listToolsFromServer(serverId)
      .then((tools) => {
        loadedTools.value = {
          ...loadedTools.value,
          [serverId]: tools,
        }
        syncEnabledToolIds(serverId, tools)
        return tools
      })
      .finally(() => {
        toolLoaders.delete(serverId)
      })

    toolLoaders.set(serverId, nextLoader)

    return nextLoader
  }

  function setServerEnabled(serverId: string, enabled: boolean) {
    if (enabled) {
      if (!enabledServerSet.value.has(serverId)) {
        enabledServerIds.value = [...enabledServerIds.value, serverId]
      }
      return
    }

    enabledServerIds.value = enabledServerIds.value.filter((item) => item !== serverId)
  }

  async function addServer(serverId: string) {
    if (!addedServerSet.value.has(serverId)) {
      addedServerIds.value = [...addedServerIds.value, serverId]
    }

    setServerEnabled(serverId, true)

    try {
      await ensureServerTools(serverId)
    } catch (error) {
      removeServer(serverId)
      throw error
    }
  }

  function removeServer(serverId: string) {
    addedServerIds.value = addedServerIds.value.filter((item) => item !== serverId)
    enabledServerIds.value = enabledServerIds.value.filter((item) => item !== serverId)

    const nextLoadedTools = { ...loadedTools.value }
    delete nextLoadedTools[serverId]
    loadedTools.value = nextLoadedTools

    const nextEnabledToolIds = { ...enabledToolIds.value }
    delete nextEnabledToolIds[serverId]
    enabledToolIds.value = nextEnabledToolIds
  }

  function getToolEnabled(serverId: string, toolId: string) {
    return (enabledToolIds.value[serverId] || []).includes(toolId)
  }

  function setToolEnabled(serverId: string, toolId: string, enabled: boolean) {
    const nextEnabledToolIds = new Set(enabledToolIds.value[serverId] || [])
    if (enabled) {
      nextEnabledToolIds.add(toolId)
    } else {
      nextEnabledToolIds.delete(toolId)
    }
    setEnabledToolIds(serverId, [...nextEnabledToolIds])
  }

  const installedPlugins = computed<PluginInfo[]>(() =>
    addedServerIds.value.map((serverId) => {
      const server = mcpServers[serverId]
      const tools = (loadedTools.value[serverId] || []).map((tool, index) => {
        const toolId = createToolId(tool, index)
        return {
          id: toolId,
          name: toolId,
          description: normalizeToolDescription(tool),
          enabled: enabledServerSet.value.has(serverId) && getToolEnabled(serverId, toolId),
        }
      })

      return {
        id: serverId,
        name: server.name,
        icon: server.icon,
        description: server.description,
        enabled: enabledServerSet.value.has(serverId),
        expanded: true,
        tools,
      }
    }),
  )

  const marketPlugins = computed<PluginInfo[]>(() =>
    marketServerIds
      .filter((serverId) => isKnownServerId(serverId))
      .map((serverId) => {
        const server = mcpServers[serverId]
        return {
          id: serverId,
          name: server.name,
          icon: server.icon,
          description: server.description,
          enabled: false,
          category: server.category,
          tools: [],
          addState: addedServerSet.value.has(serverId)
            ? 'added'
            : addingServerIds.value.includes(serverId)
              ? 'loading'
              : 'idle',
        }
      }),
  )

  const activePluginCount = computed(() => enabledServerIds.value.length)

  async function getEnabledTools(): Promise<EnabledChatMcpTool[]> {
    await Promise.all(enabledServerIds.value.map((serverId) => ensureServerTools(serverId)))

    return enabledServerIds.value.flatMap((serverId) => {
      const tools = loadedTools.value[serverId] || []
      return tools.flatMap((tool, index) => {
        const toolId = createToolId(tool, index)
        if (!getToolEnabled(serverId, toolId)) {
          return []
        }

        return [
          {
            serverId,
            name: toolId,
            fullName: createFullToolName(serverId, toolId),
            description: normalizeToolDescription(tool),
            inputSchema: normalizeInputSchema(tool),
          },
        ]
      })
    })
  }

  function parseFullToolName(fullToolName: string) {
    const [serverId, ...toolNameParts] = fullToolName.split('__')
    if (!serverId || !isKnownServerId(serverId)) {
      throw new Error(`Unknown MCP tool name: ${fullToolName}`)
    }

    const toolName = toolNameParts.join('__')
    if (!toolName) {
      throw new Error(`Unknown MCP tool name: ${fullToolName}`)
    }

    return { serverId, toolName }
  }

  async function callTool(fullToolName: string, args: Record<string, unknown> = {}) {
    const { serverId, toolName } = parseFullToolName(fullToolName)

    if (!enabledServerSet.value.has(serverId)) {
      throw new Error(`MCP server "${serverId}" is disabled.`)
    }

    await ensureServerTools(serverId)

    if (!getToolEnabled(serverId, toolName)) {
      throw new Error(`MCP tool "${toolName}" is disabled.`)
    }

    return callToolFromServer(serverId, toolName, args)
  }

  async function handlePluginAdd(plugin: PluginInfo) {
    if (
      !isKnownServerId(plugin.id) ||
      addedServerSet.value.has(plugin.id) ||
      addingServerIds.value.includes(plugin.id)
    ) {
      return
    }

    addingServerIds.value = [...addingServerIds.value, plugin.id]
    try {
      await addServer(plugin.id)
    } finally {
      addingServerIds.value = addingServerIds.value.filter((serverId) => serverId !== plugin.id)
    }
  }

  async function handlePluginToggle(plugin: PluginInfo, enabled: boolean) {
    if (!isKnownServerId(plugin.id)) {
      return
    }

    if (enabled) {
      await ensureServerTools(plugin.id)
      setServerEnabled(plugin.id, true)
      return
    }

    setServerEnabled(plugin.id, false)
  }

  function handlePluginDelete(plugin: PluginInfo) {
    if (!isKnownServerId(plugin.id)) {
      return
    }

    removeServer(plugin.id)
  }

  function handleToolToggle(plugin: PluginInfo, toolId: string, enabled: boolean) {
    if (!isKnownServerId(plugin.id)) {
      return
    }

    setToolEnabled(plugin.id, toolId, enabled)

    if (enabled) {
      setServerEnabled(plugin.id, true)
    }
  }

  function closePicker() {
    pickerVisible.value = false
  }

  addedServerIds.value.forEach((serverId) => {
    void ensureServerTools(serverId).catch(() => undefined)
  })

  return {
    pickerVisible,
    installedPlugins,
    marketPlugins,
    activePluginCount,
    handlePluginAdd,
    handlePluginToggle,
    handlePluginDelete,
    handleToolToggle,
    getEnabledTools,
    callTool,
    closePicker,
  }
}
