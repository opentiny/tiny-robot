<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { TrMcpServerPicker, type PluginInfo } from '@opentiny/tiny-robot'
import { IconPlugin } from '@opentiny/tiny-robot-svgs'
import type { ChatMcpRuntime, ChatMcpServerInfo } from '../types'

const props = defineProps<{
  mcp: ChatMcpRuntime
}>()

const visible = shallowRef(false)
const pendingServerIds = shallowRef<ReadonlySet<string>>(new Set())
const pendingToolIds = shallowRef<ReadonlySet<string>>(new Set())
const attemptedToolLoadServerIds = shallowRef<ReadonlySet<string>>(new Set())
const serverActionQueues = new Map<string, Promise<void>>()
const pendingAutoDisableServerIds = new Set<string>()
const fallbackPluginIcon = 'https://modelcontextprotocol.io/favicon.ico'
const pickerPopupConfig = {
  type: 'drawer' as const,
  drawer: {
    direction: 'right' as const,
  },
}

const servers = computed(() => props.mcp.servers.value)
const hasServers = computed(() => servers.value.length > 0)
const activeCount = computed(() => servers.value.filter((server) => server.installed && server.enabled).length)
const hasPendingServer = computed(() => servers.value.some((server) => isServerPending(server)))
const hasPendingTool = computed(() => pendingToolIds.value.size > 0)
const hasPendingAction = computed(() => hasPendingServer.value || hasPendingTool.value)
const toolLoadCandidates = computed(() =>
  servers.value
    .filter((server) => server.installed && server.enabled && !hasLoadedTools(server.id))
    .map((server) => ({
      id: server.id,
      pending: isServerPending(server),
    })),
)

const installedPlugins = computed<PluginInfo[]>(() =>
  servers.value.filter((server) => server.installed).map((server) => toPluginInfo(server, { includeTools: true })),
)

const marketPlugins = computed<PluginInfo[]>(() =>
  servers.value.map((server) => toPluginInfo(server, { includeTools: false })),
)

function getMetadataString(server: ChatMcpServerInfo, key: string) {
  const value = server.metadata?.[key]

  return typeof value === 'string' ? value : undefined
}

function isServerPending(server: ChatMcpServerInfo) {
  return Boolean(server.loading || pendingServerIds.value.has(server.id))
}

function hasLoadedTools(serverId: string) {
  return Object.prototype.hasOwnProperty.call(props.mcp.tools.value, serverId)
}

function getToolKey(serverId: string, toolId: string) {
  return `${serverId}:${toolId}`
}

function isToolPending(serverId: string, toolId: string) {
  return pendingToolIds.value.has(getToolKey(serverId, toolId))
}

function toPluginInfo(server: ChatMcpServerInfo, options: { includeTools: boolean }): PluginInfo {
  const { includeTools } = options
  const pending = isServerPending(server)
  // The installed list owns the full tool card. The market list stays
  // summary-only so already-added servers do not duplicate their tool rows.
  const serverTools = includeTools && server.installed ? (props.mcp.tools.value[server.id] ?? []) : []

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
    addState: pending ? 'loading' : server.installed ? 'added' : 'idle',
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

function setToolPending(serverId: string, toolId: string, pending: boolean) {
  const key = getToolKey(serverId, toolId)
  const next = new Set(pendingToolIds.value)

  if (pending) {
    next.add(key)
  } else {
    next.delete(key)
  }

  pendingToolIds.value = next
}

function setToolLoadAttempted(serverId: string) {
  const next = new Set(attemptedToolLoadServerIds.value)
  next.add(serverId)
  attemptedToolLoadServerIds.value = next
}

function enqueueServerAction(serverId: string, action: () => Promise<void> | void) {
  const previousTask = serverActionQueues.get(serverId) ?? Promise.resolve()
  const task = previousTask.then(action)

  serverActionQueues.set(serverId, task)

  return task.finally(() => {
    if (serverActionQueues.get(serverId) === task) {
      serverActionQueues.delete(serverId)
    }
  })
}

async function runServerAction(id: string, action: () => Promise<void> | void) {
  const server = findServer(id)

  if (!server || isServerPending(server)) {
    return
  }

  setServerPending(id, true)

  try {
    await enqueueServerAction(id, action)
  } finally {
    setServerPending(id, false)
  }
}

async function loadServerTools(id: string) {
  setToolLoadAttempted(id)
  await props.mcp.loadTools(id)
}

async function runToolAction(serverId: string, toolId: string, action: () => Promise<void> | void) {
  const server = findServer(serverId)

  if (!server || !server.installed || !server.enabled || isToolPending(serverId, toolId)) {
    return
  }

  setToolPending(serverId, toolId, true)

  try {
    await enqueueServerAction(serverId, async () => {
      const currentServer = findServer(serverId)

      if (!currentServer?.installed || !currentServer.enabled) {
        return
      }

      await action()
    })
  } finally {
    setToolPending(serverId, toolId, false)
  }
}

watch(
  toolLoadCandidates,
  (candidates) => {
    const candidateIds = new Set(candidates.map((candidate) => candidate.id))
    const nextAttempts = new Set([...attemptedToolLoadServerIds.value].filter((serverId) => candidateIds.has(serverId)))
    const serverIdsToLoad: string[] = []

    for (const candidate of candidates) {
      if (candidate.pending || nextAttempts.has(candidate.id)) {
        continue
      }

      nextAttempts.add(candidate.id)
      serverIdsToLoad.push(candidate.id)
    }

    attemptedToolLoadServerIds.value = nextAttempts

    for (const serverId of serverIdsToLoad) {
      void runServerAction(serverId, () => loadServerTools(serverId)).catch((error) => {
        console.error(`[MCP] Failed to load tools for initially enabled server "${serverId}":`, error)
      })
    }
  },
  { immediate: true },
)

async function handlePluginAdd(plugin: PluginInfo) {
  const server = findServer(plugin.id)

  if (!server || server.installed) {
    return
  }

  try {
    await runServerAction(plugin.id, async () => {
      await props.mcp.addServer(plugin.id)
      await loadServerTools(plugin.id)
    })
  } catch (error) {
    console.error(`[MCP] Failed to add server "${plugin.id}":`, error)
  }
}

async function handlePluginDelete(plugin: PluginInfo) {
  const server = findServer(plugin.id)

  if (!server || !server.installed) {
    return
  }

  try {
    await runServerAction(plugin.id, () => props.mcp.removeServer(plugin.id))
  } catch (error) {
    console.error(`[MCP] Failed to remove server "${plugin.id}":`, error)
  }
}

async function handlePluginToggle(plugin: PluginInfo, enabled: boolean) {
  const server = findServer(plugin.id)
  const isAutoDisable = !enabled && pendingAutoDisableServerIds.delete(plugin.id)

  if (!server || !server.installed) {
    return
  }

  if (server.enabled === enabled) {
    return
  }

  try {
    await runServerAction(plugin.id, async () => {
      if (isAutoDisable) {
        const serverTools = props.mcp.tools.value[plugin.id] ?? []

        // The Picker auto-disables a Server after its last Tool is disabled.
        // Do not apply that follow-up action if the Tool mutation failed or
        // the Runtime still reports another enabled Tool.
        if (serverTools.some((tool) => tool.enabled)) {
          return
        }
      }

      await props.mcp.setServerEnabled(plugin.id, enabled)

      if (enabled && !hasLoadedTools(plugin.id)) {
        await loadServerTools(plugin.id)
      }

      if (enabled) {
        const serverTools = props.mcp.tools.value[plugin.id] ?? []

        // A Server hidden while all of its Tools are off would otherwise need
        // two parent-toggle clicks: one to reveal Tools and another to enable
        // them. Treat the first click as the Picker's normal "enable all".
        if (serverTools.length > 0 && serverTools.every((tool) => !tool.enabled)) {
          for (const tool of serverTools) {
            await props.mcp.setToolEnabled(plugin.id, tool.id, true)
          }
        }
      }
    })
  } catch (error) {
    console.error(`[MCP] Failed to ${enabled ? 'enable' : 'disable'} server "${plugin.id}":`, error)
  }
}

async function handleToolToggle(plugin: PluginInfo, toolId: string, enabled: boolean) {
  const server = findServer(plugin.id)

  if (!server || !server.installed) {
    return
  }

  // PluginCard mutates transient Tool rows before emitting the child events
  // caused by a Server-level toggle. Ignore only that cascade when the Server
  // itself is changing; a parent "enable all" while the Server is already on
  // must still update every Tool in Runtime state.
  const pluginTool = plugin.tools.find((tool) => tool.id === toolId)

  if (server.enabled !== enabled && pluginTool?.enabled === enabled) {
    return
  }

  // A disabled Server has no active Tool controls. Keep its persisted Tool
  // choices unchanged; re-enabling the Server restores those choices.
  if (!server.enabled) {
    return
  }

  const serverTools = props.mcp.tools.value[plugin.id] ?? []
  const isLastEnabledTool =
    !enabled &&
    serverTools.some((tool) => tool.id === toolId && tool.enabled) &&
    !serverTools.some((tool) => tool.id !== toolId && tool.enabled)

  if (isLastEnabledTool) {
    pendingAutoDisableServerIds.add(plugin.id)
  }

  try {
    await runToolAction(plugin.id, toolId, () => props.mcp.setToolEnabled(plugin.id, toolId, enabled))
  } catch (error) {
    // Keep the Runtime as the source of truth and let the next computed
    // render restore the previous value if an action fails.
    console.error(`[MCP] Failed to toggle tool "${toolId}" for "${plugin.id}":`, error)
  } finally {
    pendingAutoDisableServerIds.delete(plugin.id)
  }
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
