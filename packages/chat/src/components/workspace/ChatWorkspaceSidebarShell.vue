<script setup lang="ts">
import { computed } from 'vue'
import { IconAi, IconPanelLeftClose } from '@opentiny/tiny-robot-svgs'
import { CHAT_UI_KEY, useRequiredInject } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'

defineOptions({ name: 'TrChatWorkspaceSidebarShell' })

const props = withDefaults(
  defineProps<{
    mobile?: boolean
    title?: string
  }>(),
  {
    mobile: false,
    title: 'TinyRobot',
  },
)

defineSlots<{
  brand?: () => unknown
  default?: () => unknown
}>()

const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const chatMessages = useResolvedChatMessages()
const actionLabel = computed(() =>
  props.mobile ? chatMessages.value.sidebar.close : chatMessages.value.sidebar.collapse,
)

function handleAction() {
  if (props.mobile) {
    chatUi.workspace.left.close()
    return
  }

  chatUi.workspace.left.collapse()
}
</script>

<template>
  <div class="tr-chat-workspace-sidebar-shell" :class="{ 'is-mobile': props.mobile }">
    <div class="tr-chat-workspace-sidebar-shell__header">
      <div class="tr-chat-workspace-sidebar-shell__brand">
        <slot name="brand">
          <span class="tr-chat-workspace-sidebar-shell__brand-icon">
            <IconAi />
          </span>
          <strong>{{ props.title }}</strong>
        </slot>
      </div>

      <button
        type="button"
        class="tr-chat-workspace-sidebar-shell__toggle"
        :aria-label="actionLabel"
        @click="handleAction"
      >
        <IconPanelLeftClose />
      </button>
    </div>

    <div class="tr-chat-workspace-sidebar-shell__content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="less">
.tr-chat-workspace-sidebar-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  color: var(--chat-workspace-text-primary, var(--tr-text-primary, #111827));

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: var(--chat-workspace-sidebar-header-padding, 24px 22px 10px);
    flex-shrink: 0;
  }

  &__brand {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;

    strong {
      color: var(--chat-workspace-text-primary, var(--tr-text-primary, #111827));
      font-size: var(--chat-workspace-sidebar-title-size, 18px);
      font-weight: 700;
      line-height: 1.25;
    }
  }

  &__brand-icon {
    width: var(--chat-workspace-sidebar-icon-size, 28px);
    height: var(--chat-workspace-sidebar-icon-size, 28px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--chat-workspace-accent, var(--tr-color-primary, #2f6bff));

    :deep(svg) {
      width: var(--chat-workspace-sidebar-icon-size, 28px);
      height: var(--chat-workspace-sidebar-icon-size, 28px);
    }
  }

  &__toggle {
    width: var(--chat-workspace-sidebar-toggle-size, 32px);
    height: var(--chat-workspace-sidebar-toggle-size, 32px);
    border: 0;
    border-radius: var(--chat-workspace-sidebar-toggle-radius, 10px);
    background: transparent;
    color: var(--chat-workspace-text-secondary, var(--tr-text-secondary, #6b7280));
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      background: var(--chat-workspace-hover-bg, var(--tr-container-bg-hover, rgba(15, 23, 42, 0.06)));
      color: var(--chat-workspace-accent, var(--tr-color-primary, #2f6bff));
    }

    :deep(svg) {
      width: 18px;
      height: 18px;
    }
  }

  &__content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}
</style>
