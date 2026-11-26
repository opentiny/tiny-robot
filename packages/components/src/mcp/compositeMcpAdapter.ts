import { computed, shallowRef } from 'vue'
import type {
  CompositeMcpAdapter,
  CreateCompositeMcpAdapterOptions,
  McpAdapter,
  McpServerInfo,
  McpToolDefinition,
  McpToolInfo,
  McpToolState,
  McpToolCallTool,
  McpToolListTools,
  McpRuntime,
} from './types'

function getAdapterForServer(adapters: readonly McpAdapter[], serverId: string): McpAdapter {
  const matches = adapters.filter((adapter) => adapter.runtime.servers.value.some((server) => server.id === serverId))

  if (matches.length === 0) throw new Error(`Unknown MCP server: ${serverId}`)
  if (matches.length > 1) throw new Error(`Duplicate MCP server id: ${serverId}`)
  return matches[0]
}

function collectServers(adapters: readonly McpAdapter[]): McpServerInfo[] {
  const servers: McpServerInfo[] = []
  const serverIds = new Set<string>()

  for (const adapter of adapters) {
    for (const server of adapter.runtime.servers.value) {
      if (serverIds.has(server.id)) throw new Error(`Duplicate MCP server id: ${server.id}`)
      serverIds.add(server.id)
      servers.push({ ...server })
    }
  }

  return servers
}

function collectTools(adapters: readonly McpAdapter[]): McpToolState {
  const tools: Record<string, McpToolInfo[]> = {}

  for (const adapter of adapters) {
    for (const [serverId, serverTools] of Object.entries(adapter.runtime.tools.value)) {
      if (!serverTools) continue
      if (Object.prototype.hasOwnProperty.call(tools, serverId)) {
        throw new Error(`Duplicate MCP server id: ${serverId}`)
      }
      tools[serverId] = serverTools.map((tool) => ({ ...tool }))
    }
  }

  return tools
}

function getRegistrationHandler(adapter: McpAdapter) {
  return adapter.runtime.registerMcpServer ?? adapter.registerMcpServer
}

export function createCompositeMcpAdapter(options: CreateCompositeMcpAdapterOptions = {}): CompositeMcpAdapter {
  const adapters = shallowRef<McpAdapter[]>([...(options.adapters ?? [])])
  let registrationAdapter = options.registrationAdapter

  async function registerMcpServer(config: Parameters<NonNullable<McpAdapter['registerMcpServer']>>[0]) {
    const adapter = registrationAdapter
    const handler = adapter ? getRegistrationHandler(adapter) : undefined
    if (!adapter || !adapters.value.includes(adapter) || !handler) {
      throw new Error('MCP registration adapter is no longer attached')
    }
    return handler(config)
  }

  const runtime: McpRuntime = {
    servers: computed(() => collectServers(adapters.value)),
    tools: computed(() => collectTools(adapters.value)),
    addServer(serverId) {
      return getAdapterForServer(adapters.value, serverId).runtime.addServer(serverId)
    },
    removeServer(serverId) {
      return getAdapterForServer(adapters.value, serverId).runtime.removeServer(serverId)
    },
    setServerEnabled(serverId, enabled) {
      return getAdapterForServer(adapters.value, serverId).runtime.setServerEnabled(serverId, enabled)
    },
    setToolEnabled(serverId, toolId, enabled) {
      return getAdapterForServer(adapters.value, serverId).runtime.setToolEnabled(serverId, toolId, enabled)
    },
  }

  collectServers(adapters.value)

  if (registrationAdapter && getRegistrationHandler(registrationAdapter)) {
    runtime.registerMcpServer = registerMcpServer
  }

  const listTools: McpToolListTools = async (serverIds, selectedToolIds) => {
    const grouped = new Map<McpAdapter, { serverIds: string[]; toolIds: Record<string, readonly string[]> }>()

    for (const serverId of serverIds) {
      const adapter = getAdapterForServer(adapters.value, serverId)
      const group = grouped.get(adapter) ?? { serverIds: [], toolIds: {} }
      group.serverIds.push(serverId)
      group.toolIds[serverId] = selectedToolIds[serverId] ?? []
      grouped.set(adapter, group)
    }

    const definitions = new Map<string, McpToolDefinition[]>()
    await Promise.all(
      [...grouped.entries()].map(async ([adapter, group]) => {
        const result = await adapter.listTools(group.serverIds, group.toolIds)
        for (const definition of result) {
          const current = definitions.get(definition.serverId) ?? []
          current.push(definition)
          definitions.set(definition.serverId, current)
        }
      }),
    )

    return serverIds.flatMap((serverId) => definitions.get(serverId) ?? [])
  }

  const callTool: McpToolCallTool = async (serverId, toolName, args) =>
    getAdapterForServer(adapters.value, serverId).callTool(serverId, toolName, args)

  async function addAdapter(adapter: McpAdapter) {
    if (adapters.value.includes(adapter)) throw new Error('MCP adapter is already attached')

    await adapter.refresh?.()

    const newServerIds = adapter.runtime.servers.value.map((server) => server.id)
    const newServerIdSet = new Set<string>()
    for (const serverId of newServerIds) {
      if (newServerIdSet.has(serverId)) throw new Error(`Duplicate MCP server id: ${serverId}`)
      newServerIdSet.add(serverId)
    }

    const existingServerIds = new Set(runtime.servers.value.map((server) => server.id))

    for (const serverId of newServerIds) {
      if (existingServerIds.has(serverId)) throw new Error(`Duplicate MCP server id: ${serverId}`)
    }

    adapters.value = [...adapters.value, adapter]
  }

  async function removeAdapter(adapter: McpAdapter) {
    if (!adapters.value.includes(adapter)) throw new Error('MCP adapter is not attached')
    try {
      await adapter.close?.()
    } finally {
      if (adapter === registrationAdapter) registrationAdapter = undefined
      adapters.value = adapters.value.filter((item) => item !== adapter)
    }
  }

  async function refreshServer(serverId: string) {
    const adapter = getAdapterForServer(adapters.value, serverId)
    if (adapter.refreshServer) {
      await adapter.refreshServer(serverId)
      return
    }
    await adapter.refresh?.()
  }

  async function refreshServers(serverIds: readonly string[]) {
    const grouped = new Map<McpAdapter, string[]>()
    for (const serverId of serverIds) {
      const adapter = getAdapterForServer(adapters.value, serverId)
      const ids = grouped.get(adapter) ?? []
      ids.push(serverId)
      grouped.set(adapter, ids)
    }

    await Promise.all(
      [...grouped.entries()].map(async ([adapter, ids]) => {
        if (adapter.refreshServer) {
          await Promise.all(ids.map((serverId) => adapter.refreshServer!(serverId)))
          return
        }
        await adapter.refresh?.()
      }),
    )
  }

  async function refresh() {
    await Promise.all(adapters.value.map((adapter) => adapter.refresh?.()))
  }

  async function close() {
    try {
      await Promise.all(adapters.value.map((adapter) => adapter.close?.()))
    } finally {
      registrationAdapter = undefined
    }
  }

  return {
    runtime,
    listTools,
    callTool,
    registerMcpServer:
      registrationAdapter && getRegistrationHandler(registrationAdapter) ? registerMcpServer : undefined,
    addAdapter,
    removeAdapter,
    refreshServer,
    refreshServers,
    refresh,
    close,
  }
}
