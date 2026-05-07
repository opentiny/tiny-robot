<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import { toolPlugin } from '@opentiny/tiny-robot-kit'
import { useChatAttachments } from '@/components/attachments/useChatAttachments'
import { useHistoryState } from '@/components/history/useHistoryState'
import {
  CHAT_ATTACHMENTS_KEY,
  CHAT_HISTORY_KEY,
  CHAT_KIT_KEY,
  CHAT_MESSAGES_KEY,
  CHAT_RUNTIME_KEY,
  CHAT_SENDER_ACTIONS_KEY,
  CHAT_UI_KEY,
  MCP_MANAGER_KEY,
  createChatUiContext,
} from '@/shared/context'
import { resolveChatMessages } from '@/shared/messages'
import type { TrChatProviderProps } from '@/types'
import { resolveProviderRuntime } from '@/runtime/config/resolveProviderRuntime'

defineOptions({ name: 'TrChatProvider' })

const props = defineProps<TrChatProviderProps>()
const runtime = inject(CHAT_RUNTIME_KEY, null)

const providerRuntime = resolveProviderRuntime('TrChatProvider', {
  ...props,
  plugins: [
    ...(props.plugins ?? []),
    ...(props.mcpManager
      ? [
          toolPlugin({
            getTools: () => props.mcpManager!.getTools(),
            callTool: (toolCall) => props.mcpManager!.callTool(toolCall),
          }),
        ]
      : []),
  ],
})
const shell = computed(() => props.shell)
const chatUi = createChatUiContext({ historyDisplay: 'drawer', shell, workspaceRuntime: runtime?.workspace })
const chatMessages = computed(() => resolveChatMessages(props.messages))
const attachmentsFeature = props.attachmentsFeature
const attachmentsManager = props.attachmentsManager ?? (attachmentsFeature ? useChatAttachments() : null)
const historyState = useHistoryState()

provide(CHAT_KIT_KEY, providerRuntime)
provide(CHAT_UI_KEY, chatUi)
provide(CHAT_MESSAGES_KEY, chatMessages)
provide(CHAT_HISTORY_KEY, historyState)
if (props.mcpManager) {
  provide(MCP_MANAGER_KEY, props.mcpManager)
}
if (attachmentsManager && attachmentsFeature) {
  provide(CHAT_ATTACHMENTS_KEY, {
    manager: attachmentsManager,
    feature: attachmentsFeature,
  })
}
if (props.senderActionsFeature) {
  provide(CHAT_SENDER_ACTIONS_KEY, {
    feature: props.senderActionsFeature,
  })
}
</script>

<template>
  <slot />
</template>
