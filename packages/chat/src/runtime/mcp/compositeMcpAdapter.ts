import { computed, shallowRef } from 'vue'
import type { McpExtensionFormValue } from '@opentiny/tiny-robot'
import type { ChatMcpRuntime, ChatMcpServerInfo, ChatMcpToolInfo, ChatMcpToolState } from '../../types'
import type { ChatMcpToolDefinition, ChatToolCallTool, ChatToolListTools } from '../plugins/mcpToolPlugin'

export interface ChatMcpAdapter {
  runtime: ChatMcpRuntime
  listTools: ChatToolListTools
  callTool: ChatToolCallTool
  registerMcpServer?: (config: McpExtensionFormValue) => Promise<string>
  refresh?: () => Promise<void> | void
  close?: () => Promise<void> | void
}

export interface CreateCompositeMcpAdapterOptions {
  adapters?: readonly ChatMcpAdapter[]
  registrationAdapter?: ChatMcpAdapter
}

export interface CompositeMcpAdapter extends ChatMcpAdapter {
  addAdapter: (adapter: ChatMcpAdapter) => Promise<void>
  removeAdapter: (serverId: string) => Promise<void>
  refreshServer: (id: string) => Promise<void>
}

function getAdapterForServer(adapters: readonly ChatMcpAdapter[], serverId: string): ChatMcpAdapter {
  const matches = adapters.filter((adapter) => adapter.runtime.servers.value.some((server) => server.id === serverId))

  if (matches.length === 0) throw new Error(`Unknown MCP server: ${serverId}`)
  if (matches.length > 1) throw new Error(`Duplicate MCP server id: ${serverId}`)
  return matches[0]
}

function collectServers(adapters: readonly ChatMcpAdapter[]): ChatMcpServerInfo[] {
  const servers: ChatMcpServerInfo[] = []
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

function collectTools(adapters: readonly ChatMcpAdapter[]): ChatMcpToolState {
  const tools: Record<string, ChatMcpToolInfo[]> = {}

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

export function createCompositeMcpAdapter(options: CreateCompositeMcpAdapterOptions = {}): CompositeMcpAdapter {
  const adapters = shallowRef<ChatMcpAdapter[]>([...(options.adapters ?? [])])
  let registrationAdapter = options.registrationAdapter

  async function registerMcpServer(config: McpExtensionFormValue) {
    const adapter = registrationAdapter
    if (!adapter || !adapters.value.includes(adapter) || !adapter.registerMcpServer) {
      throw new Error('MCP registration adapter is no longer attached')
    }
    return adapter.registerMcpServer(config)
  }

  const runtime: ChatMcpRuntime = {
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

  if (registrationAdapter?.registerMcpServer) {
    runtime.registerMcpServer = registerMcpServer
  }

  const listTools: ChatToolListTools = async (serverIds, selectedToolIds) => {
    const grouped = new Map<ChatMcpAdapter, { serverIds: string[]; toolIds: Record<string, readonly string[]> }>()

    for (const serverId of serverIds) {
      const adapter = getAdapterForServer(adapters.value, serverId)
      const group = grouped.get(adapter) ?? { serverIds: [], toolIds: {} }
      group.serverIds.push(serverId)
      group.toolIds[serverId] = selectedToolIds[serverId] ?? []
      grouped.set(adapter, group)
    }

    const definitions = new Map<string, ChatMcpToolDefinition[]>()
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

  const callTool: ChatToolCallTool = async (serverId, toolName, args) =>
    getAdapterForServer(adapters.value, serverId).callTool(serverId, toolName, args)

  async function addAdapter(adapter: ChatMcpAdapter) {
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

  async function removeAdapter(serverId: string) {
    const adapter = getAdapterForServer(adapters.value, serverId)
    try {
      await adapter.close?.()
    } finally {
      if (adapter === registrationAdapter) registrationAdapter = undefined
      adapters.value = adapters.value.filter((item) => item !== adapter)
    }
  }

  async function refreshServer(serverId: string) {
    const adapter = getAdapterForServer(adapters.value, serverId)
    await adapter.refresh?.()
  }

  async function close() {
    await Promise.all(adapters.value.map((adapter) => adapter.close?.()))
    registrationAdapter = undefined
  }

  return {
    runtime,
    listTools,
    callTool,
    registerMcpServer: registrationAdapter?.registerMcpServer ? registerMcpServer : undefined,
    addAdapter,
    removeAdapter,
    refreshServer,
    close,
  }
}
