<template>
  <div>
    <button
      class="sender-action-btn sender-capability-btn"
      :class="{ 'sender-capability-btn--active': inUseMcpServers.length > 0 }"
      type="button"
      @click="mcpPickerVisible = true"
    >
      <IconPlugin :size="16" class="sender-action-btn__icon" />
      MCP
      <span v-if="inUseMcpServers.length > 0" class="mcp-active-count">
        {{ inUseMcpServers.length }}
      </span>
    </button>

    <McpServerPicker
      v-model:visible="mcpPickerVisible"
      :active-count="inUseMcpServers.length"
      :popup-config="pickerPopupConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :loading="false"
      :market-loading="false"
      :show-custom-add-button="false"
      :allow-plugin-delete="true"
      @plugin-toggle="handlePluginToggle"
      @plugin-add="handlePluginAdd"
      @plugin-delete="handlePluginDelete"
      @tool-toggle="handleToolToggle"
    />
  </div>
</template>

<script setup lang="ts">
import { McpServerPicker, type PluginInfo } from '@opentiny/tiny-robot'
import { computed, ref } from 'vue'
import { useMcp } from '../composables/useMcp'
import type { McpServerKey } from '../mcpServers'
import { IconPlugin } from './icons'

const {
  McpServers,
  availableMcpServers,
  addedMcpServers,
  addMcpServer,
  inUseMcpServers,
  toggleMcpServer,
  removeMcpServer,
  listTools,
} = useMcp()

const mcpPickerVisible = ref(false)
const loadedPluginTools = ref<Record<string, PluginInfo['tools']>>({})
const addingMcpServers = ref<Set<McpServerKey>>(new Set())
const pluginIcon = 'https://modelcontextprotocol.io/favicon.ico'
const pickerPopupConfig = {
  type: 'drawer' as const,
  drawer: {
    direction: 'right' as const,
  },
}

const inUseServerSet = computed(() => new Set(inUseMcpServers.value))
const addedServerSet = computed(() => new Set(addedMcpServers.value))

function toMcpServerKey(serverKey: string): McpServerKey | null {
  return availableMcpServers.value.includes(serverKey as McpServerKey) ? (serverKey as McpServerKey) : null
}

function getServerDescription(serverKey: McpServerKey): string {
  const config = McpServers[serverKey]
  const description = 'description' in config ? config.description : undefined
  return description || config.baseUrl
}

function getServerIcon(serverKey: McpServerKey): string {
  const config = McpServers[serverKey]
  const logoUrl = 'logoUrl' in config ? config.logoUrl : undefined
  return logoUrl || pluginIcon
}

function normalizeTool(tool: unknown, fallbackIndex: number, enabled: boolean) {
  if (typeof tool !== 'object' || !tool) {
    return {
      id: `tool-${fallbackIndex}`,
      name: `Tool ${fallbackIndex + 1}`,
      description: '',
      enabled,
    }
  }
  const rawName = (tool as { name?: unknown }).name
  const rawDescription = (tool as { description?: unknown }).description
  const name = typeof rawName === 'string' && rawName.length > 0 ? rawName : `Tool ${fallbackIndex + 1}`
  return {
    id: name,
    name,
    description: typeof rawDescription === 'string' ? rawDescription : '',
    enabled,
  }
}

function setLoadedTools(serverKey: McpServerKey, tools: PluginInfo['tools']) {
  loadedPluginTools.value = {
    ...loadedPluginTools.value,
    [serverKey]: tools,
  }
}

function setAddingState(serverKey: McpServerKey, adding: boolean) {
  const next = new Set(addingMcpServers.value)
  if (adding) {
    next.add(serverKey)
  } else {
    next.delete(serverKey)
  }
  addingMcpServers.value = next
}

function mapToolsToPluginTools(tools: unknown[], enabled: boolean): PluginInfo['tools'] {
  return tools.map((tool, index) => normalizeTool(tool, index, enabled))
}

async function loadToolsForServer(serverKey: McpServerKey) {
  try {
    const tools = await listTools(serverKey)
    setLoadedTools(serverKey, mapToolsToPluginTools(tools, true))
  } catch (error) {
    console.error(`[MCP] Failed to load tools for "${serverKey}":`, error)
    setLoadedTools(serverKey, [])
  }
}

const installedPlugins = computed<PluginInfo[]>(() =>
  addedMcpServers.value.map((serverKey) => {
    const config = McpServers[serverKey]
    const enabled = inUseServerSet.value.has(serverKey)
    const tools = (loadedPluginTools.value[serverKey] || []).map((tool) => ({
      ...tool,
      enabled,
    }))
    return {
      id: serverKey,
      name: config.name,
      icon: getServerIcon(serverKey),
      description: getServerDescription(serverKey),
      enabled,
      expanded: true,
      tools,
    }
  }),
)

const marketPlugins = computed<PluginInfo[]>(() =>
  availableMcpServers.value.map((serverKey) => {
    const config = McpServers[serverKey]
    return {
      id: serverKey,
      name: config.name,
      icon: getServerIcon(serverKey),
      description: getServerDescription(serverKey),
      enabled: false,
      tools: [],
      addState: addedServerSet.value.has(serverKey)
        ? 'added'
        : addingMcpServers.value.has(serverKey)
          ? 'loading'
          : 'idle',
    }
  }),
)

async function handlePluginAdd(plugin: PluginInfo) {
  const serverKey = toMcpServerKey(plugin.id)
  if (!serverKey) {
    return
  }
  if (addedServerSet.value.has(serverKey) || addingMcpServers.value.has(serverKey)) {
    return
  }
  setAddingState(serverKey, true)
  try {
    addMcpServer(serverKey)
    await loadToolsForServer(serverKey)
  } finally {
    setAddingState(serverKey, false)
  }
}

async function handlePluginToggle(plugin: PluginInfo, enabled: boolean) {
  const serverKey = toMcpServerKey(plugin.id)
  if (!serverKey) {
    return
  }
  const isEnabled = inUseServerSet.value.has(serverKey)
  if (enabled !== isEnabled) {
    toggleMcpServer(serverKey)
  }
  if (enabled && !loadedPluginTools.value[serverKey]) {
    await loadToolsForServer(serverKey)
  }
}

function handleToolToggle(plugin: PluginInfo, toolId: string, enabled: boolean) {
  const serverKey = toMcpServerKey(plugin.id)
  if (!serverKey) {
    return
  }
  const tools = loadedPluginTools.value[serverKey] || []
  setLoadedTools(
    serverKey,
    tools.map((tool) => (tool.id === toolId ? { ...tool, enabled } : tool)),
  )
}

function handlePluginDelete(plugin: PluginInfo) {
  const serverKey = toMcpServerKey(plugin.id)
  if (!serverKey) {
    return
  }
  removeMcpServer(serverKey)
  const nextLoadedTools = { ...loadedPluginTools.value }
  delete nextLoadedTools[serverKey]
  loadedPluginTools.value = nextLoadedTools
}
</script>

<style scoped>
.sender-action-btn {
  border: 1px solid var(--tr-border-color-disabled);
  border-radius: var(--tr-radius-full);
  background: var(--tr-container-bg-default);
  color: var(--tr-text-secondary);
  font-size: var(--tr-font-size-sm);
  height: 32px;
  padding: 0 10px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sender-action-btn:hover:not(:disabled) {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-hover);
}

.sender-action-btn__icon {
  flex-shrink: 0;
}

.sender-capability-btn--active {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default-2);
}

.mcp-active-count {
  min-width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--tr-color-brand, #1476ff);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  padding: 0 3px;
}

:deep(.mcp-server-picker.popup-type-drawer) {
  right: 0 !important;
  top: 0 !important;
  bottom: 0 !important;
  border-right: 0;
}
</style>
