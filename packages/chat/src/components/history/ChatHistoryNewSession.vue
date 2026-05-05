<script setup lang="ts">
import { useRequiredInject, CHAT_KIT_KEY, CHAT_UI_KEY } from '@/shared/context'
import { IconNewSession } from '@opentiny/tiny-robot-svgs'
import { useResolvedChatMessages } from '@/shared/messages'

defineOptions({ name: 'TrChatHistoryNewSession' })

const chatKit = useRequiredInject(CHAT_KIT_KEY, 'chat kit')
const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const chatMessages = useResolvedChatMessages()

function handleCreateNewSession() {
  chatKit.createConversation()

  if (!chatUi.workspace.enabled.value || chatUi.workspace.isMobile.value) {
    chatUi.history.close()
  }
}
</script>

<template>
  <div class="tr-chat-history-new-session">
    <button class="new-session-btn" @click="handleCreateNewSession">
      <IconNewSession />
      {{ chatMessages.history.newSession }}
    </button>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-history-new-session {
  padding: 16px 16px 10px;
  flex-shrink: 0;
}

.new-session-btn {
  width: 100%;
  min-height: 42px;
  padding: 8px 16px;
  border: 1px solid var(--chat-history-control-border);
  border-radius: 16px;
  background: var(--chat-history-control-bg);
  color: var(--chat-history-control-text);
  box-shadow: var(--chat-history-control-shadow);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: var(--chat-history-control-bg-hover);
    border-color: var(--chat-history-control-border-hover);
  }

  &:focus-visible {
    outline: none;
    border-color: var(--chat-history-control-active-border);
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--chat-history-control-active-border) 35%, transparent),
      var(--chat-history-control-shadow);
  }
}
</style>
