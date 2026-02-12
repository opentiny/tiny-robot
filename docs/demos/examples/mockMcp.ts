import type { Tool } from '@opentiny/tiny-robot-kit'

/**
 * Keywords that trigger mock MCP tool calls when present in user message.
 */
export const MCP_TRIGGER_KEYWORDS = ['搜索', 'search', 'MCP', 'mcp', '工具', '查询']

/**
 * Check if user message contains any MCP trigger keyword.
 */
export function hasMcpTriggerKeyword(content: string): boolean {
  const text = (content || '').trim().toLowerCase()
  return MCP_TRIGGER_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()))
}

/**
 * Extract search query from user message (simple heuristic).
 */
export function extractSearchQuery(content: string): string {
  const text = content.trim()
  // Try to extract content after keywords like "搜索", "查询"
  const patterns = [/(?:搜索|查询)\s*[：:]\s*(.+)/, /(?:搜索|查询)\s+(.+)/, /search\s+(.+)/i, /(.+)/]
  for (const p of patterns) {
    const m = text.match(p)
    if (m?.[1]?.trim()) return m[1].trim()
  }
  return text.slice(0, 30) || '默认查询'
}

/**
 * MCP tool definitions (OpenAI format).
 */
export const MCP_TOOLS: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'mcp_search',
      description: 'MCP search tool. Search for information by query.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
        },
        required: ['query'],
      },
    },
  },
]

/**
 * Execute mock MCP tool. Simulates MCP server tool call.
 */
export async function callMcpTool(toolName: string, args: Record<string, unknown>): Promise<string> {
  if (toolName === 'mcp_search') {
    const query = (args.query as string) || 'unknown'
    // Simulate MCP search result
    await new Promise((r) => setTimeout(r, 300))
    return JSON.stringify(
      {
        source: 'mock-mcp-server',
        tool: 'mcp_search',
        query,
        results: [
          { title: `关于「${query}」的模拟结果 1`, snippet: '这是 MCP 模拟搜索返回的第一条结果。' },
          { title: `关于「${query}」的模拟结果 2`, snippet: '这是 MCP 模拟搜索返回的第二条结果。' },
        ],
      },
      null,
      2,
    )
  }
  return JSON.stringify({ error: `Unknown MCP tool: ${toolName}` })
}
