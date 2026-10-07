<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconArrowLeft, IconClose, IconPlus } from '@opentiny/tiny-robot-svgs'
import {
  TrExtensionManager,
  TrMcpExtensionDetail,
  TrMcpExtensionForm,
  type ExtensionManagerActionEvent,
  type ExtensionManagerNameClickEvent,
  type McpExtensionFormSubmitMeta,
  type McpExtensionFormValue,
} from '@opentiny/tiny-robot'
import fallbackPluginIcon from '../../assets/modelcontextprotocol.png'
import type { ChatLabels, ChatMcpView } from '../../types'
import { createChatMcpManagerTab } from './chatMcpManager'

const props = defineProps<{
  mcp: ChatMcpView
  labels: ChatLabels
}>()

const emit = defineEmits<{
  close: []
  addServer: [payload: { id: string }]
  createServer: [payload: { config: McpExtensionFormValue; source: McpExtensionFormSubmitMeta['source'] }]
  removeServer: [payload: { id: string }]
  updateServerEnabled: [payload: { id: string; enabled: boolean }]
  updateToolEnabled: [payload: { serverId: string; toolId: string; enabled: boolean }]
}>()

type PanelView = 'list' | 'add' | 'detail'

const view = ref<PanelView>('list')
const selectedServerId = ref<string | null>(null)
const formValue = ref<McpExtensionFormValue>({ name: '', type: 'sse', url: '' })
const servers = computed(() => props.mcp.servers ?? [])
const tools = computed(() => props.mcp.tools ?? {})
const tabs = computed(() => [createChatMcpManagerTab(props.mcp, props.labels, fallbackPluginIcon)])
const selectedServer = computed(() =>
  servers.value.find((server) => server.id === selectedServerId.value && server.installed),
)
const selectedTools = computed(() => {
  const server = selectedServer.value
  if (!server) return []

  return (tools.value[server.id] ?? []).map((tool) => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    enabled: tool.enabled,
    disabled: Boolean(server.loading || tool.loading),
  }))
})

watch(selectedServer, (server) => {
  if (view.value === 'detail' && !server) view.value = 'list'
})

function openAddForm() {
  formValue.value = { name: '', type: 'sse', url: '' }
  view.value = 'add'
}

function openDetail(event: ExtensionManagerNameClickEvent) {
  const server = servers.value.find((item) => item.id === event.itemId)
  if (!server?.installed || server.loading) return
  selectedServerId.value = server.id
  view.value = 'detail'
}

function handleAction(event: ExtensionManagerActionEvent) {
  const server = servers.value.find((item) => item.id === event.itemId)
  if (!server || server.loading) return

  switch (event.action.id) {
    case 'add':
      if (!server.installed) emit('addServer', { id: server.id })
      break
    case 'remove':
      if (server.installed) emit('removeServer', { id: server.id })
      break
    case 'toggle':
      if (server.installed && typeof event.action.checked === 'boolean' && server.enabled !== event.action.checked) {
        emit('updateServerEnabled', { id: server.id, enabled: event.action.checked })
      }
      break
  }
}

function handleFormSubmit(config: McpExtensionFormValue, meta: McpExtensionFormSubmitMeta) {
  emit('createServer', { config, source: meta.source })
  view.value = 'list'
}

function handleToolToggle(event: { toolId: string; enabled: boolean }) {
  const server = selectedServer.value
  const tool = server && tools.value[server.id]?.find((item) => item.id === event.toolId)
  if (!server || server.loading || !tool || tool.loading || tool.enabled === event.enabled) return
  emit('updateToolEnabled', { serverId: server.id, toolId: tool.id, enabled: event.enabled })
}
</script>

<template>
  <div class="chat-mcp-panel">
    <template v-if="view === 'list'">
      <div class="chat-mcp-panel__manager">
        <TrExtensionManager :tabs="tabs" title="扩展" @action="handleAction" @name-click="openDetail">
          <template #header-actions>
            <button type="button" class="chat-mcp-panel__action chat-mcp-panel__add" @click="openAddForm">
              <IconPlus class="chat-mcp-panel__action-icon" aria-hidden="true" />
              <span>{{ '自定义添加' }}</span>
            </button>
            <button
              type="button"
              class="chat-mcp-panel__action chat-mcp-panel__icon-action"
              :aria-label="labels.closeRightAside"
              :title="labels.closeRightAside"
              @click="emit('close')"
            >
              <IconClose class="chat-mcp-panel__action-icon" aria-hidden="true" />
            </button>
          </template>
        </TrExtensionManager>
      </div>
    </template>

    <template v-else>
      <div class="chat-mcp-panel__header">
        <button
          type="button"
          class="chat-mcp-panel__action chat-mcp-panel__icon-action"
          aria-label="返回列表"
          title="返回列表"
          @click="view = 'list'"
        >
          <IconArrowLeft class="chat-mcp-panel__action-icon" aria-hidden="true" />
        </button>
        <h2>{{ view === 'add' ? '自定义添加' : selectedServer?.name }}</h2>
        <button
          type="button"
          class="chat-mcp-panel__action chat-mcp-panel__icon-action"
          :aria-label="labels.closeRightAside"
          :title="labels.closeRightAside"
          @click="emit('close')"
        >
          <IconClose class="chat-mcp-panel__action-icon" aria-hidden="true" />
        </button>
      </div>
      <div class="chat-mcp-panel__content">
        <TrMcpExtensionForm
          v-if="view === 'add'"
          v-model="formValue"
          @submit="handleFormSubmit"
          @cancel="view = 'list'"
        />
        <TrMcpExtensionDetail
          v-else-if="selectedServer"
          :id="selectedServer.id"
          :name="selectedServer.name"
          :description="selectedServer.description"
          :tools="selectedTools"
          @tool-toggle="handleToolToggle"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.chat-mcp-panel {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 16px;
  overflow-x: hidden;
  overflow-y: auto;
}

.chat-mcp-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chat-mcp-panel__manager {
  --tr-extension-card-grid-card-min-width: 240px;

  width: 100%;
}

.chat-mcp-panel__manager :deep(.extension-manager__header-actions) {
  gap: 12px;
}

.chat-mcp-panel__header h2 {
  min-width: 0;
  overflow: hidden;
  margin: 0;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0;
  border: 0;
}

.chat-mcp-panel__action {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--tr-text-primary);
  background: transparent;
  cursor: pointer;
}

.chat-mcp-panel__action:hover {
  background: var(--tr-container-bg-hover);
}

.chat-mcp-panel__icon-action {
  width: 32px;
  height: 32px;
  padding: 0;
}

.chat-mcp-panel__add {
  box-sizing: border-box;
  gap: 4px;
  border: 1px solid var(--tr-mcp-server-picker-header-button-border-color);
  border-radius: 999px;
  padding: 4px 15px;
  color: var(--tr-mcp-server-picker-header-button-text-color);
  background: transparent;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
}

.chat-mcp-panel__add:hover {
  border-color: var(--tr-mcp-server-picker-header-button-border-color-hover);
  background: transparent;
}

.chat-mcp-panel__add .chat-mcp-panel__action-icon {
  width: 16px;
  height: 16px;
  color: var(--tr-mcp-server-picker-header-button-icon-color);
}

.chat-mcp-panel__action-icon {
  width: 18px;
  height: 18px;
}

.chat-mcp-panel__action:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 2px;
}

.chat-mcp-panel__content {
  --tr-mcp-extension-form-content-padding: 0;
  --tr-mcp-extension-form-content-padding-mobile: 0;
  --tr-mcp-extension-form-footer-padding: 16px 0 0;
  --tr-mcp-extension-form-footer-padding-mobile: 16px 0 0;

  min-width: 0;
}

.chat-mcp-panel__content :deep(.mcp-extension-detail__tool) {
  padding-inline: 0;
}
</style>
