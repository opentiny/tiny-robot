import type { MockMethod } from './dispatch'
import { Buffer } from 'node:buffer'
import { createServer } from 'node:http'
import { dispatchMockRequest } from './dispatch'

async function readBody(request: AsyncIterable<Buffer>) {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk))
  }
  if (!chunks.length) {
    return undefined
  }
  const content = Buffer.concat(chunks).toString('utf8')
  return content ? JSON.parse(content) : undefined
}

export function startMockServer(
  mocks: MockMethod[],
  { hostname = '127.0.0.1', port = 8848 } = {},
) {
  const server = createServer(async (request, response) => {
    try {
      const result = await dispatchMockRequest(mocks, {
        method: request.method ?? 'get',
        url: request.url ?? '/',
        body: await readBody(request),
        headers: request.headers,
      })
      const headers = result.headers ?? { 'content-type': 'application/json' }
      response.writeHead(result.statusCode, headers)
      // 文本类原始响应体（如 SSE）原样写出，其余按 JSON 序列化
      response.end(typeof result.body === 'string'
        ? result.body
        : JSON.stringify(result.body))
    }
    catch (error) {
      response.writeHead(500, { 'content-type': 'application/json' })
      response.end(JSON.stringify({
        message: error instanceof Error ? error.message : 'Mock server error',
      }))
    }
  })

  return new Promise<typeof server>((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, hostname, () => {
      server.off('error', reject)
      resolve(server)
    })
  })
}
