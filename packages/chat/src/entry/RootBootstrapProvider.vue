<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import { useChatAttachments } from '@/components/attachments/useChatAttachments'
import type { UseChatAttachmentsReturn } from '@/components/attachments/useChatAttachments'
import { useHistoryState } from '@/components/history/useHistoryState'
import {
  CHAT_ATTACHMENTS_KEY,
  CHAT_HISTORY_KEY,
  CHAT_KIT_KEY,
  CHAT_MESSAGES_KEY,
  CHAT_RUNTIME_KEY,
  CHAT_UI_KEY,
  createChatUiContext,
} from '@/shared/context'
import { resolveChatMessages } from '@/shared/messages'
import type { ChatAttachmentsFeaturePreset, ChatMessagesOverrides, ChatWorkspaceShellConfig } from '@/types'
import type { UseChatKitReturn } from '@/types/core'

defineOptions({ name: 'RootBootstrapProvider' })

const props = defineProps<{
  chatKit: UseChatKitReturn
  attachmentsManager?: UseChatAttachmentsReturn
  attachmentsFeature?: ChatAttachmentsFeaturePreset
  messages?: ChatMessagesOverrides
  shell?: ChatWorkspaceShellConfig
}>()

const runtime = inject(CHAT_RUNTIME_KEY, null)
const shell = computed(() => props.shell)
const chatUi = createChatUiContext({
  historyDisplay: 'drawer',
  shell,
  workspaceRuntime: runtime?.workspace,
})
const chatMessages = computed(() => resolveChatMessages(props.messages))
const attachmentsManager = props.attachmentsManager ?? (props.attachmentsFeature ? useChatAttachments() : null)
const historyState = useHistoryState()

provide(CHAT_KIT_KEY, props.chatKit)
provide(CHAT_UI_KEY, chatUi)
provide(CHAT_MESSAGES_KEY, chatMessages)
provide(CHAT_HISTORY_KEY, historyState)
if (attachmentsManager && props.attachmentsFeature) {
  provide(CHAT_ATTACHMENTS_KEY, {
    manager: attachmentsManager,
    feature: props.attachmentsFeature,
  })
}
</script>

<template>
  <slot />
</template>
