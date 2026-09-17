import { createMcpExtensionStorage } from '../index'
import type {
  McpExtensionInput,
  McpExtensionRecord,
  McpExtensionStorage,
  McpExtensionStorageOptions,
  McpExtensionToolPolicy,
  McpExtensionTransportType,
} from '../index'

const transport: McpExtensionTransportType = 'streamableHttp'
const input: McpExtensionInput = {
  name: 'Weather',
  description: 'Forecast tools',
  type: transport,
  url: 'https://example.com/mcp',
  headers: { Authorization: 'Bearer token', Retries: 3 },
  thumbnail: null,
}
const policy: McpExtensionToolPolicy = { default: 'enabled', overrides: {} }
const options: McpExtensionStorageOptions = { namespace: 'demo', storage: window.localStorage }
const storage: McpExtensionStorage = createMcpExtensionStorage()
const injected: McpExtensionStorage = createMcpExtensionStorage(options)

const records: Promise<McpExtensionRecord[]> = storage.list()
const record: Promise<McpExtensionRecord | undefined> = storage.get('id')
const created: Promise<McpExtensionRecord> = storage.create(input)
const createdFromConfig: Promise<McpExtensionRecord> = storage.createFromConfig(
  '{"mcpServers":{"weather":{"url":"https://example.com/mcp"}}}',
)
const updated: Promise<McpExtensionRecord> = storage.update('id', input)
const updatedFromConfig: Promise<McpExtensionRecord> = storage.updateFromConfig(
  'id',
  '{"mcpServers":{"weather":{"url":"https://example.com/mcp"}}}',
)
const deleted: Promise<void> = storage.delete('id')
const enabled: Promise<McpExtensionRecord> = storage.setEnabled('id', true)
const toolEnabled: Promise<McpExtensionRecord> = storage.setToolEnabled('id', 'forecast', true)

void policy
void injected
void records
void record
void created
void createdFromConfig
void updated
void updatedFromConfig
void deleted
void enabled
void toolEnabled
