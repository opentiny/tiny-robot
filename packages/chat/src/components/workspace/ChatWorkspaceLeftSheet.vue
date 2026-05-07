<script setup lang="ts">
import { Comment, Fragment, computed, useSlots, type PropType, type VNode } from 'vue'
import { CHAT_UI_KEY, useRequiredInject } from '@/shared/context'
import type { ChatAppearanceConfig } from '@/types'
import ChatWorkspaceSidebar from './ChatWorkspaceSidebar.vue'
import ConditionalThemeProvider from '@/components/shared/ConditionalThemeProvider.vue'

defineOptions({ name: 'TrChatWorkspaceLeftSheet' })

defineSlots<{
  default?: () => unknown
}>()

const props = defineProps({
  appearance: Object as PropType<ChatAppearanceConfig | undefined>,
  sidebarTitle: String,
})

const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const slots = useSlots()
const shouldRender = computed(() => chatUi.workspace.enabled.value && chatUi.workspace.isMobile.value)
const isOpen = computed(() => shouldRender.value && chatUi.workspace.left.visible.value)
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

function isSidebarVNode(node: VNode) {
  if (node.type === ChatWorkspaceSidebar) return true
  if (typeof node.type !== 'object' || node.type === null) return false
  const component = node.type as { name?: string; __name?: string }
  return (
    component.name === 'TrChatWorkspaceSidebar' ||
    component.__name === 'TrChatWorkspaceSidebar' ||
    component.name === 'TrChatWorkspaceSidebarShell' ||
    component.__name === 'TrChatWorkspaceSidebarShell'
  )
}

const slotContainsSidebar = computed(() =>
  flattenSlotNodes((slots.default?.() ?? []) as VNode[]).some((node) => isSidebarVNode(node)),
)
</script>

<template>
  <template v-if="shouldRender">
    <div class="tr-chat-drawer-overlay" :class="{ 'is-open': isOpen }" @click="chatUi.workspace.left.close()" />

    <ConditionalThemeProvider :appearance="appearance" scope-id-prefix="tr-chat-left-sheet-theme">
      <template #default="{ themeScopeId }">
        <div :id="themeScopeId" class="tr-chat-drawer" :class="{ 'is-open': isOpen }">
          <slot v-if="slotContainsSidebar" />
          <ChatWorkspaceSidebar v-else mobile :title="props.sidebarTitle">
            <slot />
          </ChatWorkspaceSidebar>
        </div>
      </template>
    </ConditionalThemeProvider>
  </template>
</template>

<style scoped lang="less">
.tr-chat-drawer {
  :deep(.tr-chat-workspace-sidebar-shell) {
    flex: 1;
    min-height: 0;
  }
}
</style>
