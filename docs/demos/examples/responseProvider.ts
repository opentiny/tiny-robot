import type { ChatCompletion, MessageRequestBody } from '@opentiny/tiny-robot-kit'
import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import { extractSearchQuery, hasMcpTriggerKeyword } from './mockMcp'

/**
 * Response provider for the assistant chat.
 * When user message contains MCP trigger keywords (搜索/search/MCP/工具/查询),
 * uses mock MCP tool flow; otherwise fetches from real API.
 */
export async function assistantResponseProvider(
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
): Promise<AsyncGenerator<ChatCompletion>> {
  const msgs = requestBody.messages || []
  const last = msgs[msgs.length - 1]

  // Use mock MCP flow when: (1) user message has keyword, or (2) last message is tool
  const useMockMcp =
    (last?.role === 'user' && hasMcpTriggerKeyword(String(last.content || ''))) || last?.role === 'tool'

  if (useMockMcp) {
    return mockMcpStream(requestBody, abortSignal)
  }

  const response = await fetch('/api/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...requestBody, stream: true }),
    signal: abortSignal,
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return sseStreamToGenerator(response, { signal: abortSignal })
}

/**
 * Mock stream: when user message contains MCP keyword, return tool_calls;
 * when last message is tool, return AI summary.
 */
async function* mockMcpStream(
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
): AsyncGenerator<ChatCompletion> {
  const msgs = requestBody.messages || []
  const last = msgs[msgs.length - 1]
  const id = 'mock-mcp-' + Date.now()

  if (last?.role === 'tool') {
    // Second round: return AI summary based on tool result
    const toolContent = typeof last.content === 'string' ? last.content : ''
    let query = '未知'
    try {
      const parsed = JSON.parse(toolContent)
      if (parsed?.query) query = parsed.query
    } catch {
      // ignore
    }
    const text = `根据 MCP 搜索结果（查询：「${query}」），为您总结如下：找到 2 条相关结果，均为模拟数据。如需真实搜索，请接入实际的 MCP 服务。`
    for (let i = 0; i < text.length && !abortSignal.aborted; i++) {
      await new Promise((r) => setTimeout(r, 40))
      const content = text[i]
      yield {
        id,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: 'mock-mcp',
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: undefined,
            delta: i === 0 ? { role: 'assistant', content } : { content },
            finish_reason: i === text.length - 1 ? 'stop' : null,
            logprobs: null,
          },
        ],
      }
    }
    return
  }

  // First round: user message contains keyword -> return tool_calls
  const userContent = typeof last?.content === 'string' ? last.content : ''
  const query = extractSearchQuery(userContent)
  await new Promise((r) => setTimeout(r, 300))
  yield {
    id,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'mock-mcp',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: undefined,
        delta: {
          role: 'assistant',
          tool_calls: [
            {
              index: 0,
              id: 'call_mcp_search_' + Date.now(),
              type: 'function',
              function: {
                name: 'mcp_search',
                arguments: JSON.stringify({ query }),
              },
            },
          ],
        },
        finish_reason: 'tool_calls',
        logprobs: null,
      },
    ],
  }
}
