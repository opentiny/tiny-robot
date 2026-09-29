import { createMcpExtensionStorage, createMemoryMcpExtensionStorage } from '../index'
import type { McpExtensionData, McpExtensionOptions, McpExtensionStorage } from '../index'

const identity = { source: 'remote', id: 'weather' }
const storage: McpExtensionStorage<{ enabled: boolean }> = createMemoryMcpExtensionStorage({
  parseBusinessOptions(value) {
    if (typeof value !== 'object' || value === null || !('enabled' in value) || typeof value.enabled !== 'boolean')
      throw new Error('Invalid enabled')
    return { enabled: value.enabled }
  },
})
const data: Promise<McpExtensionData> = storage.upsertData({
  ...identity,
  version: 1,
  name: 'Weather',
  type: 'streamableHttp',
  url: 'https://example.com/mcp',
  tools: [],
})
const options: Promise<McpExtensionOptions<{ enabled: boolean }>> = storage.setOptions(identity, {
  toolPolicy: { default: 'enabled', overrides: {} },
  business: { enabled: true },
})
const removed: Promise<void> = storage.deleteData(identity)
const remote = createMcpExtensionStorage({ adapter: { read: async () => null, write: async () => undefined } })
void data
void options
void removed
void remote
