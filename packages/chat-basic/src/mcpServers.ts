export type McpServerConfig = {
  type: 'sse' | 'streamableHttp'
  name: string
  description?: string
  baseUrl: string
  headers?: Record<string, string>
  logoUrl?: string
}

export const McpServers = {
  'model-context-protocol-mcp': {
    type: 'streamableHttp',
    name: 'Model Context Protocol MCP',
    description: 'MCP Server',
    baseUrl: window.location.origin + '/modelcontextprotocol-mcp',
    logoUrl: 'https://modelcontextprotocol.io/favicon.ico',
  },
} satisfies Record<string, McpServerConfig>

export type McpServerKey = keyof typeof McpServers
