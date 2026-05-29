import type { ChatMcpServerConfig } from './index.type'

export const CHAT_BUILTIN_MCP_SERVERS: Record<string, ChatMcpServerConfig> = {
  'model-context-protocol-mcp': {
    type: 'streamableHttp',
    name: 'Model Context Protocol MCP',
    description: '本地示例 MCP 服务，用于体验标准 MCP 工具调用链路。',
    url: '/modelcontextprotocol-mcp',
    icon: 'https://modelcontextprotocol.io/favicon.ico',
    category: '本地',
  },
}

export const CHAT_BUILTIN_MARKET_MCP_SERVER_IDS = Object.keys(CHAT_BUILTIN_MCP_SERVERS)
