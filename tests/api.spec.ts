import { test, expect } from '@playwright/test'

test('local transport returns an OpenAI-compatible stream without a model service', async ({ request }) => {
  const response = await request.post('/api/demo/chat/completions', {
    data: { model: 'demo', messages: [{ role: 'user', content: '整理本周进展' }] },
  })
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('text/event-stream')
  const body = await response.text()
  const chunks = body
    .split('\n')
    .filter((line) => line.startsWith('data: {'))
    .map((line) => JSON.parse(line.slice(6)))
  expect(chunks.map((chunk) => chunk.choices[0].delta.content).join('')).toContain('这是本地模拟回复')
  expect(body).toContain('data: [DONE]')
})

test('invalid JSON receives an actionable response and later requests still work', async ({ request }) => {
  const invalid = await request.post('/api/demo/chat/completions', {
    headers: { 'content-type': 'application/json' },
    data: '{bad-json',
  })
  expect(invalid.status()).toBe(400)
  expect((await invalid.json()).error.message).toContain('JSON')
  const next = await request.post('/api/demo/chat/completions', {
    data: { messages: [{ role: 'user', content: '再次提问' }] },
  })
  expect(next.status()).toBe(200)
})

test('live mode reports missing server credentials without making an upstream call', async ({ request }) => {
  const response = await request.post('/api/bailian/chat/completions', {
    data: { messages: [{ role: 'user', content: '你好' }] },
  })
  expect(response.status()).toBe(503)
  expect((await response.json()).error.message).toContain('DASHSCOPE_API_KEY')
})

test('model endpoints reject a browser origin outside this local demo', async ({ request }) => {
  const response = await request.post('/api/demo/chat/completions', {
    headers: { origin: 'https://unrelated.example' },
    data: { messages: [] },
  })
  expect(response.status()).toBe(403)
})
