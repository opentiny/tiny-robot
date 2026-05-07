<script setup lang="ts">
import { inject, computed } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import { CHAT_ATTACHMENTS_KEY, CHAT_RUNTIME_KEY } from '@/shared/context'
import type { ChatRuntime } from '@/types'

defineOptions({ name: 'TrChatAttachments' })

const attachmentsContext = inject(CHAT_ATTACHMENTS_KEY, null)
const chatRuntime = inject<ChatRuntime | null>(CHAT_RUNTIME_KEY, null)

const attachments = computed(
  () => attachmentsContext?.manager.items.value ?? chatRuntime?.sender.pendingAttachments.value ?? [],
)
const listProps = computed(() => attachmentsContext?.feature.list ?? chatRuntime?.attachments?.listConfig?.value ?? {})
const hasAttachmentsOwner = computed(() => Boolean(attachmentsContext || chatRuntime?.attachments))

function handleUpdate(items: typeof attachments.value) {
  if (attachmentsContext) {
    attachmentsContext.manager.setItems(items)
    return
  }

  chatRuntime?.sender.setPendingAttachments(items)
}
</script>

<template>
  <div
    v-if="hasAttachmentsOwner && attachments.length > 0"
    class="tr-chat-attachments-area"
    data-testid="chat-attachments-area"
  >
    <TrAttachments :items="attachments" v-bind="listProps" @update:items="handleUpdate" />
  </div>
</template>
