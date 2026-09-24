import type { McpExtensionInput, McpExtensionTransportType } from './index.type'

export interface NormalizedMcpExtensionInput {
  name: string
  description: string
  type: McpExtensionTransportType
  url: string
  headers: Record<string, string>
  thumbnail: string | null
}

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const normalizeHeaders = (headers: Record<string, unknown> | undefined) => {
  const normalized: Record<string, string> = {}

  Object.entries(headers ?? {}).forEach(([rawName, value]) => {
    const name = rawName.trim()
    if (!name) throw new Error('MCP header name must not be empty')
    if (Object.prototype.hasOwnProperty.call(normalized, name)) {
      throw new Error(`Duplicate MCP header name: ${name}`)
    }
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      throw new Error(`MCP header value for "${name}" must be a string, number, or boolean`)
    }

    Object.defineProperty(normalized, name, {
      configurable: true,
      enumerable: true,
      value: String(value),
      writable: true,
    })
  })

  return normalized
}

export const normalizeMcpExtensionInput = (input: McpExtensionInput): NormalizedMcpExtensionInput => {
  const name = input.name.trim()
  if (!name) throw new Error('MCP extension name must not be empty')
  if (input.type !== 'sse' && input.type !== 'streamableHttp') {
    throw new Error('MCP extension type must be sse or streamableHttp')
  }

  const description = input.description?.trim() ?? ''
  if (description.length > 1000) throw new Error('MCP extension description must not exceed 1000 characters')

  const url = input.url.trim()
  if (!isHttpUrl(url)) throw new Error('MCP extension URL must use HTTP or HTTPS')

  const thumbnail = input.thumbnail?.trim() || null
  if (thumbnail && !isHttpUrl(thumbnail)) throw new Error('MCP extension thumbnail must use HTTP or HTTPS')

  return {
    name,
    description,
    type: input.type,
    url,
    headers: normalizeHeaders(input.headers),
    thumbnail,
  }
}
