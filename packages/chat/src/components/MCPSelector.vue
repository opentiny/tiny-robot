<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrMcpServerPicker, type PluginInfo } from '@opentiny/tiny-robot'
import { IconPlugin } from '@opentiny/tiny-robot-svgs'
import type { ChatMcpRuntime, ChatMcpServerInfo } from '../types'

const props = defineProps<{
  mcp: ChatMcpRuntime
}>()

const visible = shallowRef(false)
const pendingServerIds = shallowRef<ReadonlySet<string>>(new Set())
const fallbackPluginIcon = 'https://modelcontextprotocol.io/favicon.ico'
const pickerPopupConfig = {
  type: 'drawer' as const,
  drawer: {
    direction: 'right' as const,
  },
}

const servers = computed(() => props.mcp.servers.value)
const hasServers = computed(() => servers.value.length > 0)
const activeCount = computed(() => servers.value.filter((server) => server.enabled).length)
const hasPendingServer = computed(() => servers.value.some((server) => isServerPending(server)))

const installedPlugins = computed<PluginInfo[]>(() =>
  servers.value.filter((server) => server.installed).map((server) => toPluginInfo(server)),
)

const marketPlugins = computed<PluginInfo[]>(() => servers.value.map((server) => toPluginInfo(server)))

function getMetadataString(server: ChatMcpServerInfo, key: string) {
  const value = server.metadata?.[key]

  return typeof value === 'string' ? value : undefined
}

function isServerPending(server: ChatMcpServerInfo) {
  return Boolean(server.loading || pendingServerIds.value.has(server.id))
}

function toPluginInfo(server: ChatMcpServerInfo): PluginInfo {
  const pending = isServerPending(server)

  return {
    id: server.id,
    name: server.name,
    icon: getMetadataString(server, 'icon') ?? fallbackPluginIcon,
    description: server.description ?? '',
    enabled: server.enabled,
    tools: [],
    addState: server.installed ? 'added' : pending ? 'loading' : 'idle',
    category: getMetadataString(server, 'category'),
  }
}

function findServer(id: string) {
  return servers.value.find((server) => server.id === id)
}

function setServerPending(id: string, pending: boolean) {
  const next = new Set(pendingServerIds.value)

  if (pending) {
    next.add(id)
  } else {
    next.delete(id)
  }

  pendingServerIds.value = next
}

async function runServerAction(id: string, action: () => Promise<void> | void) {
  const server = findServer(id)

  if (!server || isServerPending(server)) {
    return
  }

  setServerPending(id, true)

  try {
    await action()
  } finally {
    setServerPending(id, false)
  }
}

async function handlePluginAdd(plugin: PluginInfo) {
  const server = findServer(plugin.id)

  if (!server || server.installed) {
    return
  }

  await runServerAction(plugin.id, () => props.mcp.addServer(plugin.id))
}

async function handlePluginDelete(plugin: PluginInfo) {
  const server = findServer(plugin.id)

  if (!server || !server.installed) {
    return
  }

  await runServerAction(plugin.id, () => props.mcp.removeServer(plugin.id))
}

async function handlePluginToggle(plugin: PluginInfo, enabled: boolean) {
  const server = findServer(plugin.id)

  if (!server || !server.installed || server.enabled === enabled) {
    return
  }

  await runServerAction(plugin.id, () => props.mcp.setServerEnabled(plugin.id, enabled))
}
</script>

<template>
  <div v-if="hasServers" class="tr-chat-mcp-selector">
    <button
      class="tr-chat-mcp-selector__button"
      :class="{ 'tr-chat-mcp-selector__button--active': activeCount > 0 }"
      type="button"
      @click="visible = true"
    >
      <IconPlugin :size="16" class="tr-chat-mcp-selector__icon" />
      MCP
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
      :loading="hasPendingServer"
      :market-loading="false"
      :show-custom-add-button="false"
      :allow-plugin-delete="true"
      :allow-tool-toggle="false"
      @plugin-toggle="handlePluginToggle"
      @plugin-add="handlePluginAdd"
      @plugin-delete="handlePluginDelete"
    />
  </div>
</template>

<style scoped>
.tr-chat-mcp-selector {
  display: inline-flex;
  align-items: center;
}

.tr-chat-mcp-selector__button {
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
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-hover);
}

.tr-chat-mcp-selector__button--active {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-text-primary);
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
</style>
