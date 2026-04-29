import { computed, ref } from 'vue'
import { Client } from '@modelcontextprotocol/sdk/client'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp'
import type { CallToolRequest } from '@modelcontextprotocol/sdk/types'
import { McpServers, type McpServerConfig, type McpServerKey } from '../mcpServers'

type McpTool = Awaited<ReturnType<Client['listTools']>>['tools'][number]
type McpToolCallResult = Awaited<ReturnType<Client['callTool']>>

function createMcpClient(serverKey: McpServerKey, server: McpServerConfig) {
  const client = new Client({
    name: serverKey,
    version: '0.1.0',
  })
  const requestInit = {
    headers: server.headers,
  }
  const transport =
    server.type === 'streamableHttp'
      ? new StreamableHTTPClientTransport(new URL(server.baseUrl), { requestInit })
      : new SSEClientTransport(new URL(server.baseUrl), { requestInit })
  return { client, transport }
}

function getServerByKey(serverKey: McpServerKey): McpServerConfig {
  const server = McpServers[serverKey]
  if (!server) {
    throw new Error(`Unknown MCP server key: ${serverKey}`)
  }
  return server
}

async function listMcpToolsFromServer(serverKey: McpServerKey): Promise<McpTool[]> {
  const server = getServerByKey(serverKey)
  const { client, transport } = createMcpClient(serverKey, server)
  try {
    await client.connect(transport)
    const response = await client.listTools()
    return response.tools
  } finally {
    await client.close().catch(() => undefined)
  }
}

async function callMcpToolFromServer(
  serverKey: McpServerKey,
  toolName: string,
  args: CallToolRequest['params']['arguments'] = {},
): Promise<McpToolCallResult> {
  const server = getServerByKey(serverKey)
  const { client, transport } = createMcpClient(serverKey, server)
  try {
    await client.connect(transport)
    return await client.callTool({
      name: toolName,
      arguments: args,
    })
  } finally {
    await client.close().catch(() => undefined)
  }
}

function createMcpStore() {
  // Added servers are selectable from McpServers and start empty by default.
  const addedMcpServers = ref<McpServerKey[]>([])
  const inUseMcpServers = ref<McpServerKey[]>([])

  const availableMcpServers = computed(() => Object.keys(McpServers).map((serverKey) => serverKey as McpServerKey))

  function addMcpServer(serverKey: McpServerKey) {
    if (!McpServers[serverKey]) {
      throw new Error(`Unknown MCP server key: ${serverKey}`)
    }
    if (!addedMcpServers.value.includes(serverKey)) {
      addedMcpServers.value = [...addedMcpServers.value, serverKey]
    }
    // First add should enable the server immediately.
    if (!inUseMcpServers.value.includes(serverKey)) {
      inUseMcpServers.value = [...inUseMcpServers.value, serverKey]
    }
  }

  function toggleMcpServer(serverKey: McpServerKey) {
    if (!addedMcpServers.value.includes(serverKey)) {
      throw new Error(`MCP server "${serverKey}" is not added.`)
    }
    if (inUseMcpServers.value.includes(serverKey)) {
      inUseMcpServers.value = inUseMcpServers.value.filter((item) => item !== serverKey)
      return
    }
    inUseMcpServers.value = [...inUseMcpServers.value, serverKey]
  }

  function removeMcpServer(serverKey: McpServerKey) {
    if (!addedMcpServers.value.includes(serverKey)) {
      return
    }
    addedMcpServers.value = addedMcpServers.value.filter((item) => item !== serverKey)
    inUseMcpServers.value = inUseMcpServers.value.filter((item) => item !== serverKey)
  }

  function assertServerInUse(serverKey: McpServerKey) {
    if (!inUseMcpServers.value.includes(serverKey)) {
      throw new Error(`MCP server "${serverKey}" is not in use.`)
    }
  }

  async function listTools(serverKey?: McpServerKey): Promise<McpTool[]> {
    if (serverKey) {
      return listMcpToolsFromServer(serverKey)
    }

    const resultEntries = await Promise.allSettled(
      inUseMcpServers.value.map(async (key) => await listMcpToolsFromServer(key)),
    )

    const allTools: McpTool[] = []
    resultEntries.forEach((item, index) => {
      const serverKey = inUseMcpServers.value[index]
      if (!serverKey) {
        return
      }
      if (item.status === 'fulfilled') {
        item.value.forEach((tool, toolIndex) => {
          const originalName = typeof tool.name === 'string' ? tool.name : `tool_${toolIndex + 1}`
          allTools.push({
            ...tool,
            name: `${serverKey}__${originalName}`,
          })
        })
        return
      }
      console.error(`[MCP] Failed to list tools from "${serverKey}":`, item.reason)
    })

    return allTools
  }

  async function callTool(
    serverKey: McpServerKey,
    toolName: string,
    args: Record<string, unknown> = {},
  ): Promise<McpToolCallResult> {
    assertServerInUse(serverKey)
    return callMcpToolFromServer(serverKey, toolName, args)
  }

  return {
    McpServers,
    availableMcpServers,
    addedMcpServers,
    addMcpServer,
    inUseMcpServers,
    toggleMcpServer,
    removeMcpServer,
    listTools,
    callTool,
  }
}

type McpStore = ReturnType<typeof createMcpStore>
let mcpStore: McpStore | null = null

export function useMcp() {
  if (!mcpStore) {
    mcpStore = createMcpStore()
  }
  return mcpStore
}
