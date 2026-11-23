export interface WebMcpToolDescriptor {
  name: string
  description?: string
  inputSchema?: unknown
}

export interface WebMcpContext {
  listTools?: () => Promise<readonly WebMcpToolDescriptor[]>
  getTools?: () => Promise<readonly WebMcpToolDescriptor[]>
  executeTool?: (tool: WebMcpToolDescriptor, input: Record<string, unknown> | string) => Promise<unknown>
  addEventListener?: (type: 'toolchange', listener: () => void) => void
  removeEventListener?: (type: 'toolchange', listener: () => void) => void
}

export interface WebMcpToolSource {
  listTools: () => Promise<readonly WebMcpToolDescriptor[]>
  callTool: (name: string, args?: Record<string, unknown>) => Promise<unknown>
  subscribe?: (listener: () => void) => () => void
}

export interface CreateWebMcpToolSourceOptions {
  getContext?: () => WebMcpContext | undefined
}

export interface WebMcpServerOptions {
  id?: string
  name?: string
  description?: string
  icon?: string
  installed?: boolean
  enabled?: boolean
  metadata?: Readonly<Record<string, unknown>>
}

export interface CreateWebMcpAdapterOptions {
  server?: WebMcpServerOptions
  source?: WebMcpToolSource
  getContext?: () => WebMcpContext | undefined
}
