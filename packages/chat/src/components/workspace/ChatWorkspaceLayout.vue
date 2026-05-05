<script setup lang="ts">
import { computed, inject } from 'vue'
import type { PropType } from 'vue'
import { CHAT_RUNTIME_KEY, CHAT_UI_KEY, useRequiredInject } from '@/shared/context'
import type { ChatAppearanceConfig, ChatRuntime, ChatWorkspaceShellConfig } from '@/types'
import WorkspaceShell from './WorkspaceShell.vue'
import ChatWorkspaceLeftSheet from './ChatWorkspaceLeftSheet.vue'
import ChatWorkspaceRightPanel from './ChatWorkspaceRightPanel.vue'
import ChatWorkspaceRightSheet from './ChatWorkspaceRightSheet.vue'
import ChatWorkspaceSidebar from './ChatWorkspaceSidebar.vue'
import ChatWorkspaceSidebarRail from './ChatWorkspaceSidebarRail.vue'
import ChatWorkspaceSidebarShell from './ChatWorkspaceSidebarShell.vue'

defineOptions({ name: 'TrChatWorkspaceLayout' })

const props = defineProps({
  appearance: Object as PropType<ChatAppearanceConfig | undefined>,
  shell: Object as PropType<ChatWorkspaceShellConfig | undefined>,
  sidebarTitle: String,
})

const chatRuntime = inject<ChatRuntime | null>(CHAT_RUNTIME_KEY, null)
const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')

const runtimeShell = computed<ChatWorkspaceShellConfig | undefined>(() => {
  const workspace = chatRuntime?.workspace

  if (!workspace) {
    return undefined
  }

  return {
    variant: workspace.variant.value,
    leftRegion: {
      enabled: workspace.left.enabled.value,
      collapsible: workspace.left.collapsible.value,
      defaultOpen: workspace.left.visible.value && !workspace.left.collapsed.value,
      collapseMode: workspace.left.collapseMode.value,
      width: workspace.left.width.value,
      railLabel: workspace.left.railLabel.value,
    },
    rightRegion: {
      enabled: workspace.right.enabled.value,
      collapsible: workspace.right.collapsible.value,
      defaultOpen: workspace.right.visible.value && !workspace.right.collapsed.value,
      collapseMode: workspace.right.collapseMode.value,
      width: workspace.right.width.value,
      railLabel: workspace.right.railLabel.value,
    },
  }
})
const resolvedAppearance = computed(() => props.appearance)
const resolvedShell = computed(() => props.shell ?? runtimeShell.value)

function handleLeftCollapsedChange(value: boolean) {
  chatUi.workspace.left.collapsed.value = value
  chatUi.workspace.left.visible.value = true
}

function handleRightCollapsedChange(value: boolean) {
  chatUi.workspace.right.collapsed.value = value
  chatUi.workspace.right.visible.value = !value || resolvedShell.value?.rightRegion?.collapseMode === 'rail'
}
</script>

<template>
  <div class="tr-chat-workspace-layout">
    <WorkspaceShell
      :appearance="resolvedAppearance"
      :mobile="chatUi.workspace.isMobile.value"
      :left-region="resolvedShell?.leftRegion"
      :right-region="resolvedShell?.rightRegion"
      :left-collapsed="chatUi.workspace.left.collapsed.value"
      :right-collapsed="!chatUi.workspace.right.visible.value || chatUi.workspace.right.collapsed.value"
      :left-rail-label="resolvedShell?.leftRegion?.railLabel"
      :right-rail-label="resolvedShell?.rightRegion?.railLabel"
      @update:left-collapsed="handleLeftCollapsedChange"
      @update:right-collapsed="handleRightCollapsedChange"
    >
      <template #left>
        <ChatWorkspaceSidebarShell v-if="$slots.left" :mobile="false" :title="props.sidebarTitle">
          <slot name="left" />
        </ChatWorkspaceSidebarShell>
        <ChatWorkspaceSidebar v-else :mobile="false" :title="props.sidebarTitle" />
      </template>

      <template #left-rail>
        <ChatWorkspaceSidebarRail v-if="$slots['left-rail']">
          <slot name="left-rail" />
        </ChatWorkspaceSidebarRail>
        <ChatWorkspaceSidebarRail v-else />
      </template>

      <slot />

      <template #right>
        <ChatWorkspaceRightPanel v-if="$slots.right" :mobile="false">
          <slot name="right" />
        </ChatWorkspaceRightPanel>
        <ChatWorkspaceRightPanel v-else :mobile="false" />
      </template>
    </WorkspaceShell>

    <ChatWorkspaceLeftSheet :appearance="resolvedAppearance" :sidebar-title="props.sidebarTitle">
      <slot v-if="$slots['mobile-left']" name="mobile-left" />
      <slot v-else-if="$slots.left" name="left" />
    </ChatWorkspaceLeftSheet>

    <ChatWorkspaceRightSheet :appearance="resolvedAppearance">
      <slot v-if="$slots['mobile-right']" name="mobile-right" />
      <slot v-else-if="$slots.right" name="right" />
    </ChatWorkspaceRightSheet>
  </div>
</template>

<style scoped>
.tr-chat-workspace-layout {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

:deep(.tr-chat-workspace-layout .tr-workspace-shell) {
  --chat-header-height: 54px;
  --chat-header-padding: 0 20px;
  --chat-body-padding: 0 32px;
  --chat-footer-padding: 0 24px 24px;
  --chat-footer-inner-max-width: min(100%, 1240px);
  --chat-bubble-list-max-width: min(100%, 920px);
  --chat-welcome-area-max-width: min(100%, 1120px);
  --chat-welcome-prompts-max-width: min(100%, 980px);
  --chat-body-overlay-workspace: none;
  --chat-footer-bg: transparent;
  --chat-footer-overlay-bg: transparent;
  --tr-sender-box-shadow:
    0 18px 42px rgba(15, 23, 42, 0.06), 0 2px 10px rgba(15, 23, 42, 0.03),
    inset 0 0 0 1px color-mix(in srgb, var(--chat-panel-border) 72%, transparent);
  --tr-sender-padding: 18px 22px;
  --tr-sender-footer-padding: 4px 14px 12px;
  --tr-sender-multi-main-padding: 18px 22px 10px;
  --tr-sender-border-radius: 24px;
}

:deep(.tr-chat-workspace-layout .tr-workspace-shell__center) {
  background: var(--workspace-shell-bg);
}

:deep(.tr-chat-workspace-layout .tr-chat) {
  background: transparent;
}

:deep(.tr-chat-workspace-layout .tr-chat__header) {
  background: transparent;
}

:deep(.tr-chat-workspace-layout .tr-chat__header-inner) {
  min-height: 54px;
}

:deep(.tr-chat-workspace-layout .tr-chat__body) {
  background: transparent;
}

:deep(.tr-chat-workspace-layout .tr-chat__welcome-area) {
  background: transparent;
}

:deep(.tr-chat-workspace-layout .tr-chat__welcome) {
  justify-content: flex-start;
  padding-top: clamp(84px, 11vh, 148px);
}

:deep(.tr-chat-workspace-layout .tr-chat__welcome-prompts) {
  padding: 24px 8px 8px;
}

:deep(.tr-chat-workspace-layout .tr-chat__body--workspace .tr-chat__bubble-list) {
  --gap: 20px;
  --padding: 44px 0 36px;
}

:deep(.tr-chat-workspace-layout .tr-chat__body--workspace .tr-bubble[data-role='assistant'] .tr-bubble__box) {
  max-width: min(72%, 720px);
}

:deep(.tr-chat-workspace-layout .tr-chat__body--workspace .tr-bubble[data-role='user'] .tr-bubble__box) {
  max-width: min(34%, 320px);
}

:deep(.tr-chat-workspace-layout .tr-chat__footer) {
  background: linear-gradient(
    180deg,
    transparent 0%,
    color-mix(in srgb, var(--workspace-shell-bg) 92%, transparent) 18%
  );
}

:deep(.tr-chat-workspace-layout .tr-chat__footer-inner) {
  padding-top: 18px;
}

:deep(.tr-chat-workspace-layout .tr-chat__footer-extra) {
  margin-bottom: 12px;
}

:deep(.tr-chat-workspace-layout .tr-chat-footer-content) {
  gap: 14px;
}

:deep(.tr-chat-workspace-layout .tr-chat-footer-tools) {
  gap: 10px;
}

@media (max-width: 900px) {
  :deep(.tr-chat-workspace-layout .tr-workspace-shell) {
    --chat-header-padding: 0 14px;
    --chat-body-padding: 0 18px;
    --chat-footer-padding: 0 16px 18px;
    --chat-footer-inner-max-width: 100%;
  }

  :deep(.tr-chat-workspace-layout .tr-chat__welcome) {
    padding-top: 32px;
  }

  :deep(.tr-chat-workspace-layout .tr-chat__body--workspace .tr-chat__bubble-list) {
    --padding: 28px 0 26px;
  }
}
</style>
