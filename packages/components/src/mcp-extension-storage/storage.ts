import { parseMcpExtensionConfig } from './config'
import {
  identityKey,
  parseData,
  parseIdentity,
  parseMcpExtensionStorageDocument,
  parseOptions,
  serializeMcpExtensionStorageDocument,
} from './document'
import type {
  McpExtensionData,
  McpExtensionDataInput,
  McpExtensionIdentity,
  McpExtensionInput,
  McpExtensionOptions,
  McpExtensionStorage,
  McpExtensionStorageAdapter,
  McpExtensionStorageOptions,
} from './index.type'
import { normalizeMcpExtensionInput } from './normalize'

const getStorage = (storage: Storage | undefined) => {
  if (storage) return storage
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  } catch (cause) {
    throw Object.assign(new Error('MCP storage cannot access localStorage'), { cause })
  }
  throw new Error('MCP storage requires Web Storage or an adapter')
}

const storageKey = (namespace?: string) =>
  namespace?.trim() ? `tiny-robot:${namespace.trim()}:mcp-extensions` : 'tiny-robot:mcp-extensions'
const nextTimestamp = (previous?: string) => {
  const current = new Date().toISOString()
  return current === previous ? new Date(Date.parse(current) + 1).toISOString() : current
}
const mutationQueues = new WeakMap<object, Map<string, Promise<unknown>>>()

const getMutationQueues = (owner: object) => {
  const existing = mutationQueues.get(owner)
  if (existing) return existing
  const queues = new Map<string, Promise<unknown>>()
  mutationQueues.set(owner, queues)
  return queues
}
const createId = () => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** One versioned document stores definitions and settings separately. Headers are plaintext JSON. */
export const createMcpExtensionStorage = <TBusiness = never>(
  options: McpExtensionStorageOptions<TBusiness> = {},
): McpExtensionStorage<TBusiness> => {
  if (options.storage && options.adapter) throw new Error('Choose either MCP storage or adapter')
  const key = storageKey(options.namespace)
  const storage = options.adapter ? undefined : getStorage(options.storage)
  const adapter: McpExtensionStorageAdapter = options.adapter ?? {
    read: async (key) => storage!.getItem(key),
    write: async (key, value) => storage!.setItem(key, value),
  }
  const queues = getMutationQueues(options.adapter ?? storage!)
  const read = async () => parseMcpExtensionStorageDocument(await adapter.read(key), options.parseBusinessOptions)
  const mutate = <T>(operation: (document: Awaited<ReturnType<typeof read>>) => T): Promise<T> => {
    const result = (queues.get(key) ?? Promise.resolve()).then(async () => {
      const document = await read()
      const value = operation(document)
      await adapter.write(key, serializeMcpExtensionStorageDocument(document))
      return value
    })
    const queue = result.catch(() => undefined)
    queues.set(key, queue)
    void queue.then(() => {
      if (queues.get(key) === queue) queues.delete(key)
    })
    return result
  }
  const equal = (left: McpExtensionIdentity, right: McpExtensionIdentity) => identityKey(left) === identityKey(right)
  const normalizeData = (input: McpExtensionDataInput, previous?: McpExtensionData): McpExtensionData => {
    const identity = parseIdentity(input)
    const connection = normalizeMcpExtensionInput(input)
    const timestamp = nextTimestamp(previous?.updatedAt)
    return parseData({
      ...identity,
      version: input.version,
      ...connection,
      tools: input.tools,
      createdAt: previous?.createdAt ?? timestamp,
      updatedAt: timestamp,
    })
  }
  const defaultOptions = (): McpExtensionOptions<TBusiness> => ({ toolPolicy: { default: 'enabled', overrides: {} } })
  const upsertData = (input: McpExtensionDataInput) =>
    mutate((document) => {
      const index = document.data.findIndex((entry) => equal(entry, input))
      const previous = document.data[index]
      if (previous && previous.version > input.version) return previous
      const next = normalizeData(input, previous)
      if (previous && previous.version === input.version) {
        const { createdAt: _a, updatedAt: _b, ...oldDefinition } = previous
        const { createdAt: _c, updatedAt: _d, ...newDefinition } = next
        if (JSON.stringify(oldDefinition) !== JSON.stringify(newDefinition))
          throw new Error(`MCP definition version conflict: ${identityKey(input)}`)
        return previous
      }
      if (index === -1) document.data.push(next)
      else document.data[index] = next
      return next
    })
  const create = (input: McpExtensionInput) =>
    upsertData({ ...input, source: 'manual', id: createId(), version: 1, tools: [] })
  const update = (identity: McpExtensionIdentity, input: McpExtensionInput) =>
    mutate((document) => {
      const index = document.data.findIndex((entry) => equal(entry, identity))
      if (index === -1) throw new Error(`MCP extension not found: ${identityKey(identity)}`)
      const previous = document.data[index]
      const next = normalizeData(
        {
          ...input,
          source: previous.source,
          id: previous.id,
          version: previous.version + 1,
          tools: previous.tools,
        },
        previous,
      )
      document.data[index] = next
      return next
    })
  return {
    async listData() {
      return (await read()).data
    },
    async getData(identity) {
      return (await read()).data.find((entry) => equal(entry, identity))
    },
    upsertData,
    deleteData(identity) {
      return mutate((document) => {
        const index = document.data.findIndex((entry) => equal(entry, identity))
        if (index === -1) throw new Error(`MCP extension not found: ${identityKey(identity)}`)
        document.data.splice(index, 1)
      })
    },
    async getOptions(identity) {
      return (await read()).options.find((entry) => equal(entry, identity))?.value
    },
    setOptions(identity, value) {
      return mutate((document) => {
        const normalizedIdentity = parseIdentity(identity)
        const parsed = parseOptions(JSON.parse(JSON.stringify(value)), options.parseBusinessOptions)
        const index = document.options.findIndex((entry) => equal(entry, identity))
        const entry = { ...normalizedIdentity, value: parsed }
        if (index === -1) document.options.push(entry)
        else document.options[index] = entry
        return parsed
      })
    },
    deleteOptions(identity) {
      return mutate((document) => {
        const index = document.options.findIndex((entry) => equal(entry, identity))
        if (index !== -1) document.options.splice(index, 1)
      })
    },
    setToolEnabled(identity, toolId, enabled) {
      return mutate((document) => {
        if (typeof enabled !== 'boolean' || !toolId.trim())
          throw new Error('MCP tool enabled must be boolean and tool ID non-empty')
        const normalizedIdentity = parseIdentity(identity)
        const index = document.options.findIndex((entry) => equal(entry, identity))
        const previous = index === -1 ? defaultOptions() : document.options[index].value
        const overrides = { ...previous.toolPolicy.overrides }
        if (enabled === (previous.toolPolicy.default === 'enabled')) delete overrides[toolId]
        else
          Object.defineProperty(overrides, toolId, {
            value: enabled,
            writable: true,
            enumerable: true,
            configurable: true,
          })
        const value = { ...previous, toolPolicy: { ...previous.toolPolicy, overrides } }
        const entry = { ...normalizedIdentity, value }
        if (index === -1) document.options.push(entry)
        else document.options[index] = entry
        return value
      })
    },
    create,
    createFromConfig(config) {
      return create(parseMcpExtensionConfig(config))
    },
    update,
    updateFromConfig(identity, config) {
      return update(identity, parseMcpExtensionConfig(config))
    },
  }
}
