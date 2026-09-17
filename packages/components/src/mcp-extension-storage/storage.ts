import { parseMcpExtensionConfig } from './config'
import {
  parseMcpExtensionStorageDocument,
  serializeMcpExtensionStorageDocument,
  type McpExtensionStorageDocument,
} from './document'
import type {
  McpExtensionInput,
  McpExtensionRecord,
  McpExtensionStorage,
  McpExtensionStorageOptions,
} from './index.type'
import { normalizeMcpExtensionInput } from './normalize'

const getStorage = (storage: Storage | undefined) => {
  if (storage) return storage

  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  } catch (error) {
    const wrapped = new Error('MCP extension storage cannot access window.localStorage') as Error & {
      cause?: unknown
    }
    wrapped.cause = error
    throw wrapped
  }

  throw new Error('MCP extension storage requires a Web Storage implementation')
}

const getStorageKey = (namespace: string | undefined) => {
  const normalizedNamespace = namespace?.trim()
  return normalizedNamespace ? `tiny-robot:${normalizedNamespace}:mcp-extensions` : 'tiny-robot:mcp-extensions'
}

const withCause = (message: string, cause: unknown) => {
  const error = new Error(message) as Error & { cause?: unknown }
  error.cause = cause
  return error
}

const nextTimestamp = (previous?: string) => {
  const timestamp = new Date().toISOString()
  return timestamp === previous ? new Date(Date.parse(timestamp) + 1).toISOString() : timestamp
}

/**
 * Creates MCP extension persistence backed by Web Storage.
 *
 * Header values are stored as plaintext JSON in the selected Storage. Do not
 * use this persistence boundary when plaintext credentials are unacceptable.
 */
export const createMcpExtensionStorage = (options: McpExtensionStorageOptions = {}): McpExtensionStorage => {
  const storage = getStorage(options.storage)
  const storageKey = getStorageKey(options.namespace)

  const readDocument = () => {
    let raw: string | null
    try {
      raw = storage.getItem(storageKey)
    } catch (error) {
      throw withCause(`Failed to read MCP extensions from "${storageKey}"`, error)
    }
    return parseMcpExtensionStorageDocument(raw)
  }

  const writeDocument = (document: McpExtensionStorageDocument) => {
    try {
      storage.setItem(storageKey, serializeMcpExtensionStorageDocument(document))
    } catch (error) {
      throw withCause(`Failed to write MCP extensions to "${storageKey}"`, error)
    }
  }

  const create = async (input: McpExtensionInput) => {
    const document = readDocument()
    const normalized = normalizeMcpExtensionInput(input)
    if (document.extensions.some((extension) => extension.name === normalized.name)) {
      throw new Error(`MCP extension name already exists: ${normalized.name}`)
    }

    const timestamp = new Date().toISOString()
    const record: McpExtensionRecord = {
      id: crypto.randomUUID(),
      ...normalized,
      enabled: true,
      toolPolicy: { default: 'enabled', overrides: {} },
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    document.extensions.push(record)
    writeDocument(document)
    return record
  }

  const update = async (id: string, input: McpExtensionInput) => {
    const document = readDocument()
    const index = document.extensions.findIndex((extension) => extension.id === id)
    if (index === -1) throw new Error(`MCP extension not found: ${id}`)

    const normalized = normalizeMcpExtensionInput(input)
    if (document.extensions.some((extension) => extension.id !== id && extension.name === normalized.name)) {
      throw new Error(`MCP extension name already exists: ${normalized.name}`)
    }

    const existing = document.extensions[index]
    const record: McpExtensionRecord = {
      ...existing,
      ...normalized,
      updatedAt: nextTimestamp(existing.updatedAt),
    }
    document.extensions[index] = record
    writeDocument(document)
    return record
  }

  return {
    async list() {
      return readDocument().extensions
    },
    async get(id) {
      return readDocument().extensions.find((extension) => extension.id === id)
    },
    create,
    async createFromConfig(config) {
      return create(parseMcpExtensionConfig(config))
    },
    update,
    async updateFromConfig(id, config) {
      return update(id, parseMcpExtensionConfig(config))
    },
    async delete(id) {
      const document = readDocument()
      const index = document.extensions.findIndex((extension) => extension.id === id)
      if (index === -1) throw new Error(`MCP extension not found: ${id}`)
      document.extensions.splice(index, 1)
      writeDocument(document)
    },
    async setEnabled(id, enabled) {
      if (typeof enabled !== 'boolean') throw new Error('MCP extension enabled must be boolean')

      const document = readDocument()
      const index = document.extensions.findIndex((extension) => extension.id === id)
      if (index === -1) throw new Error(`MCP extension not found: ${id}`)

      const existing = document.extensions[index]
      const record: McpExtensionRecord = {
        ...existing,
        enabled,
        updatedAt: nextTimestamp(existing.updatedAt),
      }
      document.extensions[index] = record
      writeDocument(document)
      return record
    },
    async setToolEnabled(id, toolName, enabled) {
      if (typeof enabled !== 'boolean') throw new Error('MCP extension tool enabled must be boolean')

      const document = readDocument()
      const index = document.extensions.findIndex((extension) => extension.id === id)
      if (index === -1) throw new Error(`MCP extension not found: ${id}`)

      const existing = document.extensions[index]
      const overrides = { ...existing.toolPolicy.overrides }
      const defaultEnabled = existing.toolPolicy.default === 'enabled'
      if (enabled === defaultEnabled) delete overrides[toolName]
      else {
        Object.defineProperty(overrides, toolName, {
          configurable: true,
          enumerable: true,
          value: enabled,
          writable: true,
        })
      }

      const record: McpExtensionRecord = {
        ...existing,
        toolPolicy: { ...existing.toolPolicy, overrides },
        updatedAt: nextTimestamp(existing.updatedAt),
      }
      document.extensions[index] = record
      writeDocument(document)
      return record
    },
  }
}
