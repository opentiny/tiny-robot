import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'

interface Message {
  role?: string
  content?: string | { type: string; text?: string }[]
}
interface CompletionRequest {
  model?: string
  messages: Message[]
}
interface LiveConfig {
  apiKey: string
  baseUrl: string
  model: string
}

const maxRequestBytes = 8 * 1024 * 1024

function error(response: ServerResponse, status: number, message: string) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify({ error: { message } }))
}

async function readRequest(request: IncomingMessage): Promise<CompletionRequest> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > maxRequestBytes) throw new RangeError('图片与消息总大小不能超过 8 MB。')
    chunks.push(Buffer.from(chunk))
  }
  const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  if (!body || !Array.isArray(body.messages)) throw new SyntaxError('JSON 中需要 messages 数组。')
  return body
}

async function mockReply(body: CompletionRequest, response: ServerResponse) {
  const last = [...body.messages].reverse().find((message) => message.role === 'user')
  const hasImage = Array.isArray(last?.content) && last.content.some((part) => part.type === 'image_url')
  const text = hasImage
    ? '已收到图片和问题。\n\n这是本地模拟回复，不分析图片内容。\n\n你可以切换会话、发送图片，并观察回复逐步出现。'
    : '这是本地模拟回复。\n\n1. **会话**：可以切换历史会话并继续提问。\n2. **附件**：可以上传、拖入或粘贴图片。\n3. **流式展示**：回复会逐步出现在消息区。'
  response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
  for (const token of text.match(/[\s\S]{1,5}/gu) ?? []) {
    if (response.destroyed) return
    response.write(
      `data: ${JSON.stringify({
        id: 'local-demo',
        object: 'chat.completion.chunk',
        created: 0,
        model: body.model ?? 'demo',
        choices: [{ index: 0, delta: { role: 'assistant', content: token }, finish_reason: null }],
      })}\n\n`,
    )
    await new Promise((resolve) => setTimeout(resolve, 40))
  }
  if (!response.destroyed) response.end('data: [DONE]\n\n')
}

function liveUrl(baseUrl: string) {
  const url = new URL(baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1')
  const officialHost =
    /^dashscope(?:-intl|-us)?\.aliyuncs\.com$/.test(url.hostname) ||
    url.hostname.endsWith('.maas.aliyuncs.com')
  if (
    url.protocol !== 'https:' ||
    !officialHost ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash
  ) {
    throw new Error('DASHSCOPE_BASE_URL 必须是百炼的 HTTPS 兼容接口地址。')
  }
  return url.href.replace(/\/$/, '') + '/chat/completions'
}

export function demoModel(config: LiveConfig): Plugin {
  const upstreamUrl = config.apiKey ? liveUrl(config.baseUrl) : ''
  const middleware: Connect.NextHandleFunction = (request, response, next) => {
    const path = request.url?.split('?')[0]
    const live = path === '/api/bailian/chat/completions'
    if (!live && path !== '/api/demo/chat/completions') return next()
    if (request.method !== 'POST') return error(response, 405, '请使用 POST 发送消息。')
    if (request.headers.origin && request.headers.origin !== `http://${request.headers.host}`) {
      return error(response, 403, '仅允许当前本地 Demo 页面调用。')
    }
    if (!request.headers['content-type']?.startsWith('application/json')) {
      return error(response, 415, '请使用 application/json。')
    }
    if (live && !config.apiKey) {
      request.resume()
      return error(response, 503, '请在 .env.local 中设置 DASHSCOPE_API_KEY，保存后重启本地服务。')
    }
    const abort = new AbortController()
    response.on('close', () => abort.abort())
    void (async () => {
      let body: CompletionRequest
      try {
        body = await readRequest(request)
      } catch (cause) {
        error(
          response,
          cause instanceof RangeError ? 413 : 400,
          cause instanceof RangeError ? cause.message : '请求需要有效的 JSON 和 messages 数组。',
        )
        return
      }
      if (!live) return mockReply(body, response)
      try {
        const upstream = await fetch(upstreamUrl, {
          method: 'POST',
          redirect: 'error',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
          body: JSON.stringify({ ...body, model: config.model || 'qwen3-vl-plus', stream: true }),
          signal: AbortSignal.any([abort.signal, AbortSignal.timeout(90_000)]),
        })
        if (!upstream.ok || !upstream.body) {
          await upstream.body?.cancel()
          return error(
            response,
            upstream.ok ? 502 : upstream.status,
            `百炼请求失败（HTTP ${upstream.status}），请检查密钥、模型和服务地址。`,
          )
        }
        response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
        await pipeline(Readable.from(upstream.body), response)
      } catch {
        if (!response.headersSent && !response.destroyed)
          error(response, 502, '无法完成百炼请求，请检查网络与服务配置。')
        else if (!response.destroyed) response.end()
      }
    })().catch(() => {
      if (!response.headersSent && !response.destroyed)
        error(response, 500, '本地 Demo 服务暂时无法处理这条消息。')
      else if (!response.destroyed) response.end()
    })
  }
  return {
    name: 'tinyrobot-demo-model',
    configureServer: (server) => {
      server.middlewares.use(middleware)
    },
    configurePreviewServer: (server) => {
      server.middlewares.use(middleware)
    },
  }
}
