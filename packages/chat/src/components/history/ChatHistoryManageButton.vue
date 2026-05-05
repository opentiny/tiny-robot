<script setup lang="ts">
import { computed } from 'vue'
import { IconCheck, IconEditPen } from '@opentiny/tiny-robot-svgs'
import { CHAT_HISTORY_KEY, useRequiredInject } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'

defineOptions({ name: 'TrChatHistoryManageButton' })

const historyState = useRequiredInject(CHAT_HISTORY_KEY, 'history state')
const chatMessages = useResolvedChatMessages()

const buttonTitle = computed(() =>
  historyState.isManagementMode.value ? chatMessages.value.history.done : chatMessages.value.history.manage,
)

function handleToggleManagement() {
  historyState.isManagementMode.value = !historyState.isManagementMode.value
  if (!historyState.isManagementMode.value) {
    historyState.clearSelection()
  }
}
</script>

<template>
  <button
    class="tr-chat-history-manage-btn"
    :class="{ 'is-active': historyState.isManagementMode.value }"
    :title="buttonTitle"
    :aria-label="buttonTitle"
    :aria-pressed="historyState.isManagementMode.value"
    @click="handleToggleManagement"
  >
    <IconCheck v-if="historyState.isManagementMode.value" />
    <IconEditPen v-else />
  </button>
</template>

<style lang="less" scoped>
.tr-chat-history-manage-btn {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 1px solid var(--chat-history-search-border);
  border-radius: 12px;
  background: var(--chat-history-search-bg);
  color: var(--chat-history-search-text);
  box-shadow: var(--chat-history-search-shadow);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: var(--chat-history-control-bg-hover);
    border-color: var(--chat-history-control-border-hover);
  }

  &:focus-visible {
    outline: none;
    border-color: var(--chat-history-control-active-border);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--chat-history-control-active-border) 22%, transparent);
  }

  &.is-active {
    background: var(--chat-history-control-active-bg);
    border-color: var(--chat-history-control-active-border);
    color: var(--chat-history-control-active-text);
    box-shadow: var(--chat-history-control-active-shadow);
  }

  svg {
    width: 18px;
    height: 18px;
  }
}
</style>
