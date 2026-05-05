<script setup lang="ts">
import { Comment, Fragment, computed, useSlots, type PropType, type VNode } from 'vue'
import { CHAT_UI_KEY, useRequiredInject } from '@/shared/context'
import type { ChatAppearanceConfig } from '@/types'
import ChatWorkspaceRightPanel from './ChatWorkspaceRightPanel.vue'
import ConditionalThemeProvider from '@/components/shared/ConditionalThemeProvider.vue'

defineOptions({ name: 'TrChatWorkspaceRightSheet' })

defineSlots<{
  default?: () => unknown
}>()

const props = defineProps({
  appearance: Object as PropType<ChatAppearanceConfig | undefined>,
})

const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const slots = useSlots()
const shouldRender = computed(() => chatUi.workspace.enabled.value && chatUi.workspace.isMobile.value)
const isOpen = computed(() => shouldRender.value && chatUi.workspace.right.visible.value)
const appearance = computed(() => props.appearance)

function flattenSlotNodes(nodes: VNode[]): VNode[] {
  const flattened: VNode[] = []
  for (const node of nodes) {
    if (node.type === Comment) continue
    if (node.type === Fragment && Array.isArray(node.children)) {
      flattened.push(...flattenSlotNodes(node.children as VNode[]))
      continue
    }
    flattened.push(node)
  }
  return flattened
}

function isRightPanelVNode(node: VNode) {
  if (node.type === ChatWorkspaceRightPanel) return true
  if (typeof node.type !== 'object' || node.type === null) return false
  const component = node.type as { name?: string; __name?: string }
  return component.name === 'TrChatWorkspaceRightPanel' || component.__name === 'TrChatWorkspaceRightPanel'
}

const slotContainsRightPanel = computed(() =>
  flattenSlotNodes((slots.default?.() ?? []) as VNode[]).some((node) => isRightPanelVNode(node)),
)
</script>

<template>
  <template v-if="shouldRender">
    <div
      class="tr-chat-workspace-right-sheet__overlay"
      :class="{ 'is-open': isOpen }"
      @click="chatUi.workspace.right.close()"
    />

    <ConditionalThemeProvider :appearance="appearance" scope-id-prefix="tr-chat-right-sheet-theme">
      <template #default="{ themeScopeId }">
        <div :id="themeScopeId" class="tr-chat-workspace-right-sheet" :class="{ 'is-open': isOpen }">
          <slot v-if="slotContainsRightPanel" />
          <ChatWorkspaceRightPanel v-else mobile>
            <slot />
          </ChatWorkspaceRightPanel>
        </div>
      </template>
    </ConditionalThemeProvider>
  </template>
</template>

<style scoped lang="less">
.tr-chat-workspace-right-sheet__overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  background: var(--chat-workspace-overlay-bg, rgba(15, 23, 42, 0.28));
  backdrop-filter: blur(2px);
  transition: opacity 0.22s ease;

  &.is-open {
    opacity: 1;
    pointer-events: auto;
  }
}

.tr-chat-workspace-right-sheet {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: auto;
  z-index: 100;
  width: min(100%, var(--chat-workspace-sheet-width, 420px));
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--chat-workspace-panel-bg, var(--tr-container-bg-default, #fff));
  border-left: 1px solid var(--chat-workspace-border, rgba(15, 23, 42, 0.08));
  transform: translateX(100%);
  transition: transform 0.28s ease;

  &.is-open {
    transform: translateX(0);
  }

  :deep(.tr-chat-workspace-right-panel) {
    flex: 1;
    min-height: 0;
  }
}

@media (max-width: 640px) {
  .tr-chat-workspace-right-sheet {
    width: 100%;
    max-width: 100%;
    border-left: 0;
    box-shadow: none;
  }
}
</style>
