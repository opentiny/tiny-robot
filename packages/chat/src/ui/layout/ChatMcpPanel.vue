<script setup lang="ts">
import { computed } from 'vue'
import { TrMcpServerPicker, type PluginInfo } from '@opentiny/tiny-robot'
import fallbackPluginIcon from '../../assets/modelcontextprotocol.png'
import type { ChatLabels, ChatMcpServerView, ChatMcpView } from '../../types'

const props = defineProps<{
  mcp: ChatMcpView
  labels: ChatLabels
}>()

const emit = defineEmits<{
  close: []
  addServer: [payload: { id: string }]
  removeServer: [payload: { id: string }]
  updateServerEnabled: [payload: { id: string; enabled: boolean }]
  updateToolEnabled: [payload: { serverId: string; toolId: string; enabled: boolean }]
}>()

const visible = computed({
  get: () => true,
  set: (value: boolean) => {
    if (!value) emit('close')
  },
})
const servers = computed(() => props.mcp.servers ?? [])
const tools = computed(() => props.mcp.tools ?? {})
const activeCount = computed(() => servers.value.filter((server) => server.installed && server.enabled).length)
const hasPendingAction = computed(() =>
  servers.value.some((server) => Boolean(server.loading || tools.value[server.id]?.some((tool) => tool.loading))),
)
const installedPlugins = computed<PluginInfo[]>(() =>
  servers.value.filter((server) => server.installed).map((server) => toPluginInfo(server, true)),
)
const marketPlugins = computed<PluginInfo[]>(() => servers.value.map((server) => toPluginInfo(server, false)))
const embeddedPickerStyle = {
  position: 'static',
  top: 'auto',
  right: 'auto',
  bottom: 'auto',
  left: 'auto',
  transform: 'none',
  zIndex: 'auto',
  width: '100%',
  maxWidth: 'none',
  height: '100%',
  minHeight: '0',
}

function getMetadataString(server: ChatMcpServerView, key: string) {
  const value = server.metadata?.[key]
  return typeof value === 'string' ? value : undefined
}

function toPluginInfo(server: ChatMcpServerView, includeTools: boolean): PluginInfo {
  const serverTools = includeTools && server.installed ? (tools.value[server.id] ?? []) : []

  return {
    id: server.id,
    name: server.name,
    icon: getMetadataString(server, 'icon') ?? fallbackPluginIcon,
    description: server.description ?? '',
    enabled: server.enabled,
    expanded: true,
    tools: serverTools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      description: tool.description ?? '',
      enabled: tool.enabled,
    })),
    addState: server.loading ? 'loading' : server.installed ? 'added' : 'idle',
    category: getMetadataString(server, 'category'),
  }
}

function findServer(id: string) {
  return servers.value.find((server) => server.id === id)
}

function handlePluginAdd(plugin: PluginInfo) {
  const server = findServer(plugin.id)
  if (!server || server.installed || server.loading) return
  emit('addServer', { id: plugin.id })
}

function handlePluginDelete(plugin: PluginInfo) {
  const server = findServer(plugin.id)
  if (!server || !server.installed || server.loading) return
  emit('removeServer', { id: plugin.id })
}

function handlePluginToggle(plugin: PluginInfo, enabled: boolean) {
  const server = findServer(plugin.id)
  if (!server || !server.installed || server.loading || server.enabled === enabled) return
  emit('updateServerEnabled', { id: plugin.id, enabled })
}

function handleToolToggle(plugin: PluginInfo, toolId: string, enabled: boolean) {
  const server = findServer(plugin.id)
  const tool = tools.value[plugin.id]?.find((item) => item.id === toolId)
  if (!server || !server.installed || !tool || tool.loading || tool.enabled === enabled) return
  emit('updateToolEnabled', { serverId: plugin.id, toolId, enabled })
}
</script>

<template>
  <div class="chat-mcp-panel">
    <TrMcpServerPicker
      v-model:visible="visible"
      :style="embeddedPickerStyle"
      :active-count="activeCount"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :loading="hasPendingAction"
      :market-loading="false"
      :title="labels.mcp"
      :show-custom-add-button="false"
      :allow-plugin-delete="true"
      :allow-tool-toggle="true"
      @plugin-toggle="handlePluginToggle"
      @plugin-add="handlePluginAdd"
      @plugin-delete="handlePluginDelete"
      @tool-toggle="handleToolToggle"
    />
  </div>
</template>

<style scoped>
.chat-mcp-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.chat-mcp-panel :deep(.mcp-server-picker__content) {
  min-height: 0;
  overflow: hidden;
}

.chat-mcp-panel :deep(.mcp-server-picker__content-market-header) {
  flex-wrap: wrap;
  gap: 8px;
}

.chat-mcp-panel :deep(.mcp-server-picker__content-market-filter),
.chat-mcp-panel :deep(.mcp-server-picker__content-market-search) {
  min-width: 0;
  width: auto;
  flex: 1 1 120px;
}

.chat-mcp-panel :deep(.mcp-server-picker__content-market-filter .tiny-base-select),
.chat-mcp-panel :deep(.mcp-server-picker__content-market-search .tiny-input) {
  width: 100%;
  max-width: 100%;
}

.chat-mcp-panel :deep(.mcp-server-picker__content-list) {
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.chat-mcp-panel :deep(.tiny-tabs),
.chat-mcp-panel :deep(.tiny-tabs__content),
.chat-mcp-panel :deep(.tiny-tab-pane) {
  min-height: 0;
}
</style>
