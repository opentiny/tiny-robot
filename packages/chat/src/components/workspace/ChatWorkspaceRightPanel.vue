<script setup lang="ts">
import { IconClose } from '@opentiny/tiny-robot-svgs'
import { CHAT_UI_KEY, useRequiredInject } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'
import ChatWorkspaceRightEmpty from './ChatWorkspaceRightEmpty.vue'

defineOptions({ name: 'TrChatWorkspaceRightPanel' })

const props = withDefaults(
  defineProps<{
    mobile?: boolean
  }>(),
  {
    mobile: false,
  },
)

defineSlots<{
  default?: () => unknown
}>()

const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const chatMessages = useResolvedChatMessages()

function handleClose() {
  if (props.mobile) {
    chatUi.workspace.right.close()
    return
  }

  chatUi.workspace.right.collapse()
}
</script>

<template>
  <div class="tr-chat-workspace-right-panel" :class="{ 'is-mobile': props.mobile }">
    <div class="tr-chat-workspace-right-panel__header">
      <h3 class="tr-chat-workspace-right-panel__header-title">{{ chatMessages.workspace.rightPanelTitle }}</h3>
      <button
        type="button"
        class="tr-chat-workspace-right-panel__close"
        :aria-label="chatMessages.workspace.closeRightPanel"
        @click="handleClose"
      >
        <IconClose />
      </button>
    </div>
    <div class="tr-chat-workspace-right-panel__body">
      <slot>
        <ChatWorkspaceRightEmpty />
      </slot>
    </div>
  </div>
</template>

<style scoped lang="less">
.tr-chat-workspace-right-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--chat-workspace-panel-bg, var(--tr-container-bg-default, #fff)) 97%, white 3%) 0%,
    color-mix(in srgb, var(--chat-workspace-panel-bg, var(--tr-container-bg-default, #fff)) 99%, transparent 1%) 100%
  );
  color: var(--chat-workspace-text-primary, var(--tr-text-primary, #111827));
  box-shadow: inset 1px 0 0 color-mix(in srgb, var(--chat-workspace-border, rgba(15, 23, 42, 0.08)) 42%, transparent);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    height: var(--chat-header-height);
    padding: var(--chat-workspace-right-header-padding, 0 12px);
    flex-shrink: 0;

    h3 {
      margin: 0;
      padding: 0;
      overflow: hidden;
      color: var(--chat-header-title-color, var(--tr-text-primary, #191919));
      font-size: var(--chat-workspace-right-title-size, var(--chat-header-title-font-size, 14px));
      font-weight: var(--chat-header-title-font-weight, 600);
      line-height: 1.4;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__close {
    width: var(--chat-workspace-right-close-size, 28px);
    height: var(--chat-workspace-right-close-size, 28px);
    border: 0;
    border-radius: var(--chat-workspace-right-close-radius, 8px);
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
      width: 16px;
      height: 16px;
    }
  }

  &__body {
    flex: 1;
    min-height: 0;
    padding: var(--chat-workspace-right-body-padding, 0 2px 2px);
  }
}
</style>
