import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { MockMethod } from './dispatch'
import axios, { AxiosError } from 'axios'
import { dispatchMockRequest } from './dispatch'

export function resolveMockRequestUrl(url: string, mockServerHost = '/mock'): string {
  const parsed = new URL(url, 'http://mock.local')
  const prefix = mockServerHost.replace(/\/$/, '')
  let { pathname } = parsed
  if (prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    pathname = pathname.slice(prefix.length) || '/'
  }
  return `${pathname}${parsed.search}`
}

function parseData(data: unknown): unknown {
  if (typeof data !== 'string' || data === '') {
    return data
  }
  try {
    return JSON.parse(data)
  }
  catch {
    return data
  }
}

function toHeaders(headers: InternalAxiosRequestConfig['headers']): Record<string, string> {
  if (!headers) {
    return {}
  }
  const raw = typeof headers.toJSON === 'function' ? headers.toJSON() : { ...headers }
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([, value]) => value != null)
      .map(([key, value]) => [key.toLowerCase(), String(value)]),
  )
}

export function createMockAxiosAdapter(
  mocks: MockMethod[],
  { mockServerHost = '/mock' }: { mockServerHost?: string } = {},
): AxiosAdapter {
  return async (config) => {
    const url = resolveMockRequestUrl(axios.getUri(config), mockServerHost)
    const result = await dispatchMockRequest(mocks, {
      method: config.method ?? 'get',
      url,
      body: parseData(config.data),
      headers: toHeaders(config.headers),
    })

    const response: AxiosResponse = {
      data: result.body,
      status: result.statusCode,
      statusText: result.statusCode === 200 ? 'OK' : 'Error',
      headers: { 'content-type': 'application/json' },
      config,
      request: { responseURL: config.url ?? axios.getUri(config) },
    }
    const validateStatus = config.validateStatus ?? (status => status >= 200 && status < 300)
    if (validateStatus(result.statusCode)) {
      return response
    }
    throw new AxiosError(
      `Request failed with status code ${result.statusCode}`,
      result.statusCode >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      response.request,
      response,
    )
  }
}
