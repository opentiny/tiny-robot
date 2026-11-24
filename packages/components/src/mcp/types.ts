/** Read-only reactive value used by MCP adapters and runtimes. */
export interface McpReadable<T> {
  readonly value: T
}

/** Public configuration contract for registering a URL-based MCP server. */
export interface McpServerRegistrationConfig {
  name: string
  description?: string
  type: 'sse' | 'streamableHttp'
  url: string
  headers?: Record<string, string>
  thumbnail?: string | null
}

export interface McpServerInfo {
  id: string
  name: string
  description?: string
  icon?: string
  category?: string
  installed: boolean
  enabled: boolean
  loading?: boolean
  error?: unknown
  metadata?: Readonly<Record<string, unknown>>
}

export interface McpToolInfo {
  id: string
  name: string
  description?: string
  enabled: boolean
}

export type McpToolState = Readonly<Partial<Record<string, readonly McpToolInfo[]>>>

export interface McpRuntime {
  servers: McpReadable<readonly McpServerInfo[]>
  tools: McpReadable<McpToolState>
  /** Canonical registration hook for dynamically adding a URL-based MCP server. */
  registerMcpServer?: (config: McpServerRegistrationConfig) => Promise<string>
  addServer: (id: string) => Promise<void> | void
  removeServer: (id: string) => Promise<void> | void
  setServerEnabled: (id: string, enabled: boolean) => Promise<void> | void
  setToolEnabled: (serverId: string, toolId: string, enabled: boolean) => Promise<void> | void
}

export interface McpToolDefinition {
  serverId: string
  id: string
  name: string
  originalName: string
  description?: string
  inputSchema?: Record<string, unknown>
}

export type McpToolListTools = (
  serverIds: readonly string[],
  toolIds: Readonly<Record<string, readonly string[]>>,
) => Promise<readonly McpToolDefinition[]>

export type McpToolCallTool = (serverId: string, toolName: string, args: Record<string, unknown>) => Promise<unknown>

export interface McpAdapter {
  runtime: McpRuntime
  listTools: McpToolListTools
  callTool: McpToolCallTool
  /** @deprecated Use `runtime.registerMcpServer` instead. Retained for compatibility. */
  registerMcpServer?: (config: McpServerRegistrationConfig) => Promise<string>
  refreshServer?: (serverId: string) => Promise<void> | void
  refresh?: () => Promise<void> | void
  close?: () => Promise<void> | void
}

export interface CreateCompositeMcpAdapterOptions {
  adapters?: readonly McpAdapter[]
  registrationAdapter?: McpAdapter
}

export interface CompositeMcpAdapter extends McpAdapter {
  addAdapter: (adapter: McpAdapter) => Promise<void>
  removeAdapter: (adapter: McpAdapter) => Promise<void>
  refreshServer: (id: string) => Promise<void>
  refreshServers: (ids: readonly string[]) => Promise<void>
}
