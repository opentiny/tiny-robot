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

/** One versioned document stores definitions and settings separately. Headers are plaintext JSON. */
export const createMcpExtensionStorage = <TBusiness = never>(
  options: McpExtensionStorageOptions<TBusiness> = {},
): McpExtensionStorage<TBusiness> => {
  if (options.storage && options.adapter) throw new Error('Choose either MCP storage or adapter')
  const key = storageKey(options.namespace)
  const adapter: McpExtensionStorageAdapter =
    options.adapter ??
    (() => {
      const storage = getStorage(options.storage)
      return { read: async (key) => storage.getItem(key), write: async (key, value) => storage.setItem(key, value) }
    })()
  const read = async () => parseMcpExtensionStorageDocument(await adapter.read(key), options.parseBusinessOptions)
  let queue: Promise<unknown> = Promise.resolve()
  const mutate = <T>(operation: (document: Awaited<ReturnType<typeof read>>) => T): Promise<T> => {
    const result = queue.then(async () => {
      const document = await read()
      const value = operation(document)
      await adapter.write(key, serializeMcpExtensionStorageDocument(document))
      return value
    })
    queue = result.catch(() => undefined)
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
  const update = (
    identity: McpExtensionIdentity,
    input: McpExtensionDataInput | Parameters<typeof normalizeMcpExtensionInput>[0],
  ) =>
    mutate((document) => {
      const index = document.data.findIndex((entry) => equal(entry, identity))
      if (index === -1) throw new Error(`MCP extension not found: ${identityKey(identity)}`)
      const previous = document.data[index]
      const next = normalizeData(
        { ...previous, ...input, source: previous.source, id: previous.id, version: previous.version + 1 },
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
    create(input) {
      return upsertData({ ...input, source: 'manual', id: crypto.randomUUID(), version: 1, tools: [] })
    },
    createFromConfig(config) {
      return this.create(parseMcpExtensionConfig(config))
    },
    update,
    updateFromConfig(identity, config) {
      return update(identity, parseMcpExtensionConfig(config))
    },
  }
}
