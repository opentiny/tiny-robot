import type { McpExtensionRecord, McpExtensionToolPolicy } from './index.type'
import { normalizeMcpExtensionInput } from './normalize'

export interface McpExtensionStorageDocument {
  schemaVersion: 1
  extensions: McpExtensionRecord[]
}

const documentFields = ['schemaVersion', 'extensions'] as const
const recordFields = [
  'id',
  'name',
  'description',
  'type',
  'url',
  'headers',
  'thumbnail',
  'enabled',
  'toolPolicy',
  'createdAt',
  'updatedAt',
] as const
const toolPolicyFields = ['default', 'overrides'] as const
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const assertOnlyFields = (value: Record<string, unknown>, fields: readonly string[], subject: string) => {
  const unexpected = Object.keys(value).find((field) => !fields.includes(field))
  if (unexpected) throw new Error(`Unexpected MCP extension ${subject} field: ${unexpected}`)
}

const assertIsoTimestamp = (value: unknown, field: 'createdAt' | 'updatedAt') => {
  if (typeof value !== 'string') throw new Error(`MCP extension ${field} must be an ISO timestamp`)

  const parsed = new Date(value)
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error(`MCP extension ${field} must be an ISO timestamp`)
  }

  return value
}

const parseToolPolicy = (value: unknown): McpExtensionToolPolicy => {
  if (!isObject(value)) throw new Error('MCP extension tool policy must be an object')
  assertOnlyFields(value, toolPolicyFields, 'tool policy')
  if (value.default !== 'enabled' && value.default !== 'disabled') {
    throw new Error('MCP extension tool policy default must be enabled or disabled')
  }
  if (!isObject(value.overrides)) throw new Error('MCP extension tool overrides must be an object')

  const overrides: Record<string, boolean> = {}
  Object.entries(value.overrides).forEach(([toolName, enabled]) => {
    if (typeof enabled !== 'boolean') {
      throw new Error(`MCP extension tool override for "${toolName}" must be boolean`)
    }
    Object.defineProperty(overrides, toolName, {
      configurable: true,
      enumerable: true,
      value: enabled,
      writable: true,
    })
  })

  return { default: value.default, overrides }
}

const parseRecord = (value: unknown): McpExtensionRecord => {
  if (!isObject(value)) throw new Error('MCP extension record must be an object')
  assertOnlyFields(value, recordFields, 'record')

  if (typeof value.id !== 'string' || !uuidPattern.test(value.id)) {
    throw new Error('MCP extension id must be a UUID')
  }
  if (typeof value.name !== 'string') throw new Error('MCP extension name must be a string')
  if (typeof value.description !== 'string') throw new Error('MCP extension description must be a string')
  if (value.type !== 'sse' && value.type !== 'streamableHttp') {
    throw new Error('MCP extension type must be sse or streamableHttp')
  }
  if (typeof value.url !== 'string') throw new Error('MCP extension url must be a string')
  if (!isObject(value.headers)) throw new Error('MCP extension headers must be an object')
  if (value.thumbnail !== null && typeof value.thumbnail !== 'string') {
    throw new Error('MCP extension thumbnail must be a string or null')
  }

  Object.entries(value.headers).forEach(([headerName, headerValue]) => {
    if (typeof headerValue !== 'string') {
      throw new Error(`MCP extension headers value for "${headerName}" must be a string`)
    }
  })

  const normalized = normalizeMcpExtensionInput({
    name: value.name,
    description: value.description,
    type: value.type,
    url: value.url,
    headers: value.headers,
    thumbnail: value.thumbnail,
  })
  if (normalized.name !== value.name) throw new Error('MCP extension name must be canonical')
  if (normalized.description !== value.description) throw new Error('MCP extension description must be canonical')
  if (normalized.url !== value.url) throw new Error('MCP extension url must be canonical')
  if (normalized.thumbnail !== value.thumbnail) throw new Error('MCP extension thumbnail must be canonical')
  if (
    Object.keys(normalized.headers).length !== Object.keys(value.headers).length ||
    Object.entries(value.headers).some(([headerName, headerValue]) => normalized.headers[headerName] !== headerValue)
  ) {
    throw new Error('MCP extension headers must be canonical')
  }

  if (typeof value.enabled !== 'boolean') throw new Error('MCP extension enabled must be boolean')

  return {
    id: value.id,
    ...normalized,
    enabled: value.enabled,
    toolPolicy: parseToolPolicy(value.toolPolicy),
    createdAt: assertIsoTimestamp(value.createdAt, 'createdAt'),
    updatedAt: assertIsoTimestamp(value.updatedAt, 'updatedAt'),
  }
}

export const parseMcpExtensionStorageDocument = (raw: string | null): McpExtensionStorageDocument => {
  if (raw === null) return { schemaVersion: 1, extensions: [] }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    const wrapped = new Error('Invalid MCP extension storage JSON') as Error & { cause?: unknown }
    wrapped.cause = error
    throw wrapped
  }

  if (!isObject(parsed)) throw new Error('MCP extension storage document must be an object')
  assertOnlyFields(parsed, documentFields, 'document')
  if (parsed.schemaVersion !== 1) {
    throw new Error(`Unsupported MCP extension storage schema version: ${String(parsed.schemaVersion)}`)
  }
  if (!Array.isArray(parsed.extensions)) {
    throw new Error('MCP extension storage extensions must be an array')
  }

  const extensions = parsed.extensions.map(parseRecord)
  const ids = new Set<string>()
  const names = new Set<string>()
  extensions.forEach((extension) => {
    if (ids.has(extension.id)) throw new Error(`Duplicate MCP extension id: ${extension.id}`)
    if (names.has(extension.name)) throw new Error(`Duplicate MCP extension name: ${extension.name}`)
    ids.add(extension.id)
    names.add(extension.name)
  })

  return { schemaVersion: 1, extensions }
}

export const serializeMcpExtensionStorageDocument = (document: McpExtensionStorageDocument) => JSON.stringify(document)
