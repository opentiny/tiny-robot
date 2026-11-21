export type ChatMcpTransportType = 'sse' | 'streamableHttp'

export interface ChatMcpServerConfig {
  id: string
  name: string
  baseUrl: string
  type?: ChatMcpTransportType
  installed?: boolean
  description?: string
  icon?: string
  headers?: Record<string, string>
  timeout?: number
  validate?: (serverId: string) => void
}

export type ChatMcpServers = readonly ChatMcpServerConfig[]
