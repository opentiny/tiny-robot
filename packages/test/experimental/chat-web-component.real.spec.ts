import { expect, test } from '@playwright/test'

test('real streaming endpoint smoke', async ({ request }) => {
  const apiUrl = process.env.TR_CHAT_REAL_API_URL
  const model = process.env.TR_CHAT_REAL_MODEL_ID
  const apiKey = process.env.TR_CHAT_REAL_API_KEY
  test.skip(!apiUrl || !model || !apiKey, 'not-run: TR_CHAT_REAL_API_URL, MODEL_ID, or API_KEY is unavailable')

  const response = await request.post(apiUrl!, {
    headers: { Authorization: `Bearer ${apiKey}` },
    data: {
      model,
      stream: true,
      messages: [{ role: 'user', content: 'Reply with: web component smoke' }],
    },
  })

  expect(response.ok()).toBe(true)
  expect((await response.body()).byteLength).toBeGreaterThan(0)
})

test('real MCP initialize and tools/list smoke', async ({ request }) => {
  const mcpUrl = process.env.TR_CHAT_REAL_MCP_URL
  test.skip(!mcpUrl, 'not-run: TR_CHAT_REAL_MCP_URL is unavailable')
  const authorization = process.env.TR_CHAT_REAL_MCP_AUTHORIZATION
  const headers = {
    Accept: 'application/json, text/event-stream',
    'Content-Type': 'application/json',
    ...(authorization ? { Authorization: authorization } : {}),
  }
  const initialize = await request.post(mcpUrl!, {
    headers,
    data: {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'tr-chat-smoke', version: '1' } },
    },
  })
  expect(initialize.ok()).toBe(true)
  const sessionId = initialize.headers()['mcp-session-id']
  const tools = await request.post(mcpUrl!, {
    headers: { ...headers, ...(sessionId ? { 'mcp-session-id': sessionId } : {}) },
    data: { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
  })
  expect(tools.ok()).toBe(true)
  expect((await tools.text()).length).toBeGreaterThan(0)
})
