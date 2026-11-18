import http from 'node:http'
import { markdownReply } from './markdown-fixture.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { testProjectsRoot } from './projects.mjs'
const servers = []
const types = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
}
for (const [host, port] of [
  ['angular', 4548],
  ['react', 4549],
]) {
  const directory = path.join(testProjectsRoot, host, 'dist', host === 'angular' ? 'browser' : '')
  const server = http.createServer((req, res) => {
    if (new URL(req.url, 'http://localhost').pathname === '/modelcontextprotocol-mcp') {
      const proxy = http.request(
        'http://127.0.0.1:4550/mcp',
        { method: req.method, headers: req.headers },
        (upstream) => {
          res.writeHead(upstream.statusCode, upstream.headers)
          upstream.pipe(res)
        },
      )
      proxy.on('error', () => {
        res.writeHead(502)
        res.end('本地 MCP 服务不可用')
      })
      req.pipe(proxy)
      return
    }
    let relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    let file = path.resolve(directory, '.' + relative)
    if (!file.startsWith(directory + path.sep)) file = path.join(directory, 'index.html')
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) file = path.join(directory, 'index.html')
    if (!fs.existsSync(file)) {
      res.writeHead(503)
      res.end('应用尚未构建')
      return
    }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream')
    res.setHeader('Cache-Control', 'no-store')
    fs.createReadStream(file).pipe(res)
  })
  server.listen(port, '127.0.0.1')
  servers.push(server)
}
const requests = []
const api = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  )
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }
  if (req.url === '/health') {
    res.end('ok')
    return
  }
  if (req.url === '/requests') {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(requests))
    return
  }
  if (req.url === '/mcp' && req.method !== 'POST') {
    res.writeHead(405)
    res.end()
    return
  }
  let text = ''
  for await (const chunk of req) text += chunk
  const body = JSON.parse(text || '{}')
  const record = { body, authorization: req.headers.authorization, origin: req.headers.origin, aborted: false }
  requests.push(record)
  res.on('close', () => {
    record.aborted = !res.writableEnded
  })
  if (req.url === '/mcp') {
    if (body.id === undefined) {
      res.writeHead(202)
      res.end()
      return
    }
    const result =
      body.method === 'initialize'
        ? {
            protocolVersion: '2025-03-26',
            capabilities: { tools: {} },
            serverInfo: { name: 'local-test-mcp', version: '1.0' },
          }
        : body.method === 'tools/list'
          ? {
              tools: [
                {
                  name: 'lookup',
                  description: '查询本地测试资料',
                  inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
                },
              ],
            }
          : body.method === 'tools/call'
            ? { content: [{ type: 'text', text: '本地工具结果' }] }
            : {}
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ jsonrpc: '2.0', id: body.id, result }))
    return
  }
  const question = body.messages?.findLast((message) => message.role === 'user')?.content ?? ''
  if (question.includes('模拟失败')) {
    res.writeHead(503)
    res.end('本地接口暂不可用')
    return
  }
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
  if (question.includes('调用工具') && body.messages?.at(-1)?.role !== 'tool' && body.tools?.length) {
    const name = body.tools[0].function.name
    res.write(
      `data: ${JSON.stringify({ id: 'test-tool', object: 'chat.completion.chunk', created: 1, model: body.model, choices: [{ index: 0, delta: { tool_calls: [{ index: 0, id: 'lookup-1', type: 'function', function: { name, arguments: '{"query":"测试"}' } }] }, finish_reason: 'tool_calls' }] })}\n\n`,
    )
    res.end('data: [DONE]\n\n')
    return
  }
  const chunks = question.includes('慢速')
    ? Array.from({ length: 80 }, (_, index) => `片段${index} `)
    : question.includes('Markdown 排版')
      ? markdownReply.match(/[\s\S]{1,36}/g)
      : ['收到：', question, '。这是本地协议验证回复。']
  let index = 0
  const timer = setInterval(
    () => {
      if (res.destroyed) {
        clearInterval(timer)
        return
      }
      const content = chunks[index++]
      if (content !== undefined)
        res.write(
          `data: ${JSON.stringify({ id: 'test-response', object: 'chat.completion.chunk', created: 1, model: body.model, choices: [{ index: 0, delta: { content }, finish_reason: null }] })}\n\n`,
        )
      else {
        res.write('data: [DONE]\n\n')
        res.end()
        clearInterval(timer)
      }
    },
    question.includes('慢速') ? 100 : question.includes('Markdown 排版') ? 150 : 40,
  )
  res.on('close', () => clearInterval(timer))
})
api.listen(4550, '127.0.0.1')
servers.push(api)
function close() {
  for (const server of servers) server.close()
  setTimeout(() => process.exit(), 500).unref()
}
process.once('SIGTERM', close)
process.once('SIGINT', close)
