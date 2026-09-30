import type { McpExtensionData, McpExtensionIdentity, McpExtensionOptions, McpExtensionToolPolicy } from './index.type'
import { normalizeMcpExtensionInput } from './normalize'

export interface McpExtensionStorageDocument<TBusiness = never> {
  schemaVersion: 1
  data: McpExtensionData[]
  options: Array<McpExtensionIdentity & { value: McpExtensionOptions<TBusiness> }>
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const assertFields = (value: Record<string, unknown>, allowed: string[], label: string) => {
  const unexpected = Object.keys(value).find((key) => !allowed.includes(key))
  if (unexpected) throw new Error(`Unexpected MCP ${label} field: ${unexpected}`)
}

export const identityKey = ({ source, id }: McpExtensionIdentity) => JSON.stringify([source, id])

export const parseIdentity = (value: unknown): McpExtensionIdentity => {
  if (
    !isObject(value) ||
    typeof value.source !== 'string' ||
    !value.source.trim() ||
    value.source !== value.source.trim()
  ) {
    throw new Error('MCP source must be a non-empty canonical string')
  }
  if (typeof value.id !== 'string' || !value.id.trim() || value.id !== value.id.trim()) {
    throw new Error('MCP id must be a non-empty canonical string')
  }
  return { source: value.source, id: value.id }
}

export const parseToolPolicy = (value: unknown): McpExtensionToolPolicy => {
  if (!isObject(value)) throw new Error('MCP tool policy must be an object')
  assertFields(value, ['default', 'overrides'], 'tool policy')
  if (value.default !== 'enabled' && value.default !== 'disabled') throw new Error('MCP tool policy default is invalid')
  if (!isObject(value.overrides)) throw new Error('MCP tool overrides must be an object')
  const overrides: Record<string, boolean> = {}
  for (const [id, enabled] of Object.entries(value.overrides)) {
    if (!id.trim() || typeof enabled !== 'boolean') throw new Error(`Invalid MCP tool override: ${id}`)
    Object.defineProperty(overrides, id, { value: enabled, writable: true, enumerable: true, configurable: true })
  }
  return { default: value.default, overrides }
}

const parseTools = (value: unknown): McpExtensionData['tools'] => {
  if (!Array.isArray(value)) throw new Error('MCP tools must be an array')
  const ids = new Set<string>()
  return value.map((tool: unknown) => {
    if (!isObject(tool)) throw new Error('MCP tool must be an object')
    assertFields(tool, ['id', 'name', 'description', 'enabled', 'disabled'], 'tool')
    if (typeof tool.id !== 'string' || !tool.id.trim() || ids.has(tool.id))
      throw new Error('MCP tool id is invalid or duplicated')
    if (typeof tool.name !== 'string' || !tool.name.trim()) throw new Error('MCP tool name is invalid')
    if (typeof tool.enabled !== 'boolean') throw new Error('MCP tool enabled must be boolean')
    if (tool.description !== undefined && typeof tool.description !== 'string')
      throw new Error('MCP tool description must be a string')
    if (tool.disabled !== undefined && typeof tool.disabled !== 'boolean')
      throw new Error('MCP tool disabled must be boolean')
    ids.add(tool.id)
    return {
      id: tool.id,
      name: tool.name,
      ...(tool.description === undefined ? {} : { description: tool.description }),
      enabled: tool.enabled,
      ...(tool.disabled === undefined ? {} : { disabled: tool.disabled }),
    }
  })
}

const parseTimestamp = (value: unknown) => {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new Error('MCP timestamp must be ISO format')
  }
  return value
}

export const parseData = (value: unknown): McpExtensionData => {
  if (!isObject(value)) throw new Error('MCP data must be an object')
  assertFields(
    value,
    [
      'source',
      'id',
      'version',
      'name',
      'description',
      'type',
      'url',
      'headers',
      'thumbnail',
      'tools',
      'createdAt',
      'updatedAt',
    ],
    'data',
  )
  const identity = parseIdentity(value)
  if (!Number.isSafeInteger(value.version) || (value.version as number) < 0)
    throw new Error('MCP version must be a non-negative integer')
  if (
    typeof value.name !== 'string' ||
    typeof value.description !== 'string' ||
    (value.type !== 'sse' && value.type !== 'streamableHttp') ||
    typeof value.url !== 'string' ||
    !isObject(value.headers) ||
    (value.thumbnail !== null && typeof value.thumbnail !== 'string')
  ) {
    throw new Error('MCP connection data is invalid')
  }
  const normalized = normalizeMcpExtensionInput({
    name: value.name,
    description: value.description,
    type: value.type,
    url: value.url,
    headers: value.headers,
    thumbnail: value.thumbnail,
  })
  if (
    normalized.name !== value.name ||
    normalized.description !== value.description ||
    normalized.url !== value.url ||
    normalized.thumbnail !== value.thumbnail ||
    JSON.stringify(normalized.headers) !== JSON.stringify(value.headers)
  ) {
    throw new Error('MCP connection data must be canonical')
  }
  return {
    ...identity,
    version: value.version as number,
    ...normalized,
    tools: parseTools(value.tools),
    createdAt: parseTimestamp(value.createdAt),
    updatedAt: parseTimestamp(value.updatedAt),
  }
}

export const parseOptions = <TBusiness>(
  value: unknown,
  parseBusinessOptions?: (value: unknown) => TBusiness,
): McpExtensionOptions<TBusiness> => {
  if (!isObject(value)) throw new Error('MCP options must be an object')
  assertFields(value, ['toolPolicy', 'business'], 'options')
  const toolPolicy = parseToolPolicy(value.toolPolicy)
  if (!Object.prototype.hasOwnProperty.call(value, 'business')) return { toolPolicy }
  if (!parseBusinessOptions) throw new Error('MCP business options require parseBusinessOptions')
  return { toolPolicy, business: parseBusinessOptions(value.business) }
}

export const parseMcpExtensionStorageDocument = <TBusiness>(
  raw: string | null,
  parseBusinessOptions?: (value: unknown) => TBusiness,
): McpExtensionStorageDocument<TBusiness> => {
  if (raw === null) return { schemaVersion: 1, data: [], options: [] }
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    throw new Error('Invalid MCP extension storage JSON')
  }
  if (!isObject(value)) throw new Error('MCP storage document must be an object')
  assertFields(value, ['schemaVersion', 'data', 'options'], 'document')
  if (value.schemaVersion !== 1)
    throw new Error(`Unsupported MCP storage schema version: ${String(value.schemaVersion)}`)
  if (!Array.isArray(value.data) || !Array.isArray(value.options))
    throw new Error('MCP data and options must be arrays')
  const data = value.data.map(parseData)
  const options = value.options.map((entry: unknown) => {
    if (!isObject(entry)) throw new Error('MCP options entry must be an object')
    assertFields(entry, ['source', 'id', 'value'], 'options entry')
    return { ...parseIdentity(entry), value: parseOptions(entry.value, parseBusinessOptions) }
  })
  for (const entries of [data, options]) {
    const keys = new Set<string>()
    for (const entry of entries) {
      const key = identityKey(entry)
      if (keys.has(key)) throw new Error(`Duplicate MCP identity: ${key}`)
      keys.add(key)
    }
  }
  return { schemaVersion: 1, data, options }
}

export const serializeMcpExtensionStorageDocument = <TBusiness>(document: McpExtensionStorageDocument<TBusiness>) =>
  JSON.stringify(document)
