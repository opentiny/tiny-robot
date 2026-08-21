<script setup lang="ts">
import { computed } from 'vue'
import { IconPlugin } from '@opentiny/tiny-robot-svgs'
import type { ChatLabels, ChatMcpView } from '../../types'

const props = defineProps<{
  mcp: ChatMcpView
  labels: ChatLabels
}>()

const emit = defineEmits<{
  open: []
  addServer: [payload: { id: string }]
  removeServer: [payload: { id: string }]
  updateServerEnabled: [payload: { id: string; enabled: boolean }]
  updateToolEnabled: [payload: { serverId: string; toolId: string; enabled: boolean }]
}>()

const servers = computed(() => props.mcp.servers ?? [])
const hasServers = computed(() => servers.value.length > 0)
const activeCount = computed(() => servers.value.filter((server) => server.installed && server.enabled).length)
</script>

<template>
  <div v-if="hasServers" class="tr-chat-mcp-selector">
    <button
      class="tr-chat-mcp-selector__button"
      :class="{ 'tr-chat-mcp-selector__button--active': activeCount > 0 }"
      type="button"
      :aria-label="labels.mcp"
      :title="labels.mcp"
      @click="emit('open')"
    >
      <IconPlugin :size="16" class="tr-chat-mcp-selector__icon" />
      <span class="tr-chat-mcp-selector__label">{{ labels.mcp }}</span>
      <span v-if="activeCount > 0" class="tr-chat-mcp-selector__count">
        {{ activeCount }}
      </span>
    </button>
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

@container (max-width: 959px) {
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
