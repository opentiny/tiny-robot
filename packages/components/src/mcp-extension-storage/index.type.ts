import type { McpExtensionTool } from '../mcp-extension-detail/index.type'

export type McpExtensionTransportType = 'sse' | 'streamableHttp'

export interface McpExtensionInput {
  name: string
  description?: string
  type: McpExtensionTransportType
  url: string
  headers?: Record<string, unknown>
  thumbnail?: string | null
}

/** Source and source-local ID, rather than the display name, identify an MCP extension. */
export interface McpExtensionIdentity {
  source: string
  id: string
}

export interface McpExtensionDataInput extends McpExtensionIdentity, McpExtensionInput {
  version: number
  tools: McpExtensionTool[]
}

export interface McpExtensionData extends McpExtensionIdentity {
  version: number
  name: string
  description: string
  type: McpExtensionTransportType
  url: string
  headers: Record<string, string>
  thumbnail: string | null
  tools: McpExtensionTool[]
  createdAt: string
  updatedAt: string
}

export interface McpExtensionToolPolicy {
  default: 'enabled' | 'disabled'
  overrides: Record<string, boolean>
}

/** Tool settings are stable library fields; business holds caller-owned settings. */
export interface McpExtensionOptions<TBusiness = never> {
  toolPolicy: McpExtensionToolPolicy
  business?: TBusiness
}

/** An adapter can persist one complete storage document in IndexedDB or via an API. */
export interface McpExtensionStorageAdapter {
  read(key: string): Promise<string | null>
  write(key: string, value: string): Promise<void>
}

export interface McpExtensionStorageOptions<TBusiness = never> {
  namespace?: string
  storage?: Storage
  adapter?: McpExtensionStorageAdapter
  parseBusinessOptions?: (value: unknown) => TBusiness
}

export interface McpExtensionStorage<TBusiness = never> {
  listData(): Promise<McpExtensionData[]>
  getData(identity: McpExtensionIdentity): Promise<McpExtensionData | undefined>
  upsertData(input: McpExtensionDataInput): Promise<McpExtensionData>
  deleteData(identity: McpExtensionIdentity): Promise<void>
  getOptions(identity: McpExtensionIdentity): Promise<McpExtensionOptions<TBusiness> | undefined>
  setOptions(
    identity: McpExtensionIdentity,
    options: McpExtensionOptions<TBusiness>,
  ): Promise<McpExtensionOptions<TBusiness>>
  deleteOptions(identity: McpExtensionIdentity): Promise<void>
  setToolEnabled(
    identity: McpExtensionIdentity,
    toolId: string,
    enabled: boolean,
  ): Promise<McpExtensionOptions<TBusiness>>
  create(input: McpExtensionInput): Promise<McpExtensionData>
  createFromConfig(config: string): Promise<McpExtensionData>
  update(identity: McpExtensionIdentity, input: McpExtensionInput): Promise<McpExtensionData>
  updateFromConfig(identity: McpExtensionIdentity, config: string): Promise<McpExtensionData>
}
