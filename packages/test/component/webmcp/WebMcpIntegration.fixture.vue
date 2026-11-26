<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { initializeBuiltinWebMCP } from '@opentiny/next-sdk'
import {
  createCompositeMcpAdapter,
  createWebMcpAdapter,
  type McpAdapter,
  type McpToolDefinition,
  type WebMcpContext,
  type WebMcpToolDescriptor,
} from '@opentiny/tiny-robot'

type SdkContext = WebMcpContext & {
  registerTool: (
    definition: {
      name: string
      description?: string
      inputSchema?: unknown
      execute: (args: Record<string, unknown>) => Promise<unknown>
    },
    options?: { signal?: AbortSignal },
  ) => unknown
}

initializeBuiltinWebMCP()

const modelContext = (document as Document & { modelContext?: SdkContext }).modelContext
if (!modelContext) throw new Error('WebMCP modelContext is unavailable')
const sdkContext: SdkContext = modelContext

const section = ref('overview')
const registrations = new Map<string, AbortController>()
const registrationError = ref('')

function registerPageTool(
  descriptor: WebMcpToolDescriptor,
  execute: (args: Record<string, unknown>) => Promise<unknown>,
) {
  const controller = new AbortController()
  registrations.set(descriptor.name, controller)

  try {
    const registration = sdkContext.registerTool(
      {
        name: descriptor.name,
        description: descriptor.description,
        inputSchema: descriptor.inputSchema,
        execute,
      },
      { signal: controller.signal },
    )

    void Promise.resolve(registration).catch((cause) => {
      if (!controller.signal.aborted) registrationError.value = cause instanceof Error ? cause.message : String(cause)
    })
  } catch (cause) {
    registrationError.value = cause instanceof Error ? cause.message : String(cause)
    throw cause
  }
}

registerPageTool(
  {
    name: 'get-page-info',
    description: 'Read the current page section.',
    inputSchema: { type: 'object', properties: {} },
  },
  async () => ({ content: [{ type: 'text', text: `section:${section.value}` }] }),
)

registerPageTool(
  {
    name: 'set-page-section',
    description: 'Change the current page section.',
    inputSchema: {
      type: 'object',
      properties: { section: { type: 'string' } },
      required: ['section'],
    },
  },
  async (args) => {
    if (typeof args.section !== 'string' || !args.section.trim()) throw new Error('section is required')
    section.value = args.section
    return { content: [{ type: 'text', text: `section:${section.value}` }] }
  },
)

const normalServerEnabled = ref(true)
const normalToolEnabled = ref(true)
const normalServer = computed(() => ({
  id: 'normal-mcp',
  name: 'Normal MCP',
  installed: true,
  enabled: normalServerEnabled.value,
}))
const normalAdapter: McpAdapter = {
  runtime: {
    servers: computed(() => [normalServer.value]),
    tools: computed(() => ({
      'normal-mcp': [{ id: 'normal-tool', name: 'normal-tool', enabled: normalToolEnabled.value }],
    })),
    addServer: () => undefined,
    removeServer: () => undefined,
    setServerEnabled: (_id, enabled) => {
      normalServerEnabled.value = enabled
    },
    setToolEnabled: (_id, _toolId, enabled) => {
      normalToolEnabled.value = enabled
    },
  },
  async listTools(serverIds, selectedToolIds) {
    if (!serverIds.includes('normal-mcp') || !normalServerEnabled.value) return []
    return (selectedToolIds['normal-mcp'] ?? []).map((id): McpToolDefinition => ({
      serverId: 'normal-mcp',
      id,
      name: `normal-mcp__${id}`,
      originalName: id,
    }))
  },
  async callTool() {
    return 'normal-mcp-result'
  },
}

const webmcpAdapter = createWebMcpAdapter({
  getContext: () => modelContext,
  server: { id: 'page-webmcp', name: 'Page WebMCP' },
})
const adapter = createCompositeMcpAdapter({ adapters: [webmcpAdapter, normalAdapter] })
const pageServer = computed(() => adapter.runtime.servers.value.find((server) => server.id === 'page-webmcp'))
const pageTools = computed(() => adapter.runtime.tools.value['page-webmcp'] ?? [])
const serverIds = computed(() => adapter.runtime.servers.value.map((server) => server.id).join(','))
const lastCallResult = ref('')
const dynamicToolAdded = ref(false)

function getPageTool(toolId: string) {
  return pageTools.value.find((tool) => tool.id === toolId)
}

async function callPageTool() {
  try {
    const definitions = await adapter.listTools(['page-webmcp'], { 'page-webmcp': ['get-page-info'] })
    const definition = definitions[0]
    if (!definition) throw new Error('Page tool is unavailable')
    lastCallResult.value = String(await adapter.callTool(definition.serverId, definition.originalName, {}))
  } catch (cause) {
    registrationError.value = cause instanceof Error ? cause.message : String(cause)
  }
}

async function togglePageServer() {
  await adapter.runtime.setServerEnabled('page-webmcp', !pageServer.value?.enabled)
}

async function togglePageTool(toolId: string) {
  const tool = getPageTool(toolId)
  if (!tool) throw new Error(`Page tool is unavailable: ${toolId}`)
  await adapter.runtime.setToolEnabled('page-webmcp', toolId, !tool.enabled)
}

function addDynamicTool() {
  if (registrations.has('get-page-status')) return
  registerPageTool(
    {
      name: 'get-page-status',
      description: 'Read the current page status.',
      inputSchema: { type: 'object', properties: {} },
    },
    async () => ({ content: [{ type: 'text', text: `status:${section.value}` }] }),
  )
  dynamicToolAdded.value = true
}

function removeDynamicTool() {
  registrations.get('get-page-status')?.abort()
  registrations.delete('get-page-status')
  dynamicToolAdded.value = false
}

onBeforeUnmount(() => {
  for (const controller of registrations.values()) controller.abort()
  void adapter.close?.()
})
</script>

<template>
  <section data-testid="webmcp-integration">
    <div data-testid="server-ids">{{ serverIds }}</div>
    <div data-testid="webmcp-server-enabled">{{ pageServer?.enabled ? 'enabled' : 'disabled' }}</div>
    <div data-testid="webmcp-tool-count">{{ pageTools.length }}</div>
    <div data-testid="registration-error">{{ registrationError }}</div>
    <div data-testid="call-result">{{ lastCallResult }}</div>
    <div data-testid="dynamic-tool-state">{{ dynamicToolAdded ? 'added' : 'removed' }}</div>
    <button data-testid="toggle-server" type="button" @click="togglePageServer">Toggle WebMCP Server</button>
    <button data-testid="add-dynamic-tool" type="button" @click="addDynamicTool">Add dynamic tool</button>
    <button data-testid="remove-dynamic-tool" type="button" @click="removeDynamicTool">Remove dynamic tool</button>
    <button data-testid="call-page-tool" type="button" @click="callPageTool">Call page tool</button>
    <label>
      <input
        :checked="getPageTool('get-page-info')?.enabled"
        aria-label="Enable get-page-info"
        type="checkbox"
        @change="togglePageTool('get-page-info')"
      />
      get-page-info
    </label>
  </section>
</template>
