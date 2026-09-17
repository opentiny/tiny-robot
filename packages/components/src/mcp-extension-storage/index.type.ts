export type McpExtensionTransportType = 'sse' | 'streamableHttp'

export interface McpExtensionInput {
  name: string
  description?: string
  type: McpExtensionTransportType
  url: string
  headers?: Record<string, unknown>
  thumbnail?: string | null
}

export interface McpExtensionToolPolicy {
  default: 'enabled' | 'disabled'
  overrides: Record<string, boolean>
}

export interface McpExtensionRecord {
  id: string
  name: string
  description: string
  type: McpExtensionTransportType
  url: string
  headers: Record<string, string>
  thumbnail: string | null
  enabled: boolean
  toolPolicy: McpExtensionToolPolicy
  createdAt: string
  updatedAt: string
}

export interface McpExtensionStorageOptions {
  namespace?: string
  storage?: Storage
}

export interface McpExtensionStorage {
  list(): Promise<McpExtensionRecord[]>
  get(id: string): Promise<McpExtensionRecord | undefined>
  create(input: McpExtensionInput): Promise<McpExtensionRecord>
  createFromConfig(config: string): Promise<McpExtensionRecord>
  update(id: string, input: McpExtensionInput): Promise<McpExtensionRecord>
  updateFromConfig(id: string, config: string): Promise<McpExtensionRecord>
  delete(id: string): Promise<void>
  setEnabled(id: string, enabled: boolean): Promise<McpExtensionRecord>
  setToolEnabled(id: string, toolName: string, enabled: boolean): Promise<McpExtensionRecord>
}
