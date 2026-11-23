export type MockHeaders = Record<string, string | string[] | undefined>

export interface MockRequest {
  method: string
  url: string
  body?: unknown
  headers?: MockHeaders
}

export interface MockHandlerContext {
  body: any
  headers: MockHeaders
  params: Record<string, string>
  query: URLSearchParams
}

export interface MockMethod {
  method?: string
  url: string
  response: (context: MockHandlerContext) => unknown | Promise<unknown>
}

export interface MockDispatchResult {
  body: unknown
  statusCode: number
  headers?: MockHeaders
}

class MockHttpResponse {
  constructor(
    readonly statusCode: number,
    readonly body: unknown,
    readonly headers?: MockHeaders,
  ) {}
}

export function mockHttpResponse(statusCode: number, body: unknown, headers?: MockHeaders) {
  return new MockHttpResponse(statusCode, body, headers)
}

function matchPath(pattern: string, pathname: string) {
  const names: string[] = []
  const segments = pattern.split('/').filter(Boolean)
  let source = '^'

  for (const segment of segments) {
    if (segment.startsWith(':')) {
      const optional = segment.endsWith('?')
      const name = segment.slice(1, optional ? -1 : undefined)
      names.push(name)
      source += optional ? '(?:/([^/]+))?' : '/([^/]+)'
    }
    else {
      source += `/${segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
    }
  }

  const match = pathname.match(new RegExp(`${source}/?$`))
  if (!match) {
    return null
  }

  return Object.fromEntries(
    names.map((name, index) => [name, decodeURIComponent(match[index + 1] ?? '')]),
  )
}

export async function dispatchMockRequest(
  mocks: MockMethod[],
  request: MockRequest,
): Promise<MockDispatchResult> {
  const url = new URL(request.url, 'http://mock.local')
  const method = request.method.toLowerCase()

  for (const mock of mocks) {
    if ((mock.method ?? 'get').toLowerCase() !== method) {
      continue
    }
    const params = matchPath(mock.url, url.pathname)
    if (!params) {
      continue
    }

    const body = await mock.response({
      body: request.body,
      headers: request.headers ?? {},
      params,
      query: url.searchParams,
    })
    if (body instanceof MockHttpResponse) {
      return { body: body.body, statusCode: body.statusCode, headers: body.headers }
    }
    return { body, statusCode: 200 }
  }

  return { body: { message: 'Mock route not found' }, statusCode: 404 }
}
