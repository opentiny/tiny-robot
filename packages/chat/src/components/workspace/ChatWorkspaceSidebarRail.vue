<script setup lang="ts">
import { IconAi, IconNewSession, IconPanelRightClose } from '@opentiny/tiny-robot-svgs'
import { CHAT_KIT_KEY, CHAT_UI_KEY, useRequiredInject } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'

defineOptions({ name: 'TrChatWorkspaceSidebarRail' })

const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const chatKit = useRequiredInject(CHAT_KIT_KEY, 'chat kit')
const chatMessages = useResolvedChatMessages()

function handleCreateConversation() {
  chatKit.createConversation()
}
</script>

<template>
  <div class="tr-chat-workspace-sidebar-rail">
    <IconAi
      class="tr-chat-workspace-sidebar-rail__brand"
      type="button"
      :aria-label="chatMessages.workspace.expandLeftSidebar"
      @click="chatUi.workspace.left.expand()"
    />
    <button
      type="button"
      class="tr-chat-workspace-sidebar-rail__button"
      :aria-label="chatMessages.workspace.historyRailLabel"
      @click="chatUi.workspace.left.expand()"
    >
      <IconPanelRightClose />
    </button>
    <button
      type="button"
      class="tr-chat-workspace-sidebar-rail__button"
      :aria-label="chatMessages.header.newChat"
      @click="handleCreateConversation"
    >
      <IconNewSession />
    </button>
    <slot />
  </div>
</template>

<style scoped lang="less">
.tr-chat-workspace-sidebar-rail {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: var(--chat-workspace-rail-gap, 18px);
  padding: var(--chat-workspace-rail-padding, 20px 0);

  &__brand {
    font-size: var(--chat-workspace-rail-brand-size, 28px);
    cursor: pointer;
  }

  &__button {
    width: var(--chat-workspace-rail-button-size, 44px);
    height: var(--chat-workspace-rail-button-size, 44px);
    border: 0;
    border-radius: var(--chat-workspace-rail-button-radius, 14px);
    background: transparent;
    color: var(--chat-workspace-text-secondary, var(--tr-text-secondary, #6b7280));
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background: var(--chat-workspace-hover-bg, var(--tr-container-bg-hover, rgba(15, 23, 42, 0.06)));
      color: var(--chat-workspace-accent, var(--tr-color-primary, #2f6bff));
    }

    :deep(svg) {
      width: var(--chat-workspace-rail-icon-size, 18px);
      height: var(--chat-workspace-rail-icon-size, 18px);
    }
  }
}
</style>
