<script setup lang="ts">
import { ref } from 'vue'
import ChatUI from '../ChatUI.vue'
import type { ChatRightAsidePanelId, ChatUIProps } from '../types'
import { useExperimentalElementHost } from './elementHost'

const props = withDefaults(defineProps<ChatUIProps>(), { rightAsideOpen: undefined })
const chatUI = ref<InstanceType<typeof ChatUI>>()
const { forward } = useExperimentalElementHost(props as unknown as Record<string, unknown>, [
  'rightAsideOpen',
  'defaultRightAsideOpen',
])

defineExpose({
  openRightAside: (panel?: ChatRightAsidePanelId) => chatUI.value?.openRightAside(panel),
  closeRightAside: () => chatUI.value?.closeRightAside(),
  toggleRightAside: (panel?: ChatRightAsidePanelId) => chatUI.value?.toggleRightAside(panel),
  activateRightAsidePanel: (panel: ChatRightAsidePanelId) => chatUI.value?.activateRightAsidePanel(panel) ?? false,
})
</script>

<template>
  <ChatUI
    ref="chatUI"
    v-bind="props"
    @update:floating-state="forward('update:floating-state', $event)"
    @floating-drag-start="forward('floating-drag-start', $event)"
    @floating-drag="forward('floating-drag', $event)"
    @floating-drag-end="forward('floating-drag-end', $event)"
    @floating-resize-start="forward('floating-resize-start', $event)"
    @floating-resize="forward('floating-resize', $event)"
    @floating-resize-end="forward('floating-resize-end', $event)"
    @update:input-value="forward('update:inputValue', $event)"
    @submit="forward('submit', $event)"
    @cancel="forward('cancel')"
    @clear="forward('clear')"
    @attachments-select="forward('attachments-select', $event)"
    @update:attachments="forward('update:attachments', $event)"
    @attachment-error="forward('attachment-error', $event)"
    @create-conversation="forward('create-conversation')"
    @switch-conversation="forward('switch-conversation', $event)"
    @rename-conversation="forward('rename-conversation', $event)"
    @history-action="forward('history-action', $event)"
    @prompt-click="forward('prompt-click', $event)"
    @bubble-state-change="forward('bubble-state-change', $event)"
    @bubble-event="forward('bubble-event', $event)"
    @model-select="forward('model-select', $event)"
    @model-feature-change="forward('model-feature-change', $event)"
    @model-reasoning-effort-change="forward('model-reasoning-effort-change', $event)"
    @mcp-add-server="forward('mcp-add-server', $event)"
    @mcp-create-server="forward('mcp-create-server', $event)"
    @mcp-remove-server="forward('mcp-remove-server', $event)"
    @mcp-server-enabled-change="forward('mcp-server-enabled-change', $event)"
    @mcp-tool-enabled-change="forward('mcp-tool-enabled-change', $event)"
    @extension-action="forward('extension-action', $event)"
    @extension-name-click="forward('extension-name-click', $event)"
    @extension-tab-change="forward('extension-tab-change', $event)"
    @left-aside-open-change="forward('left-aside-open-change', $event)"
    @right-aside-open-change="forward('right-aside-open-change', $event)"
    @update:right-aside-open="forward('update:right-aside-open', $event)"
    @update:active-right-aside-panel-id="forward('update:active-right-aside-panel-id', $event)"
    @renderer-error="forward('experimental-error', { source: 'renderer', error: $event })"
  >
    <template #header-notice><slot name="header-notice" /></template>
    <template #welcome-footer><slot name="welcome-footer" /></template>
    <template #prompts-footer><slot name="prompts-footer" /></template>
    <template #sender-header><slot name="sender-header" /></template>
    <template #sender-footer><slot name="sender-footer" /></template>
    <template #sender-footer-right><slot name="sender-footer-right" /></template>
  </ChatUI>
</template>
