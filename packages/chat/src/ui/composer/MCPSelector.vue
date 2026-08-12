<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrMcpServerPicker, type PluginInfo } from '@opentiny/tiny-robot'
import { IconPlugin } from '@opentiny/tiny-robot-svgs'
import type { ChatLabels, ChatMcpServerView, ChatMcpView } from '../../types'

const props = defineProps<{
  mcp: ChatMcpView
  labels: ChatLabels
}>()

const emit = defineEmits<{
  addServer: [payload: { id: string }]
  removeServer: [payload: { id: string }]
  updateServerEnabled: [payload: { id: string; enabled: boolean }]
  updateToolEnabled: [payload: { serverId: string; toolId: string; enabled: boolean }]
}>()

const visible = shallowRef(false)
const fallbackPluginIcon = 'https://modelcontextprotocol.io/favicon.ico'
const pickerPopupConfig = {
  type: 'drawer' as const,
  drawer: {
    direction: 'right' as const,
  },
}

const servers = computed(() => props.mcp.servers ?? [])
const tools = computed(() => props.mcp.tools ?? {})
const hasServers = computed(() => servers.value.length > 0)
const activeCount = computed(() => servers.value.filter((server) => server.installed && server.enabled).length)
const hasPendingAction = computed(() =>
  servers.value.some((server) => Boolean(server.loading || tools.value[server.id]?.some((tool) => tool.loading))),
)

const installedPlugins = computed<PluginInfo[]>(() =>
  servers.value.filter((server) => server.installed).map((server) => toPluginInfo(server, { includeTools: true })),
)

const marketPlugins = computed<PluginInfo[]>(() =>
  servers.value.map((server) => toPluginInfo(server, { includeTools: false })),
)

function getMetadataString(server: ChatMcpServerView, key: string) {
  const value = server.metadata?.[key]

  return typeof value === 'string' ? value : undefined
}

function toPluginInfo(server: ChatMcpServerView, options: { includeTools: boolean }): PluginInfo {
  const serverTools = options.includeTools && server.installed ? (tools.value[server.id] ?? []) : []

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

  if (!server || server.installed || server.loading) {
    return
  }

  emit('addServer', { id: plugin.id })
}

function handlePluginDelete(plugin: PluginInfo) {
  const server = findServer(plugin.id)

  if (!server || !server.installed || server.loading) {
    return
  }

  emit('removeServer', { id: plugin.id })
}

function handlePluginToggle(plugin: PluginInfo, enabled: boolean) {
  const server = findServer(plugin.id)

  if (!server || !server.installed || server.loading || server.enabled === enabled) {
    return
  }

  emit('updateServerEnabled', { id: plugin.id, enabled })
}

function handleToolToggle(plugin: PluginInfo, toolId: string, enabled: boolean) {
  const server = findServer(plugin.id)
  const tool = tools.value[plugin.id]?.find((item) => item.id === toolId)

  if (!server || !server.installed || !server.enabled || tool?.loading || tool?.enabled === enabled) {
    return
  }

  emit('updateToolEnabled', { serverId: plugin.id, toolId, enabled })
}
</script>

<template>
  <div v-if="hasServers" class="tr-chat-mcp-selector">
    <button
      class="tr-chat-mcp-selector__button"
      :class="{ 'tr-chat-mcp-selector__button--active': activeCount > 0 }"
      type="button"
      :aria-label="labels.mcp"
      :title="labels.mcp"
      @click="visible = true"
    >
      <IconPlugin :size="16" class="tr-chat-mcp-selector__icon" />
      <span class="tr-chat-mcp-selector__label">{{ labels.mcp }}</span>
      <span v-if="activeCount > 0" class="tr-chat-mcp-selector__count">
        {{ activeCount }}
      </span>
    </button>

    <TrMcpServerPicker
      v-model:visible="visible"
      :active-count="activeCount"
      :popup-config="pickerPopupConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :loading="hasPendingAction"
      :market-loading="false"
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
.tr-chat-mcp-selector {
  display: inline-flex;
  align-items: center;
}

.tr-chat-mcp-selector__button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--tr-border-color-disabled);
  border-radius: var(--tr-radius-full);
  color: var(--tr-text-secondary);
  background: var(--tr-container-bg-default);
  font: inherit;
  font-size: var(--tr-font-size-sm);
  line-height: 1;
  cursor: pointer;
}

.tr-chat-mcp-selector__button:hover {
  border-color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-hover);
}

.tr-chat-mcp-selector__button--active {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-default-2);
}

.tr-chat-mcp-selector__icon {
  flex-shrink: 0;
}

.tr-chat-mcp-selector__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 999px;
  color: #fff;
  background: var(--tr-color-brand, #1476ff);
  font-size: 10px;
}

@media (max-width: 959px) {
  .tr-chat-mcp-selector__button {
    justify-content: center;
    width: 32px;
    padding: 0;
  }

  .tr-chat-mcp-selector__label {
    display: none;
  }

  .tr-chat-mcp-selector__count {
    position: absolute;
    right: -4px;
    top: -4px;
  }
}
</style>
