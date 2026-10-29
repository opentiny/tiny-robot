import type { McpExtensionStorage, McpExtensionStorageOptions } from './index.type'
import { createMcpExtensionStorage } from './storage'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()
  get length() {
    return this.values.size
  }
  clear() {
    this.values.clear()
  }
  getItem(key: string) {
    return this.values.get(key) ?? null
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.values.delete(key)
  }
  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

/** Creates an isolated, non-persistent MCP storage with the same data/options contract. */
export const createMemoryMcpExtensionStorage = <TBusiness = never>(
  options: Pick<McpExtensionStorageOptions<TBusiness>, 'parseBusinessOptions'> = {},
): McpExtensionStorage<TBusiness> => createMcpExtensionStorage({ ...options, storage: new MemoryStorage() })
